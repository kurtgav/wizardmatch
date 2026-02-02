import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create sample campaign for Valentine's 2026
  const campaign = await prisma.campaign.upsert({
    where: { id: 'valentines-2026' },
    update: {},
    create: {
      id: 'valentines-2026',
      name: "Valentine's 2026 Matching",
      surveyOpenDate: new Date('2026-02-05T00:00:00Z'),
      surveyCloseDate: new Date('2026-02-10T23:59:59Z'),
      profileUpdateStartDate: new Date('2026-02-11T00:00:00Z'),
      profileUpdateEndDate: new Date('2026-02-13T23:59:59Z'),
      resultsReleaseDate: new Date('2026-02-14T00:00:00Z'),
      isActive: true,
      totalParticipants: 0,
      totalMatchesGenerated: 0,
      algorithmVersion: '2.0',
      config: {
        weights: {
          demographics: 0.10,
          personality: 0.30,
          values: 0.25,
          lifestyle: 0.20,
          interests: 0.15,
        },
        matchesPerUser: 7,
        minimumThreshold: 50,
      },
    },
  });

  console.log('Created campaign:', campaign.name);

  // Create sample questions
  const questions = [
    {
      category: 'demographics',
      questionText: 'What is your gender?',
      questionType: 'multiple_choice',
      options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
      weight: 1.0,
      orderIndex: 1,
      campaignId: campaign.id,
    },
    {
      category: 'demographics',
      questionText: 'What gender are you interested in matching with?',
      questionType: 'multiple_choice',
      options: ['Male', 'Female', 'Non-binary', 'Any'],
      weight: 1.0,
      orderIndex: 2,
      campaignId: campaign.id,
    },
    {
      category: 'personality',
      questionText: 'I prefer spending my free time...',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Alone', 3: 'With small groups', 5: 'At large parties' } },
      weight: 1.2,
      orderIndex: 3,
      campaignId: campaign.id,
    },
    {
      category: 'personality',
      questionText: 'I make decisions based on...',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Logic/Facts', 5: 'Emotions/Feelings' } },
      weight: 1.0,
      orderIndex: 4,
      campaignId: campaign.id,
    },
    {
      category: 'values',
      questionText: 'How important is religion/spirituality in your life?',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Not at all', 5: 'Very important' } },
      weight: 1.5,
      orderIndex: 5,
      campaignId: campaign.id,
    },
    {
      category: 'values',
      questionText: 'What are your future plans after graduation?',
      questionType: 'multiple_choice',
      options: ['Work immediately', 'Graduate studies', 'Travel/Gap year', 'Start a business', 'Undecided'],
      weight: 1.0,
      orderIndex: 6,
      campaignId: campaign.id,
    },
    {
      category: 'lifestyle',
      questionText: 'When do you typically go to bed on weeknights?',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Before 10 PM', 3: '10 PM - 12 AM', 5: 'After 12 AM' } },
      weight: 1.0,
      orderIndex: 7,
      campaignId: campaign.id,
    },
    {
      category: 'lifestyle',
      questionText: 'How often do you like to go out/socialize?',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Rarely', 3: 'A few times a month', 5: 'Several times a week' } },
      weight: 1.0,
      orderIndex: 8,
      campaignId: campaign.id,
    },
    {
      category: 'interests',
      questionText: 'Which activities do you enjoy? (Select all that apply)',
      questionType: 'multiple_select',
      options: ['Sports & Fitness', 'Music & Concerts', 'Gaming', 'Art & Creativity', 'Outdoor Adventures', 'Reading', 'Cooking', 'Nightlife/Parties', 'Volunteering', 'Academic Clubs'],
      weight: 0.8,
      orderIndex: 9,
      campaignId: campaign.id,
    },
  ];

  for (const question of questions) {
    await prisma.question.upsert({
      where: { id: `${campaign.id}-${question.orderIndex}` },
      update: {},
      create: {
        id: `${campaign.id}-${question.orderIndex}`,
        ...question,
      },
    });
  }

  console.log(`Created ${questions.length} questions`);

  // Create admin settings
  await prisma.adminSetting.upsert({
    where: { settingKey: 'maintenance_mode' },
    update: {},
    create: {
      settingKey: 'maintenance_mode',
      settingValue: false,
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
