import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (skip if tables don't exist)
    await prisma.surveyResponse.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.question.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Cleared existing data');
  } catch (error: any) {
    console.log('⚠️  Skipping clear (tables might be new):', error.message);
  }

  // Create survey questions organized by category
  const questions = [
    // Core Values (5 questions)
    {
      category: 'Core Values',
      questionText: 'What is most important to you in a relationship?',
      questionType: 'multiple_choice',
      options: ['Trust and honesty', 'Emotional support', 'Shared goals', 'Personal growth', 'Adventure'],
      weight: 2.0,
      orderIndex: 1,
    },
    {
      category: 'Core Values',
      questionText: 'How do you feel about commitment?',
      questionType: 'multiple_choice',
      options: ['Ready for serious relationship', 'Taking it slow', 'Keeping it casual', 'Not sure yet'],
      weight: 2.0,
      orderIndex: 2,
    },
    {
      category: 'Core Values',
      questionText: 'Which quality is most attractive to you?',
      questionType: 'multiple_choice',
      options: ['Kindness', 'Ambition', 'Sense of humor', 'Intelligence', 'Confidence'],
      weight: 1.8,
      orderIndex: 3,
    },
    {
      category: 'Core Values',
      questionText: 'What is your biggest relationship dealbreaker?',
      questionType: 'multiple_choice',
      options: ['Dishonesty', 'Lack of ambition', 'Poor communication', 'Disrespect', 'All of these'],
      weight: 2.5,
      orderIndex: 4,
    },
    {
      category: 'Core Values',
      questionText: 'How important is family approval in your relationships?',
      questionType: 'multiple_choice',
      options: ['Very important', 'Somewhat important', 'Not very important', 'Not important at all'],
      weight: 1.5,
      orderIndex: 5,
    },

    // Lifestyle (5 questions)
    {
      category: 'Lifestyle',
      questionText: 'What does your ideal Friday night look like?',
      questionType: 'multiple_choice',
      options: ['Studying', 'Partying', 'Netflix at home', 'Hanging out with friends', 'Exercising'],
      weight: 1.5,
      orderIndex: 6,
    },
    {
      category: 'Lifestyle',
      questionText: 'Are you a morning person or a night owl?',
      questionType: 'multiple_choice',
      options: ['Definitely morning person', 'More morning than night', 'More night than morning', 'Definitely night owl'],
      weight: 1.2,
      orderIndex: 7,
    },
    {
      category: 'Lifestyle',
      questionText: 'What is your ideal weekend activity?',
      questionType: 'multiple_choice',
      options: ['Outdoor adventure', 'Sleeping in', 'Food trip', 'Gaming', 'Spending time with family'],
      weight: 1.3,
      orderIndex: 8,
    },
    {
      category: 'Lifestyle',
      questionText: 'How often do you like to go out?',
      questionType: 'multiple_choice',
      options: ['Every day', 'Several times a week', 'Once a week', 'Rarely', 'Never'],
      weight: 1.0,
      orderIndex: 9,
    },
    {
      category: 'Lifestyle',
      questionText: 'What is your go-to comfort food?',
      questionType: 'multiple_choice',
      options: ['Pizza', 'Ice cream', 'Fried chicken', 'Chocolate', 'Rice meals'],
      weight: 1.0,
      orderIndex: 10,
    },

    // Personality (5 questions)
    {
      category: 'Personality',
      questionText: 'How do you handle conflicts in a relationship?',
      questionType: 'multiple_choice',
      options: ['Talk it out immediately', 'Take time to cool off', 'Avoid confrontation', 'Compromise quickly', 'Ask for advice'],
      weight: 1.8,
      orderIndex: 11,
    },
    {
      category: 'Personality',
      questionText: 'How would you describe your personality?',
      questionType: 'multiple_choice',
      options: ['Very introverted', 'Somewhat introverted', 'Ambivert', 'Somewhat extroverted', 'Very extroverted'],
      weight: 1.6,
      orderIndex: 12,
    },
    {
      category: 'Personality',
      questionText: 'How do you make important decisions?',
      questionType: 'multiple_choice',
      options: ['Follow my gut', 'Analyze all options', 'Ask friends/family', 'Make a pros/cons list', 'Flip a coin'],
      weight: 1.5,
      orderIndex: 13,
    },
    {
      category: 'Personality',
      questionText: 'What is your love language?',
      questionType: 'multiple_choice',
      options: ['Words of affirmation', 'Quality time', 'Physical touch', 'Acts of service', 'Gifts'],
      weight: 1.7,
      orderIndex: 14,
    },
    {
      category: 'Personality',
      questionText: 'How openly do you express your feelings?',
      questionType: 'multiple_choice',
      options: ['Very openly', 'Openly', 'Somewhat reserved', 'Very reserved', 'Depends on the person'],
      weight: 1.5,
      orderIndex: 15,
    },

    // Fun & Preferences (5 questions)
    {
      category: 'Fun',
      questionText: 'What is your ideal first date?',
      questionType: 'multiple_choice',
      options: ['Coffee date', 'Dinner at a restaurant', 'Movie night', 'Adventure/activity', 'Just walking around'],
      weight: 1.2,
      orderIndex: 16,
    },
    {
      category: 'Fun',
      questionText: 'What type of movies/series do you prefer?',
      questionType: 'multiple_choice',
      options: ['Rom-com', 'Action/Adventure', 'Horror/Thriller', 'Sci-Fi/Fantasy', 'Documentary'],
      weight: 1.0,
      orderIndex: 17,
    },
    {
      category: 'Fun',
      questionText: 'What music do you listen to most?',
      questionType: 'multiple_choice',
      options: ['OPM', 'Pop', 'Hip-hop/R&B', 'Rock', 'Classical/Lo-fi'],
      weight: 1.0,
      orderIndex: 18,
    },
    {
      category: 'Fun',
      questionText: 'How active are you on social media?',
      questionType: 'multiple_choice',
      options: ['Very active', 'Active', 'Moderately active', 'Rarely active', 'Not active at all'],
      weight: 1.0,
      orderIndex: 19,
    },
    {
      category: 'Fun',
      questionText: 'What is your biggest pet peeve?',
      questionType: 'multiple_choice',
      options: ['Slow replies', 'Bad grammar', 'Loud chewing', 'Being late', 'People who are rude'],
      weight: 1.1,
      orderIndex: 20,
    },
  ];

  // Create questions
  for (const question of questions) {
    await prisma.question.create({
      data: {
        ...question,
        isActive: true,
      },
    });
  }

  console.log(`✅ Created ${questions.length} survey questions`);

  // Create admin settings
  await prisma.adminSetting.create({
    data: {
      settingKey: 'match_release_date',
      settingValue: '2026-02-05T00:00:00Z',
    },
  });

  await prisma.adminSetting.create({
    data: {
      settingKey: 'registration_open',
      settingValue: 'true',
    },
  });

  console.log('✅ Created admin settings');

  // Create sample testimonials
  await prisma.testimonial.createMany({
    data: [
      {
        name: 'Anonymous Wizard',
        email: 'anon@wizardmatch.ai',
        heading: 'Matched on values!',
        content: 'We were matched 98% and it showed. We share the same values and goals. Thanks Wizard Match!',
        isApproved: true,
        isPublished: true,
      },
      {
        name: 'Magic Lovebirds',
        email: 'lovebirds@wizardmatch.ai',
        heading: 'The survey really works',
        content: 'I was skeptical at first, but the algorithm found someone who complements me perfectly. We\'ve been dating for 6 months now!',
        isApproved: true,
        isPublished: true,
      },
      {
        name: 'Happy Student',
        email: 'happy@wizardmatch.ai',
        heading: 'Romance done right',
        content: 'Met my partner through Wizard Match. We had no idea we had so much in common until the survey brought us together.',
        isApproved: true,
        isPublished: true,
      },
    ],
  });

  console.log('✅ Created sample testimonials');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
