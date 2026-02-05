-- name: PublicStats :one
SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM users WHERE survey_completed = TRUE) AS completed_surveys,
    (SELECT COUNT(*) FROM matches) AS total_matches;
