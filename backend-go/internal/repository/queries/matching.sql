-- name: ListSurveyResponsesWithQuestionsByUserCampaign :many
SELECT
    sr.id,
    sr.user_id,
    sr.campaign_id,
    sr.question_id,
    sr.answer_text,
    sr.answer_value,
    sr.answer_json,
    sr.answer_type,
    sr.created_at,
    sr.updated_at,
    q.category AS question_category,
    q.weight AS question_weight
FROM survey_responses sr
JOIN questions q ON q.id = sr.question_id
WHERE sr.user_id = $1 AND sr.campaign_id = $2;

-- name: CountCrushByUserEmailCampaign :one
SELECT COUNT(*) FROM crush_lists
WHERE user_id = $1 AND campaign_id = $2 AND crush_email = $3;
