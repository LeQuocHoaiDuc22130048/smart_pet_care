-- OAuth provider credentials must not be persisted as plaintext in the identity database.
ALTER TABLE users DROP COLUMN google_access_token;
ALTER TABLE users DROP COLUMN google_refresh_token;
