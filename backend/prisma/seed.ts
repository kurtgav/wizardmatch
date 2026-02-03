import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create sample campaign for Valentine's 2026 - No date restrictions
  const campaign = await prisma.campaign.upsert({
    where: { id: 'valentines-2026' },
    update: {
      surveyOpenDate: new Date('2020-01-01T00:00:00Z'),
      resultsReleaseDate: new Date('2020-01-01T00:00:00Z'), // Always released
      isActive: true,
    },
    create: {
      id: 'valentines-2026',
      name: "Wizard Match 2026",
      surveyOpenDate: new Date('2020-01-01T00:00:00Z'),
      surveyCloseDate: new Date('2030-12-31T23:59:59Z'),
      profileUpdateStartDate: new Date('2020-01-01T00:00:00Z'),
      profileUpdateEndDate: new Date('2030-12-31T23:59:59Z'),
      resultsReleaseDate: new Date('2020-01-01T00:00:00Z'),
      isActive: true,
      totalParticipants: 0,
      totalMatchesGenerated: 0,
      algorithmVersion: '2.0',
      config: {
        weights: {
          demographics: 0.10,
          personality: 0.25,
          values: 0.25,
          lifestyle: 0.20,
          interests: 0.20,
        },
        matchesPerUser: 10,
        minimumThreshold: 40,
      },
    },
  });

  console.log('Created campaign:', campaign.name);

  // Create 20 questions
  const questions = [
    // DEMOGRAPHICS (2)
    {
      id: `${campaign.id}-1`,
      category: 'demographics',
      questionText: 'What is your gender?',
      questionType: 'multiple_choice',
      options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
      weight: 1.0,
      orderIndex: 1,
    },
    {
      id: `${campaign.id}-2`,
      category: 'demographics',
      questionText: 'What gender are you interested in matching with?',
      questionType: 'multiple_choice',
      options: ['Male', 'Female', 'Non-binary', 'Any'],
      weight: 1.0,
      orderIndex: 2,
    },
    // PERSONALITY (5)
    {
      id: `${campaign.id}-3`,
      category: 'personality',
      questionText: 'I prefer spending my free time...',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Alone', 3: 'With friends', 5: 'Big crowds' } },
      weight: 1.2,
      orderIndex: 3,
    },
    {
      id: `${campaign.id}-4`,
      category: 'personality',
      questionText: 'I make decisions based on...',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Logic', 3: 'Balance', 5: 'Emotions' } },
      weight: 1.0,
      orderIndex: 4,
    },
    {
      id: `${campaign.id}-5`,
      category: 'personality',
      questionText: 'How adventurous are you when it comes to trying new things?',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Playing it safe', 5: 'Risk taker' } },
      weight: 1.0,
      orderIndex: 5,
    },
    {
      id: `${campaign.id}-6`,
      category: 'personality',
      questionText: 'In a group setting, I am typically the...',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Listener', 5: 'Talker' } },
      weight: 1.1,
      orderIndex: 6,
    },
    {
      id: `${campaign.id}-7`,
      category: 'personality',
      questionText: 'My level of organization is...',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Chaotic', 5: 'Perfectly organized' } },
      weight: 1.0,
      orderIndex: 7,
    },
    // VALUES (4)
    {
      id: `${campaign.id}-8`,
      category: 'values',
      questionText: 'How important is professional success to you?',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Meh', 5: 'Top Priority' } },
      weight: 1.3,
      orderIndex: 8,
    },
    {
      id: `${campaign.id}-9`,
      category: 'values',
      questionText: 'I believe honesty is ALWAYS the best policy.',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Disagree', 5: 'Agree' } },
      weight: 1.5,
      orderIndex: 9,
    },
    {
      id: `${campaign.id}-10`,
      category: 'values',
      questionText: 'How important are family traditions to you?',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Not at all', 5: 'Extremely' } },
      weight: 1.2,
      orderIndex: 10,
    },
    {
      id: `${campaign.id}-11`,
      category: 'values',
      questionText: 'I value physical attraction over intellectual connection.',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Intellect', 5: 'Physical' } },
      weight: 1.0,
      orderIndex: 11,
    },
    // LIFESTYLE (4)
    {
      id: `${campaign.id}-12`,
      category: 'lifestyle',
      questionText: 'What is your ideal wake-up time?',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Early bird', 5: 'Night owl' } },
      weight: 1.0,
      orderIndex: 12,
    },
    {
      id: `${campaign.id}-13`,
      category: 'lifestyle',
      questionText: 'How much do you enjoy traveling?',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Homebody', 5: 'World traveler' } },
      weight: 1.1,
      orderIndex: 13,
    },
    {
      id: `${campaign.id}-14`,
      category: 'lifestyle',
      questionText: 'How many times a week do you prefer to eat out?',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Rarely', 5: 'Every day' } },
      weight: 0.9,
      orderIndex: 14,
    },
    {
      id: `${campaign.id}-15`,
      category: 'lifestyle',
      questionText: 'My social battery lasts...',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'An hour', 5: 'All night' } },
      weight: 1.0,
      orderIndex: 15,
    },
    // INTERESTS/FUN (5)
    {
      id: `${campaign.id}-16`,
      category: 'interests',
      questionText: 'I enjoy outdoor activities like hiking and sports.',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'No thanks', 5: 'Love it!' } },
      weight: 0.8,
      orderIndex: 16,
    },
    {
      id: `${campaign.id}-17`,
      category: 'interests',
      questionText: 'How often do you play video games or board games?',
      questionType: 'scale',
      options: { min: 1, max: 5, labels: { 1: 'Never', 5: 'Daily' } },
      weight: 0.7,
      orderIndex: 17,
    },
    {
      id: `${campaign.id}-18`,
      category: 'interests',
      questionText: 'Which music genre do you prefer?',
      questionType: 'multiple_choice',
      options: ['Pop/Mainstream', 'Rock/Indie', 'Hip-hop/RnB', 'Electronic', 'Classical/Jazz', 'Country'],
      weight: 0.6,
      orderIndex: 18,
    },
    {
      id: `${campaign.id}-19`,
      category: 'interests',
      questionText: 'Which of these is your favorite weekend activity?',
      questionType: 'multiple_choice',
      options: ['Movies/Netflix', 'Clubbing/Bars', 'Cafe hopping', 'Gym/Sports', 'Visiting family'],
      weight: 0.8,
      orderIndex: 19,
    },
    {
      id: `${campaign.id}-20`,
      category: 'interests',
      questionText: 'Are you a pet person?',
      questionType: 'multiple_choice',
      options: ['Dog person', 'Cat person', 'Both!', 'Neither', 'Exotic pets'],
      weight: 1.0,
      orderIndex: 20,
    },
  ];

  // Remove old data first to avoid index conflicts and foreign key constraints
  await prisma.surveyResponse.deleteMany({ where: { campaignId: campaign.id } });
  await prisma.match.deleteMany({ where: { campaignId: campaign.id } });
  await prisma.question.deleteMany({ where: { campaignId: campaign.id } });

  for (const question of questions) {
    await prisma.question.create({
      data: {
        ...question,
        campaignId: campaign.id,
      },
    });
  }

  console.log(`Created ${questions.length} questions`);

  // Create 3 sample users so the first real user has people to match with
  console.log('Creating sample Wizards...');
  const sampleUsers = [
    {
      id: 'wizard-merlin',
      email: 'merlin@wizardmatch.ai',
      studentId: 'ST-001',
      firstName: 'Merlin',
      lastName: 'The Wise',
      program: 'Arcane Arts',
      yearLevel: 5,
      surveyCompleted: true,
      bio: 'Enjoys long walks in the Forbidden Forest and collecting rare gems.',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    },
    {
      id: 'wizard-luna',
      email: 'luna@wizardmatch.ai',
      studentId: 'ST-002',
      firstName: 'Luna',
      lastName: 'Lovegood',
      program: 'Magizoology',
      yearLevel: 3,
      surveyCompleted: true,
      bio: 'Searching for Nargles and a kindred spirit.',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    },
    {
      id: 'wizard-harry',
      email: 'harry@wizardmatch.ai',
      studentId: 'ST-003',
      firstName: 'Harry',
      lastName: 'Potter',
      program: 'Defense Against Dark Arts',
      yearLevel: 4,
      surveyCompleted: true,
      bio: 'Just looking for someone as brave as a Gryffindor.',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    }
  ];

  for (const user of sampleUsers) {
    const createdUser = await prisma.user.upsert({
      where: { id: user.id },
      update: { surveyCompleted: true },
      create: user,
    });

    // Create random answers for them
    for (const q of questions) {
      let answerValue = undefined;
      let answerText = undefined;

      if (q.questionType === 'scale') {
        answerValue = Math.floor(Math.random() * 5) + 1;
      } else if (q.questionType === 'multiple_choice' && Array.isArray(q.options)) {
        answerText = (q.options as string[])[Math.floor(Math.random() * (q.options as string[]).length)];
      }

      await prisma.surveyResponse.upsert({
        where: {
          userId_questionId: {
            userId: createdUser.id,
            questionId: q.id,
          }
        },
        update: {},
        create: {
          userId: createdUser.id,
          questionId: q.id,
          campaignId: campaign.id,
          answerValue,
          answerText,
          answerType: q.questionType as any,
        }
      });
    }
  }

  // Create admin settings
  await prisma.adminSetting.upsert({
    where: { settingKey: 'maintenance_mode' },
    update: {},
    create: {
      settingKey: 'maintenance_mode',
      settingValue: false,
    },
  });

  await prisma.adminSetting.upsert({
    where: { settingKey: 'matchReleaseDate' },
    update: { settingValue: '2020-01-01T00:00:00Z' },
    create: {
      settingKey: 'matchReleaseDate',
      settingValue: '2020-01-01T00:00:00Z',
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
