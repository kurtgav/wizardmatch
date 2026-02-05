-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1 LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1 LIMIT 1;

-- name: GetUserByGoogleID :one
SELECT * FROM users WHERE google_id = $1 LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (
    email,
    google_id,
    username,
    student_id,
    first_name,
    last_name,
    program,
    year_level,
    gender,
    seeking_gender,
    date_of_birth,
    profile_photo_url,
    bio,
    instagram_handle,
    facebook_profile,
    social_media_name,
    phone_number,
    contact_preference,
    profile_visibility,
    preferences,
    last_login,
    is_active,
    survey_completed
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
) RETURNING *;

-- name: UpdateUserProfile :one
UPDATE users SET
    first_name = COALESCE(NULLIF($2, ''), first_name),
    last_name = COALESCE(NULLIF($3, ''), last_name),
    program = COALESCE($4, program),
    year_level = COALESCE($5, year_level),
    gender = COALESCE($6, gender),
    seeking_gender = COALESCE($7, seeking_gender),
    date_of_birth = COALESCE($8, date_of_birth),
    profile_photo_url = COALESCE($9, profile_photo_url),
    bio = COALESCE($10, bio),
    instagram_handle = COALESCE($11, instagram_handle),
    facebook_profile = COALESCE($12, facebook_profile),
    social_media_name = COALESCE($13, social_media_name),
    phone_number = COALESCE($14, phone_number),
    contact_preference = COALESCE($15, contact_preference),
    profile_visibility = COALESCE(NULLIF($16, ''), profile_visibility),
    preferences = COALESCE($17, preferences),
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: UpdateUserPreferences :one
UPDATE users SET
    preferences = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id, preferences;

-- name: UpdateUserPhoto :one
UPDATE users SET
    profile_photo_url = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id, profile_photo_url;

-- name: ListUsersAdmin :many
SELECT id, email, student_id, first_name, last_name, program, year_level, survey_completed, is_active, created_at, last_login
FROM users
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: CountUsers :one
SELECT COUNT(*) FROM users;

-- name: SearchUsersAdmin :many
SELECT id, email, student_id, first_name, last_name, program, year_level, survey_completed, is_active, created_at, last_login
FROM users
WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR student_id ILIKE $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountUsersSearch :one
SELECT COUNT(*) FROM users
WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR student_id ILIKE $1;

-- name: UpdateUserAdmin :one
UPDATE users SET
    email = COALESCE($2, email),
    first_name = COALESCE($3, first_name),
    last_name = COALESCE($4, last_name),
    program = COALESCE($5, program),
    year_level = COALESCE($6, year_level),
    survey_completed = COALESCE($7, survey_completed),
    is_active = COALESCE($8, is_active),
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;

-- name: ListEligibleUsers :many
SELECT id, email, first_name, last_name, program, year_level, gender, seeking_gender
FROM users
WHERE survey_completed = TRUE AND is_active = TRUE
ORDER BY first_name ASC;

-- name: UpdateUserLastLogin :exec
UPDATE users SET last_login = NOW() WHERE id = $1;

-- name: SetUserSurveyCompleted :exec
UPDATE users SET survey_completed = $2, updated_at = NOW() WHERE id = $1;
