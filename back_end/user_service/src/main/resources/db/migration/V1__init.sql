-- Flyway Migration for User Service
-- Creates tables for user profiles, pets, and addresses

-- User Profile table
CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    birthday DATE,
    phone VARCHAR(10),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    synced_at TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pet table
CREATE TABLE IF NOT EXISTS pets (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255),
    species VARCHAR(50),
    breed VARCHAR(255),
    age INT,
    weight DECIMAL(10,2),
    gender VARCHAR(10),
    is_neutered BIT(1),
    health_notes TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Address table
CREATE TABLE IF NOT EXISTS user_addresses (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    recipient_name VARCHAR(255),
    recipient_phone VARCHAR(20),
    province VARCHAR(255),
    district VARCHAR(255),
    ward VARCHAR(255),
    street_details VARCHAR(500),
    is_default BIT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better query performance
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
