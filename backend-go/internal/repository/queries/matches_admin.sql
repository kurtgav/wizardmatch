-- name: ListMatches :many
SELECT * FROM matches ORDER BY compatibility_score DESC LIMIT $1 OFFSET $2;

-- name: CountMatchesAll :one
SELECT COUNT(*) FROM matches;


-- name: CreateMatch :one
INSERT INTO matches (
    campaign_id,
    user1_id,
    user2_id,
    compatibility_score,
    match_tier,
    shared_interests,
    rank_for_user1,
    rank_for_user2,
    is_mutual_crush,
    is_revealed
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING *;

-- name: UpdateMatch :one
UPDATE matches
SET
    compatibility_score = COALESCE($2, compatibility_score),
    match_tier = COALESCE($3, match_tier),
    is_revealed = COALESCE($4, is_revealed),
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteMatch :exec
DELETE FROM matches WHERE id = $1;

-- name: DeleteMatchesByCampaign :exec
DELETE FROM matches WHERE campaign_id = $1;

-- name: UnlockMessagingByCampaign :exec
UPDATE matches SET messaging_unlocked = TRUE, updated_at = NOW()
WHERE campaign_id = $1;
