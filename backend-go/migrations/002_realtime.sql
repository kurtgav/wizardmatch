-- +goose Up
-- +goose StatementBegin
-- Enable Realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE testimonials;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER PUBLICATION supabase_realtime DROP TABLE messages;
ALTER PUBLICATION supabase_realtime DROP TABLE matches;
ALTER PUBLICATION supabase_realtime DROP TABLE campaigns;
ALTER PUBLICATION supabase_realtime DROP TABLE testimonials;
-- +goose StatementEnd
