-- name: ListMatchesForUser :many
SELECT * FROM matches WHERE user1_id = $1 OR user2_id = $1 ORDER BY compatibility_score DESC;

-- name: GetMatchByID :one
SELECT * FROM matches WHERE id = $1 LIMIT 1;

-- name: RevealMatch :one
UPDATE matches SET is_revealed = TRUE, revealed_at = NOW() WHERE id = $1 RETURNING *;

-- name: UpdateMatchInterest :one
UPDATE matches
SET
    is_mutual_interest = $2,
    messaging_unlocked = $3,
    updated_at = NOW()
WHERE id = $1
RETURNING *;
