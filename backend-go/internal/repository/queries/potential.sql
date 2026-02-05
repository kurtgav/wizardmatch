-- name: ListPotentialMatches :many
SELECT u.id, u.email, u.first_name, u.last_name, u.program, u.year_level, u.gender, u.seeking_gender, u.profile_photo_url, u.bio
FROM users u
WHERE u.survey_completed = TRUE
  AND u.is_active = TRUE
  AND u.id != $1
  AND u.id NOT IN (
    SELECT CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END
    FROM matches m
    WHERE m.user1_id = $1 OR m.user2_id = $1
  )
  AND u.id NOT IN (
    SELECT i.user_id FROM interactions i
    JOIN matches m ON m.id = i.match_id
    WHERE (m.user1_id = $1 OR m.user2_id = $1)
      AND i.interaction_type IN ('pass', 'interest', 'not_interested')
  )
ORDER BY RANDOM()
LIMIT 20;

-- name: RecordUserInteraction :one
INSERT INTO interactions (match_id, user_id, interaction_type, metadata)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: FindOrCreateMatchForUsers :one
INSERT INTO matches (user1_id, user2_id, compatibility_score, match_tier, shared_interests)
VALUES (
    LEAST($1, $2),
    GREATEST($1, $2),
    0,
    'potential',
    '{}'::jsonb
)
ON CONFLICT (user1_id, user2_id) DO UPDATE SET updated_at = NOW()
RETURNING *;

-- name: GetMatchByUsers :one
SELECT * FROM matches
WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
LIMIT 1;
