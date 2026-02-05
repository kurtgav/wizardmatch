-- ============================================
-- WIZARD MATCH PRODUCTION SEED SCRIPT
-- Run this in Supabase SQL Editor to fix:
-- 1. Survey questions not loading
-- 2. Crushlist/Campaign errors
-- ============================================

-- STEP 1: Create the Valentine's 2026 Campaign (with explicit UUID)
INSERT INTO campaigns (
    id,
    name,
    survey_open_date,
    survey_close_date,
    profile_update_start_date,
    profile_update_end_date,
    results_release_date,
    is_active,
    algorithm_version,
    config
) VALUES (
    gen_random_uuid(),
    'Valentine''s 2026 Matching',
    '2026-02-05 00:00:00+08',
    '2026-02-10 23:59:59+08',
    '2026-02-11 00:00:00+08',
    '2026-02-13 23:59:59+08',
    '2026-02-14 07:00:00+08',
    TRUE,
    '1.0',
    '{"matchesPerUser": 7, "crushBonus": 0.2}'
) ON CONFLICT DO NOTHING;

-- STEP 2: Clear existing questions to avoid duplicates
DELETE FROM survey_responses;
DELETE FROM questions;

-- STEP 3: Seed Survey Questions (15 total)

-- Demographics (3 questions)
INSERT INTO questions (id, category, question_text, question_type, options, weight, order_index) VALUES
(gen_random_uuid(), 'demographics', 'What is your year level?', 'multiple_choice', '["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Irregular"]', 1.00, 1),
(gen_random_uuid(), 'demographics', 'Which program are you in?', 'multiple_choice', '["Engineering", "IT/CS", "Business", "Health Sciences", "Arts & Sciences", "Media Studies", "Other"]', 1.00, 2),
(gen_random_uuid(), 'demographics', 'What is your zodiac sign?', 'multiple_choice', '["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]', 0.50, 3);

-- Personality (4 questions)
INSERT INTO questions (id, category, question_text, question_type, options, weight, order_index) VALUES
(gen_random_uuid(), 'personality', 'I enjoy being the center of attention.', 'scale', '{"min": 1, "max": 5, "minLabel": "Strongly Disagree", "maxLabel": "Strongly Agree"}', 1.20, 4),
(gen_random_uuid(), 'personality', 'I prefer planning everything in detail rather than being spontaneous.', 'scale', '{"min": 1, "max": 5, "minLabel": "Strongly Disagree", "maxLabel": "Strongly Agree"}', 1.20, 5),
(gen_random_uuid(), 'personality', 'I make decisions based on logic rather than emotions.', 'scale', '{"min": 1, "max": 5, "minLabel": "Strongly Disagree", "maxLabel": "Strongly Agree"}', 1.20, 6),
(gen_random_uuid(), 'personality', 'I often feel drained after social interactions.', 'scale', '{"min": 1, "max": 5, "minLabel": "Strongly Disagree", "maxLabel": "Strongly Agree"}', 1.20, 7);

-- Values (3 questions)
INSERT INTO questions (id, category, question_text, question_type, options, weight, order_index) VALUES
(gen_random_uuid(), 'values', 'What is most important to you in a relationship?', 'multiple_choice', '["Trust & Loyalty", "Shared Interests", "Growth & Ambition", "Fun & Adventure", "Emotional Connection"]', 1.50, 8),
(gen_random_uuid(), 'values', 'How religious/spiritual are you?', 'scale', '{"min": 1, "max": 5, "minLabel": "Not at all", "maxLabel": "Very"}', 1.30, 9),
(gen_random_uuid(), 'values', 'How important is academic excellence to you?', 'scale', '{"min": 1, "max": 5, "minLabel": "Not Important", "maxLabel": "Very Important"}', 1.10, 10);

-- Lifestyle (3 questions)
INSERT INTO questions (id, category, question_text, question_type, options, weight, order_index) VALUES
(gen_random_uuid(), 'lifestyle', 'How do you prefer to spend your weekends?', 'multiple_choice', '["Staying home with a book/movie", "Partying/Socializing", "Outdoor adventure", "Gaming", "Studying/Working"]', 1.00, 11),
(gen_random_uuid(), 'lifestyle', 'Are you a morning person or a night owl?', 'multiple_choice', '["Morning Person", "Night Owl", "Somewhere in between"]', 0.80, 12),
(gen_random_uuid(), 'lifestyle', 'How often do you drink alcohol?', 'multiple_choice', '["Never", "Socially", "Regularly"]', 0.80, 13);

-- Interests (2 questions)
INSERT INTO questions (id, category, question_text, question_type, options, weight, order_index) VALUES
(gen_random_uuid(), 'interests', 'Select your top interests (Max 5)', 'multiple_select', '["Music", "Movies", "Reading", "Travel", "Gaming", "Sports", "Art", "Tech", "Food", "Fashion", "Nature", "Photography"]', 1.20, 14),
(gen_random_uuid(), 'interests', 'What is your ideal first date?', 'multiple_choice', '["Coffee date", "Dinner and a movie", "Concert/Event", "Hiking/Outdoors", "Museum/Art Gallery", "Just hanging out"]', 1.10, 15);

-- STEP 4: Verify the data was inserted
SELECT 'Campaign created:' as status, name, is_active FROM campaigns WHERE is_active = true;
SELECT 'Questions seeded:' as status, COUNT(*) as total_questions FROM questions;
SELECT category, COUNT(*) as count FROM questions GROUP BY category ORDER BY MIN(order_index);
