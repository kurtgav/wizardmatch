-- name: UpsertAdminSetting :one
INSERT INTO admin_settings (setting_key, setting_value, updated_by)
VALUES ($1, $2, $3)
ON CONFLICT (setting_key)
DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_by = EXCLUDED.updated_by, updated_at = NOW()
RETURNING *;

-- name: GetAdminSettingByKey :one
SELECT * FROM admin_settings WHERE setting_key = $1 LIMIT 1;

-- name: ListTestimonials :many
SELECT * FROM testimonials ORDER BY created_at DESC;

-- name: CreateTestimonial :one
INSERT INTO testimonials (name, email, heading, content, is_approved, is_published)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: UpdateTestimonialApproval :one
UPDATE testimonials
SET is_approved = $2, is_published = $3, updated_at = NOW()
WHERE id = $1
RETURNING *;
