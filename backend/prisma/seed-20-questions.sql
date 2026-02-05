-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Get or create active campaign
DO $$
DECLARE
  active_campaign_id TEXT;
BEGIN
  SELECT id INTO active_campaign_id
  FROM campaigns
  WHERE is_active = true
  LIMIT 1;

  IF active_campaign_id IS NULL THEN
    INSERT INTO campaigns (name, survey_open_date, survey_close_date, profile_update_start_date, profile_update_end_date, results_release_date, is_active)
    VALUES (
      'Valentine''s 2026 Matching',
      '2026-02-05 00:00:00+00',
      '2026-02-10 23:59:00+00',
      '2026-02-11 00:00:00+00',
      '2026-02-13 23:59:00+00',
      '2026-02-14 00:00:00+00',
      true
    )
    RETURNING id INTO active_campaign_id;
  END IF;

  RAISE NOTICE 'Active campaign ID: %', active_campaign_id;
END $$;

-- Delete all existing questions for the active campaign to avoid duplicates
DELETE FROM questions WHERE campaign_id = (SELECT id FROM campaigns WHERE is_active = true LIMIT 1);

-- Insert 20 Survey Questions
INSERT INTO questions (campaign_id, category, question_text, question_type, options, weight, order_index, is_active) VALUES
-- Core Values (4 questions)
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'values', 'What matters most to you in a relationship?', 'multiple_choice', '["Trust and honesty", "Emotional support", "Shared goals", "Personal growth", "Adventure"]', 2.0, 1, true),
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'values', 'How important is family approval in your dating life?', 'scale', '{"min": 1, "max": 5, "labels": {"1": "Not important", "3": "Somewhat", "5": "Very important"}}', 1.5, 2, true),
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'values', 'Your ideal future: career-focused, family-focused, or balanced?', 'multiple_choice', '["Career-focused", "Family-focused", "Work-life balance", "Still figuring it out"]', 2.0, 3, true),
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'values', 'Dealbreaker: Which of these is unacceptable to you?', 'multiple_choice', '["Lack of ambition", "Dishonesty", "Poor communication", "Disrespect"]', 2.5, 4, true),

-- Lifestyle (4 questions)
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'lifestyle', 'Typical Friday night activity?', 'multiple_choice', '["Study group", "Partying", "Netflix at home", "Gym/Exercise", "Food trip with friends"]', 1.5, 5, true),
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'lifestyle', 'Are you a morning person or a night owl?', 'scale', '{"min": 1, "max": 5, "labels": {"1": "Early bird", "3": "Balanced", "5": "Night owl"}}', 1.2, 6, true),
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'lifestyle', 'How do you handle stress?', 'multiple_choice', '["Exercise", "Talk to friends", "Sleep", "Eat", "Gaming/Social media"]', 1.5, 7, true),
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'lifestyle', 'Social battery: introvert, extrovert, or ambivert?', 'multiple_choice', '["Introvert", "Ambivert", "Extrovert"]', 1.8, 8, true),

-- Relationship Style (4 questions)
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'values', 'Preferred communication style?', 'multiple_choice', '["Direct", "Diplomatic", "Playful", "Reserved"]', 1.5, 9, true),
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'values', 'How do you show affection?', 'multiple_choice', '["Words of affirmation", "Quality time", "Physical touch", "Acts of service"]', 1.5, 10, true),
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'values', 'Personal space: need lots or okay with close?', 'scale', '{"min": 1, "max": 5, "labels": {"1": "Need lots of space", "3": "Balanced", "5": "Okay with close"}}', 1.3, 11, true),
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'values', 'Conflict resolution: talk it out or need space?', 'multiple_choice', '["Talk immediately", "Need space first", "Write it out", "Avoid conflict"]', 1.7, 12, true),

-- Interests (4 questions)
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'lifestyle', 'Favorite hobby/activity?', 'multiple_choice', '["Reading/Gaming", "Sports/Fitness", "Arts/Creative", "Socializing", "Learning new skills"]', 1.5, 13, true),
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'lifestyle', 'Music preference?', 'multiple_choice', '["Pop/Top 40", "R&B/Hip-hop", "Rock/Alternative", "EDM/Dance", "Everything/Chill"]', 1.2, 14, true),
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'lifestyle', 'Movie genre preference?', 'multiple_choice', '["Action/Adventure", "Rom-Com/Drama", "Sci-Fi/Fantasy", "Horror/Thriller", "Documentary"]', 1.2, 15, true),
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'lifestyle', 'Weekend vibe: chill or adventure?', 'scale', '{"min": 1, "max": 5, "labels": {"1": "Super chill", "3": "Balanced", "5": "Always adventure"}}', 1.4, 16, true),

-- Dating Preferences (4 questions)
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'values', 'Must-have quality in a partner?', 'multiple_choice', '["Kindness", "Ambition", "Humor", "Loyalty", "Intelligence"]', 2.5, 17, true),
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'values', 'Ideal first date?', 'multiple_choice', '["Coffee/Drinks", "Dinner", "Activity-based", "Walk in the park", "Surprise me"]', 1.5, 18, true),
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'values', 'Who should pay on first date?', 'multiple_choice', '["I always pay", "Split", "They pay", "Depends on who asked"]', 1.3, 19, true),
((SELECT id FROM campaigns WHERE is_active = true LIMIT 1), 'values', 'Timeline for defining the relationship?', 'multiple_choice', '["Immediately", "After a few dates", "After a month", "Let it happen naturally"]', 1.8, 20, true);

-- Verify questions were created
SELECT category, COUNT(*) as question_count FROM questions WHERE is_active = true GROUP BY category ORDER BY category;
