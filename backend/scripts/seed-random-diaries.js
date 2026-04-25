require('dotenv').config();
const prisma = require('../src/utils/prisma');

const THEMES = [
  {
    type: 'stressful',
    tagIds: [15], // Stress
    contents: [
      "I had a really overwhelming day today. There were so many tasks piled up and I just couldn't think straight. It made me feel extremely anxious.",
      "The pressure is getting to me. Everything seems out of control and panic is setting in. I need a break badly.",
      "Burnout is real. Another day filled with constant stress and anxiety, barely holding it together."
    ],
    summaries: [
      "Overwhelming day filled with anxiety.",
      "Feeling pressured and out of control.",
      "Experiencing burnout and high stress."
    ]
  },
  {
    type: 'cool',
    tagIds: [11], // Relax
    contents: [
      "Today was really chill and peacefull. I had a great time just hanging out and enjoying a calm atmosphere.",
      "I felt super relaxed today. Everything was smooth and I didn't worry about anything. So calm.",
      "What a nice and great day! I spent some time relaxing and doing exactly what I wanted."
    ],
    summaries: [
      "A peaceful and chilling day.",
      "Super relaxed and calm atmosphere.",
      "Great day spent relaxing."
    ]
  },
  {
    type: 'tired',
    tagIds: [4], // Rest
    contents: [
      "I'm completely exhausted. My energy is so low, I just want to sleep for hours. Such a tiring day.",
      "Barely had the energy to get out of bed today. Moving felt like a chore. Very low energy.",
      "I feel drained. Today took everything out of me, and I just need to rest and recover."
    ],
    summaries: [
      "Completely exhausted and need sleep.",
      "Low energy throughout the day.",
      "Feeling drained and needing rest."
    ]
  },
  {
    type: 'work',
    tagIds: [1], // Work
    contents: [
      "Lots of meetings today at work. We managed to make some good progress on the project, but it took a lot of effort.",
      "Focused heavily on work today. Had to solve some tough bugs, but I feel productive.",
      "Just a typical work day. Pushing through tasks and coordinating with the team."
    ],
    summaries: [
      "Busy with meetings and project progress.",
      "Productive day at work solving problems.",
      "Typical work day with the team."
    ]
  }
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedUserDiaries(email) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim() }
  });

  if (!user) {
    console.error(`User with email ${email} not found.`);
    process.exit(1);
  }

  console.log(`Seeding entries for user: ${user.name} (${user.email})`);

  // the previous 14 days including today
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let successCount = 0;

  for (let i = 0; i < 14; i++) {
    const targetDate = new Date(today);
    targetDate.setUTCDate(today.getUTCDate() - i);

    const theme = getRandomItem(THEMES);
    const content = getRandomItem(theme.contents);
    const summary = getRandomItem(theme.summaries);

    try {
      // Check if entry already exists
      const existing = await prisma.dailyDiary.findFirst({
        where: {
          userId: user.id,
          date: targetDate
        }
      });

      if (existing) {
        console.log(`[SKIP] Entry already exists for ${targetDate.toISOString().split('T')[0]}`);
        continue;
      }

      await prisma.dailyDiary.create({
        data: {
          content,
          summary,
          date: targetDate,
          userId: user.id,
          tags: {
            connect: theme.tagIds.map(id => ({ id }))
          }
        }
      });
      console.log(`[OK] Created ${theme.type} entry for ${targetDate.toISOString().split('T')[0]}`);
      successCount++;
    } catch (err) {
      console.error(`[ERROR] Failed to create entry for ${targetDate.toISOString().split('T')[0]}: ${err.message}`);
    }
  }

  console.log(`\nSuccessfully seeded ${successCount} random diary entries for ${user.email}.`);
  process.exit(0);
}

const emailArg = process.argv[2];

if (!emailArg) {
  console.log('Please provide your user email. Example:');
  console.log('node seed-random-diaries.js user@example.com');
  process.exit(1);
}

seedUserDiaries(emailArg).catch(err => {
  console.error(err);
  process.exit(1);
});
