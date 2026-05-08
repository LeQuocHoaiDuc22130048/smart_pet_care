-- Add Google OAuth2 support to users table
-- Migration: V2__add_google_oauth_support.sql

-- Add email column (unique, for Google login)
ALTER TABLE users
ADD COLUMN email VARCHAR(255) UNIQUE AFTER password;

-- Add avatar URL
ALTER TABLE users
ADD COLUMN avatar_url VARCHAR(500) AFTER birth_date;

-- Add authentication provider
ALTER TABLE users
ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'LOCAL' AFTER avatar_url;

-- Add Google-specific fields
ALTER TABLE users
ADD COLUMN google_id VARCHAR(255) UNIQUE AFTER auth_provider;

ALTER TABLE users
ADD COLUMN google_access_token TEXT AFTER google_id;

ALTER TABLE users
ADD COLUMN google_refresh_token TEXT AFTER google_access_token;

-- Create index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_auth_provider ON users(auth_provider);

-- Make password nullable (for OAuth-only users)
ALTER TABLE users
MODIFY COLUMN password VARCHAR(255) NULL;

-- Add comment for documentation
ALTER TABLE users
COMMENT = 'Users table with support for local and OAuth2 authentication';
