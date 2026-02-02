import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting database seed via raw SQL...');

  try {
    // Create questions using raw SQL to bypass Prisma client issues
    await prisma.$executeRawUnsafe(`
      INSERT INTO questions (id, category, question_text, question_type, options, weight, order_index, is_active)
      VALUES
        (gen_random_uuid(), 'Core Values', 'What matters most to you in a relationship?', 'multiple_choice', '["Trust and honesty", "Emotional support", "Shared goals", "Personal growth", "Adventure"]'::jsonb, 2.0, 1, true),
        (gen_random_uuid(), 'Core Values', 'How important is family approval in your dating life?', 'scale', NULL, 1.5, 2, true),
        (gen_random_uuid(), 'Core Values', 'Your ideal future: career-focused, family-focused, or balanced?', 'multiple_choice', '["Career-focused", "Family-focused", "Work-life balance", "Still figuring it out"]'::jsonb, 2.0, 3, true),
        (gen_random_uuid(), 'Core Values', 'How do you view commitment in a relationship?', 'multiple_choice', '["Serious from the start", "Build trust gradually", "Take it day by day", "Keep things casual"]'::jsonb, 1.8, 4, true),
        (gen_random_uuid(), 'Core Values', 'Dealbreaker: Which of these is unacceptable to you?', 'multiple_choice', '["Lack of ambition", "Dishonesty", "Poor communication", "Disrespect", "All of the above"]'::jsonb, 2.5, 5, true),

        (gen_random_uuid(), 'Lifestyle', 'Typical Friday night: Study group, party, Netflix, or gym?', 'multiple_choice', '["Study group", "Partying", "Netflix at home", "Gym/Exercise", "Food trip with friends"]'::jsonb, 1.5, 6, true),
        (gen_random_uuid(), 'Lifestyle', 'Are you a morning person or night owl?', 'scale', NULL, 1.2, 7, true),
        (gen_random_uuid(), 'Lifestyle', 'Coffee order preference?', 'multiple_choice', '["Black coffee", "Sweet and creamy", "Iced coffee all the way", "Milk tea person", "I don''t drink coffee"]'::jsonb, 1.0, 8, true),
        (gen_random_uuid(), 'Lifestyle', 'Ideal weekend activity?', 'multiple_choice', '["Outdoor adventure", "Stay home and chill", "Food trip", "Movie marathon", "Hang out with friends"]'::jsonb, 1.3, 9, true),
        (gen_random_uuid(), 'Lifestyle', 'How often do you exercise?', 'scale', NULL, 1.0, 10, true),

        (gen_random_uuid(), 'Personality', 'In a disagreement, you usually?', 'multiple_choice', '["Talk it out immediately", "Need space first", "Avoid conflict", "Compromise quickly"]'::jsonb, 1.8, 11, true),
        (gen_random_uuid(), 'Personality', 'Your humor style?', 'multiple_choice', '["Witty banter", "Dad jokes", "Sarcasm", "Puns", "Slapstick comedy"]'::jsonb, 1.2, 12, true),
        (gen_random_uuid(), 'Personality', 'How do you make big decisions?', 'multiple_choice', '["Gut feeling", "Careful analysis", "Ask for advice", "Make pros/cons list"]'::jsonb, 1.5, 13, true),
        (gen_random_uuid(), 'Personality', 'Introvert, Extrovert, or Ambivert?', 'scale', NULL, 1.6, 14, true),
        (gen_random_uuid(), 'Personality', 'How do you express affection?', 'multiple_choice', '["Words of affirmation", "Physical touch", "Quality time", "Gifts", "Acts of service"]'::jsonb, 1.7, 15, true),

        (gen_random_uuid(), 'Academic', 'Dream career path?', 'multiple_choice', '["Technical expert", "Entrepreneur", "Researcher", "Corporate", "Still exploring"]'::jsonb, 1.3, 16, true),
        (gen_random_uuid(), 'Academic', 'Study habit preference?', 'multiple_choice', '["Solo cramming", "Group study", "Consistent daily review", "Last minute rush"]'::jsonb, 1.4, 17, true),
        (gen_random_uuid(), 'Academic', 'Work-life balance priority?', 'scale', NULL, 1.5, 18, true),
        (gen_random_uuid(), 'Academic', 'After graduation plans?', 'multiple_choice', '["Work immediately", "Graduate school", "Travel", "Start a business", "Not sure yet"]'::jsonb, 1.3, 19, true),
        (gen_random_uuid(), 'Academic', 'Favorite campus hangout?', 'multiple_choice', '["Library", "Tambayan", "Gym", "Canteen", "Study areas"]'::jsonb, 1.0, 20, true),
        (gen_random_uuid(), 'Academic', 'How do you cope with quarter system stress?', 'multiple_choice', '["Plan everything", "Go with the flow", "Study hard", "Take breaks", "Pray"]'::jsonb, 1.2, 21, true),
        (gen_random_uuid(), 'Academic', 'Cross-program dating preference?', 'multiple_choice', '["Prefer same program", "Open to all programs", "Prefer different program", "No preference"]'::jsonb, 1.1, 22, true),

        (gen_random_uuid(), 'Fun', 'Pineapple on pizza: Yes or no?', 'multiple_choice', '["Yes, love it!", "Absolutely not!", "It''s complicated", "No opinion"]'::jsonb, 0.8, 23, true),
        (gen_random_uuid(), 'Fun', 'Spirit animal?', 'multiple_choice', '["Cardinal (obviously!)", "Cat", "Dog", "Coffee", "Owl"]'::jsonb, 0.7, 24, true),
        (gen_random_uuid(), 'Fun', 'Karaoke confidence level?', 'scale', NULL, 0.8, 25, true),
        (gen_random_uuid(), 'Fun', 'Ideal first date?', 'multiple_choice', '["Coffee talk", "Food adventure", "Activity date", "Movie", "Virtual hangout"]'::jsonb, 1.2, 26, true),
        (gen_random_uuid(), 'Fun', 'What''s your love language?', 'multiple_choice', '["Words of affirmation", "Acts of service", "Receiving gifts", "Quality time", "Physical touch"]'::jsonb, 1.5, 27, true),
        (gen_random_uuid(), 'Fun', 'How do you feel about PDA (Public Display of Affection)?', 'scale', NULL, 1.0, 28, true),
        (gen_random_uuid(), 'Fun', 'Dealbreaker in texting style?', 'multiple_choice', '["One word replies", "Slow replies", "Too many emojis", "No emojis", "Ghosting"]'::jsonb, 1.1, 29, true),
        (gen_random_uuid(), 'Fun', 'Best trait you''re looking for?', 'multiple_choice', '["Sense of humor", "Intelligence", "Kindness", "Ambition", "Loyalty"]'::jsonb, 1.8, 30, true)
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Created 30 survey questions');

    // Create admin settings
    await prisma.$executeRawUnsafe(`
      INSERT INTO admin_settings (id, setting_key, setting_value)
      VALUES
        (gen_random_uuid(), 'match_release_date', '"2026-02-05T00:00:00Z"'::jsonb),
        (gen_random_uuid(), 'registration_open', 'true'::jsonb)
      ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;
    `);

    console.log('✅ Created admin settings');

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
