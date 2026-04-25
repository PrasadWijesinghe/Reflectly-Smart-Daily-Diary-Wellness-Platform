const { pipeline, env } = require("@xenova/transformers");
const fs = require("fs");
const path = require("path");
const audioDecode = require("audio-decode");
const { incrementTranscriptionRequest } = require("../utils/metrics");

env.allowLocalModels = false;

const WHISPER_SAMPLE_RATE = 16000;

let transcriber = null;

const resample = (input, inputRate, outputRate) => {
  if (inputRate === outputRate) return input;

  const ratio = input.length * (outputRate / inputRate);
  const output = new Float32Array(Math.round(ratio));

  for (let i = 0; i < output.length; i++) {
    const srcIdx = (i / outputRate) * inputRate;
    const lo = Math.floor(srcIdx);
    const hi = Math.min(lo + 1, input.length - 1);
    const t = srcIdx - lo;
    output[i] = input[lo] * (1 - t) + input[hi] * t;
  }

  return output;
};

const getTranscriber = async () => {
  if (transcriber) return transcriber;

  console.log("[Transcribe] Loading Whisper model...");

  transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-base.en", {
    progress_callback: (progress) => {
      if (progress.status === "progress") {
        console.log(`[Transcribe] Model download: ${progress.progress?.toFixed(1) ?? 0}%`);
      }
    },
  });

  console.log("[Transcribe] Whisper model loaded.");
  return transcriber;
};

const transcribe = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided." });
    }

    const audioPath = req.file.path;
    console.log(`[Transcribe] Received audio: ${path.basename(audioPath)}`);

    const audioBuffer = fs.readFileSync(audioPath);
    const decoded = audioDecode.default
      ? audioDecode.default(audioBuffer)
      : audioDecode(audioBuffer);

    const audioData = await decoded;
    const channelData = audioData.channelData;

    let mono = channelData[0];
    if (channelData.length > 1) {
      const len = Math.min(channelData[0].length, channelData[1].length);
      mono = new Float32Array(len);
      for (let i = 0; i < len; i++) {
        mono[i] = (channelData[0][i] + channelData[1][i]) / 2;
      }
    }

    const resampled = resample(mono, audioData.sampleRate, WHISPER_SAMPLE_RATE);
    console.log(`[Transcribe] Resampled: ${mono.length} -> ${resampled.length} samples @ ${WHISPER_SAMPLE_RATE}Hz`);

    fs.unlinkSync(audioPath);

    const transcriberPipeline = await getTranscriber();
    const result = await transcriberPipeline(resampled, {
      language: "en",
      task: "transcribe",
    });

    console.log(`[Transcribe] Done: "${result.text}"`);
    incrementTranscriptionRequest("success");
    res.json({ text: result.text });
  } catch (err) {
    console.error("[Transcribe] Error:", err.message);
    incrementTranscriptionRequest("failure");
    res.status(500).json({ error: "Transcription failed. Please try again." });
  }
};

module.exports = { transcribe };
