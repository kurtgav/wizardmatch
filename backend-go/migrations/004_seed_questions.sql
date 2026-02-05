-- +goose Up
-- +goose StatementBegin

-- Clear existing questions to avoid duplicates/conflicts during seed
-- Must clear dependent tables first due to foreign keys
DELETE FROM survey_responses;
DELETE FROM questions;

-- Demographics
INSERT INTO questions (category, question_text, question_type, options, weight, order_index) VALUES
('demographics', 'What is your year level?', 'multiple_choice', '["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Irregular"]', 1.00, 1),
('demographics', 'Which program are you in?', 'multiple_choice', '["Engineering", "IT/CS", "Business", "Health Sciences", "Arts & Sciences", "Media Studies", "Other"]', 1.00, 2),
('demographics', 'What is your zodiac sign?', 'multiple_choice', '["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]', 0.50, 3);

-- Personality (Big 5 inspired)
INSERT INTO questions (category, question_text, question_type, options, weight, order_index) VALUES
('personality', 'I enjoy being the center of attention.', 'scale', '{"min": 1, "max": 5, "minLabel": "Disagree", "maxLabel": "Agree"}', 1.20, 4),
('personality', 'I prefer planning everything in detail rather than being spontaneous.', 'scale', '{"min": 1, "max": 5, "minLabel": "Disagree", "maxLabel": "Agree"}', 1.20, 5),
('personality', 'I make decisions based on logic rather than emotions.', 'scale', '{"min": 1, "max": 5, "minLabel": "Disagree", "maxLabel": "Agree"}', 1.20, 6),
('personality', 'I often feel overwhelmed by social interactions.', 'scale', '{"min": 1, "max": 5, "minLabel": "Disagree", "maxLabel": "Agree"}', 1.20, 7);

-- Values
INSERT INTO questions (category, question_text, question_type, options, weight, order_index) VALUES
('values', 'What is most important to you in a relationship?', 'multiple_choice', '["Trust & Loyalty", "Shared Interests", "Growth & Ambition", "Fun & Adventure", "Emotional Connection"]', 1.50, 8),
('values', 'How religious/spiritual are you?', 'scale', '{"min": 1, "max": 5, "minLabel": "Not at all", "maxLabel": "Very"}', 1.30, 9),
('values', 'How important is academic excellence to you?', 'scale', '{"min": 1, "max": 5, "minLabel": "Not Important", "maxLabel": "Very Important"}', 1.10, 10);

-- Lifestyle
INSERT INTO questions (category, question_text, question_type, options, weight, order_index) VALUES
('lifestyle', 'How do you prefer to spend your weekends?', 'multiple_choice', '["Staying home with a book/movie", "Partying/Socializing", "Outdoor adventure", "Gaming", "Studying/Working"]', 1.00, 11),
('lifestyle', 'Are you a morning person or a night owl?', 'multiple_choice', '["Morning Person", "Night Owl", "Somewhere in between"]', 0.80, 12),
('lifestyle', 'How often do you drink alcohol?', 'multiple_choice', '["Never", "Socially", "Regularly"]', 0.80, 13);

-- Interests
INSERT INTO questions (category, question_text, question_type, options, weight, order_index) VALUES
('interests', 'Select your top interests (Max 5)', 'multiple_select', '["Music", "Movies", "Reading", "Travel", "Gaming", "Sports", "Art", "Tech", "Food", "Fashion", "Nature", "Photography"]', 1.20, 14),
('interests', 'What is your ideal first date?', 'multiple_choice', '["Coffee date", "Dinner and a movie", "Concert/Event", "Hiking/Outdoors", "Museum/Art Gallery", "Just hanging out"]', 1.10, 15);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM questions;
-- +goose StatementEnd
