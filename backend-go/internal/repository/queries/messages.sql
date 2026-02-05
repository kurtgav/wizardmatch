-- name: ListConversationsForUser :many
SELECT DISTINCT ON (match_id) *
FROM messages
WHERE sender_id = $1 OR recipient_id = $1
ORDER BY match_id, sent_at DESC;

-- name: ListMessagesForMatch :many
SELECT * FROM messages WHERE match_id = $1 ORDER BY sent_at ASC;

-- name: CreateMessage :one
INSERT INTO messages (
    match_id,
    sender_id,
    recipient_id,
    content
) VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: CountUnreadMessages :one
SELECT COUNT(*) FROM messages WHERE recipient_id = $1 AND is_read = FALSE;

-- name: CountUnreadMessagesForMatch :one
SELECT COUNT(*) FROM messages WHERE match_id = $1 AND recipient_id = $2 AND is_read = FALSE;

-- name: MarkMessagesRead :exec
UPDATE messages SET is_read = TRUE, read_at = NOW()
WHERE id = ANY($1::uuid[]) AND recipient_id = $2 AND is_read = FALSE;
