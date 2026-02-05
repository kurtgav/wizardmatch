-- name: ListQuestions :many
SELECT * FROM questions WHERE is_active = TRUE ORDER BY order_index ASC;

-- name: GetQuestionByID :one
SELECT * FROM questions WHERE id = $1 LIMIT 1;

-- name: CreateSurveyResponse :one
INSERT INTO survey_responses (
    user_id,
    campaign_id,
    question_id,
    answer_text,
    answer_value,
    answer_json,
    answer_type
) VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (user_id, question_id)
DO UPDATE SET
    answer_text = EXCLUDED.answer_text,
    answer_value = EXCLUDED.answer_value,
    answer_json = EXCLUDED.answer_json,
    answer_type = EXCLUDED.answer_type,
    updated_at = NOW()
RETURNING *;

-- name: ListSurveyResponsesByUser :many
SELECT * FROM survey_responses WHERE user_id = $1 ORDER BY created_at ASC;
