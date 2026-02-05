-- name: CountActiveUsers :one
SELECT COUNT(*) FROM users WHERE is_active = TRUE;

-- name: CountCompletedSurveys :one
SELECT COUNT(*) FROM users WHERE is_active = TRUE AND survey_completed = TRUE;

-- name: CountMatches :one
SELECT COUNT(*) FROM matches;

-- name: CountMatchesByCampaign :one
SELECT COUNT(*) FROM matches WHERE campaign_id = $1;

-- name: CountMutualMatches :one
SELECT COUNT(*) FROM matches WHERE is_mutual_interest = TRUE;

-- name: CountMutualMatchesByCampaign :one
SELECT COUNT(*) FROM matches WHERE is_mutual_interest = TRUE AND campaign_id = $1;

-- name: CountRevealedMatches :one
SELECT COUNT(*) FROM matches WHERE is_revealed = TRUE;

-- name: CountRevealedMatchesByCampaign :one
SELECT COUNT(*) FROM matches WHERE is_revealed = TRUE AND campaign_id = $1;

-- name: AverageCompatibilityScore :one
SELECT COALESCE(AVG(compatibility_score), 0)::float8 FROM matches;

-- name: AverageCompatibilityScoreByCampaign :one
SELECT COALESCE(AVG(compatibility_score), 0)::float8 FROM matches WHERE campaign_id = $1;

-- name: TopPrograms :many
SELECT program, COUNT(*) AS count
FROM users
WHERE survey_completed = TRUE AND program IS NOT NULL
GROUP BY program
ORDER BY count DESC
LIMIT $1;

-- name: TopProgramsByCampaign :many
SELECT u.program, COUNT(*) AS count
FROM users u
JOIN survey_responses sr ON sr.user_id = u.id
WHERE sr.campaign_id = $1 AND u.survey_completed = TRUE AND u.program IS NOT NULL
GROUP BY u.program
ORDER BY count DESC
LIMIT $2;

-- name: ProgramsWithCompletion :many
SELECT program,
       COUNT(*) AS total,
       SUM(CASE WHEN survey_completed = TRUE THEN 1 ELSE 0 END) AS completed
FROM users
WHERE is_active = TRUE AND program IS NOT NULL
GROUP BY program
ORDER BY total DESC;

-- name: ProgramsWithCompletionByCampaign :many
SELECT u.program,
       COUNT(DISTINCT u.id) AS total,
       SUM(CASE WHEN u.survey_completed = TRUE THEN 1 ELSE 0 END) AS completed
FROM users u
JOIN survey_responses sr ON sr.user_id = u.id
WHERE sr.campaign_id = $1 AND u.program IS NOT NULL
GROUP BY u.program
ORDER BY total DESC;

-- name: YearLevelsWithCompletion :many
SELECT year_level,
       COUNT(*) AS total,
       SUM(CASE WHEN survey_completed = TRUE THEN 1 ELSE 0 END) AS completed
FROM users
WHERE is_active = TRUE AND year_level IS NOT NULL
GROUP BY year_level
ORDER BY year_level ASC;

-- name: YearLevelsWithCompletionByCampaign :many
SELECT u.year_level,
       COUNT(DISTINCT u.id) AS total,
       SUM(CASE WHEN u.survey_completed = TRUE THEN 1 ELSE 0 END) AS completed
FROM users u
JOIN survey_responses sr ON sr.user_id = u.id
WHERE sr.campaign_id = $1 AND u.year_level IS NOT NULL
GROUP BY u.year_level
ORDER BY u.year_level ASC;

-- name: MatchesByTier :many
SELECT match_tier, COUNT(*) AS count
FROM matches
GROUP BY match_tier;

-- name: MatchesByTierByCampaign :many
SELECT match_tier, COUNT(*) AS count
FROM matches
WHERE campaign_id = $1
GROUP BY match_tier;
