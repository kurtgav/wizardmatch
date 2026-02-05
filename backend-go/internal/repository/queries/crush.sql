-- name: DeleteCrushesForUserCampaign :exec
DELETE FROM crush_lists WHERE user_id = $1 AND campaign_id = $2;

-- name: CreateCrush :one
INSERT INTO crush_lists (
    user_id,
    campaign_id,
    crush_email,
    crush_name,
    is_matched,
    is_mutual,
    nudge_sent
) VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: ListCrushesForUserCampaign :many
SELECT * FROM crush_lists WHERE user_id = $1 AND campaign_id = $2 ORDER BY created_at DESC;

-- name: ListCrushesByEmailCampaign :many
SELECT * FROM crush_lists WHERE crush_email = $1 AND campaign_id = $2;

-- name: ListCrushesForCampaign :many
SELECT * FROM crush_lists WHERE campaign_id = $1 ORDER BY created_at DESC;
