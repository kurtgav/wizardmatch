-- name: CreateQuestion :one
INSERT INTO questions (
    campaign_id,
    category,
    question_text,
    question_type,
    options,
    weight,
    is_active,
    order_index
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: UpdateQuestion :one
UPDATE questions
SET
    category = COALESCE($2, category),
    question_text = COALESCE($3, question_text),
    question_type = COALESCE($4, question_type),
    options = COALESCE($5, options),
    weight = COALESCE($6, weight),
    is_active = COALESCE($7, is_active),
    order_index = COALESCE(NULLIF($8, 0), order_index)
WHERE id = $1
RETURNING *;

-- name: DeleteQuestion :exec
DELETE FROM questions WHERE id = $1;
