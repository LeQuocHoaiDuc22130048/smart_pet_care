-- Flyway Migration for Identity Service
-- Creates tables for users, roles, permissions, and invalidated tokens

-- Permission table
CREATE TABLE IF NOT EXISTS permission (
    name VARCHAR(255) NOT NULL PRIMARY KEY,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Role table
CREATE TABLE IF NOT EXISTS role (
    name VARCHAR(255) NOT NULL PRIMARY KEY,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Role-Permission join table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_name VARCHAR(255) NOT NULL,
    permissions_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (role_name, permissions_name),
    FOREIGN KEY (role_name) REFERENCES role(name),
    FOREIGN KEY (permissions_name) REFERENCES permission(name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    username VARCHAR(255) COLLATE utf8mb4_unicode_ci UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    birth_date DATE,
    is_active BIT(1) DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User-Role join table (Hibernate default naming: users_roles)
CREATE TABLE IF NOT EXISTS users_roles (
    user_id VARCHAR(36) NOT NULL,
    roles_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id, roles_name),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (roles_name) REFERENCES role(name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Invalidated Token table
CREATE TABLE IF NOT EXISTS invalided_token (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    expiry_time TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default permissions
INSERT INTO permission (name, description) VALUES
('CREATE_DATA', 'Permission to create data'),
('READ_DATA', 'Permission to read data'),
('UPDATE_DATA', 'Permission to update data'),
('DELETE_DATA', 'Permission to delete data'),
('APPROVE_POST', 'Permission to approve posts')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insert default roles
INSERT INTO role (name, description) VALUES
('ADMIN', 'Administrator with full access'),
('USER', 'Regular user'),
('STAFF', 'Staff member')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Assign permissions to roles
INSERT INTO role_permissions (role_name, permissions_name) VALUES
('ADMIN', 'CREATE_DATA'),
('ADMIN', 'READ_DATA'),
('ADMIN', 'UPDATE_DATA'),
('ADMIN', 'DELETE_DATA'),
('ADMIN', 'APPROVE_POST'),
('USER', 'READ_DATA'),
('STAFF', 'READ_DATA'),
('STAFF', 'UPDATE_DATA'),
('STAFF', 'APPROVE_POST')
ON DUPLICATE KEY UPDATE role_name = role_name;
