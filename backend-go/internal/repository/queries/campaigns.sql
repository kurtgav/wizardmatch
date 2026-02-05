-- name: GetActiveCampaign :one
SELECT * FROM campaigns WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1;

-- name: GetCampaignByID :one
SELECT * FROM campaigns WHERE id = $1 LIMIT 1;

-- name: ListCampaigns :many
SELECT * FROM campaigns ORDER BY created_at DESC;

-- name: CreateCampaign :one
INSERT INTO campaigns (
    name,
    survey_open_date,
    survey_close_date,
    profile_update_start_date,
    profile_update_end_date,
    results_release_date,
    is_active,
    config,
    algorithm_version
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: UpdateCampaign :one
UPDATE campaigns SET
    name = COALESCE($2, name),
    survey_open_date = COALESCE($3, survey_open_date),
    survey_close_date = COALESCE($4, survey_close_date),
    profile_update_start_date = COALESCE($5, profile_update_start_date),
    profile_update_end_date = COALESCE($6, profile_update_end_date),
    results_release_date = COALESCE($7, results_release_date),
    is_active = COALESCE($8, is_active),
    config = COALESCE($9, config),
    algorithm_version = COALESCE($10, algorithm_version)
WHERE id = $1
RETURNING *;

-- name: DeleteCampaign :exec
DELETE FROM campaigns WHERE id = $1;

-- name: UpdateCampaignStats :exec
UPDATE campaigns SET
    total_participants = $2,
    total_matches_generated = $3
WHERE id = $1;

-- name: CountParticipantsByCampaign :one
SELECT COUNT(DISTINCT user_id) FROM survey_responses WHERE campaign_id = $1;

-- name: CountCompletedSurveysByCampaign :one
SELECT COUNT(DISTINCT u.id)
FROM users u
JOIN survey_responses sr ON sr.user_id = u.id
WHERE sr.campaign_id = $1 AND u.survey_completed = TRUE;
