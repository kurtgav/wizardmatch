-- name: CreateInteraction :one
INSERT INTO interactions (match_id, user_id, interaction_type, metadata)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: FindInterestByMatchOtherUser :one
SELECT * FROM interactions
WHERE match_id = $1 AND user_id <> $2 AND interaction_type = 'interest'
LIMIT 1;
