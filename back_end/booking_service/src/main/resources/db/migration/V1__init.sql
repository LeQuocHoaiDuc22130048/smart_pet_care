CREATE TABLE IF NOT EXISTS service_packages (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(19, 2) NOT NULL,
    duration_minutes INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(1000),
    active BIT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    avatar_url VARCHAR(1000),
    bio TEXT,
    active BIT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    pet_id VARCHAR(36) NOT NULL,
    pet_name VARCHAR(255),
    service_package_id VARCHAR(36) NOT NULL,
    staff_id VARCHAR(36) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_price DECIMAL(19, 2) NOT NULL,
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    CONSTRAINT fk_bookings_service_package FOREIGN KEY (service_package_id) REFERENCES service_packages(id),
    CONSTRAINT fk_bookings_staff FOREIGN KEY (staff_id) REFERENCES staff(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_staff_date_time ON bookings(staff_id, appointment_date, appointment_time);

INSERT INTO service_packages (id, name, description, price, duration_minutes, category, image_url, active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Spa thú cưng', 'Tắm, sấy, chải lông và vệ sinh cơ bản.', 180000.00, 90, 'GROOMING', NULL, 1),
    ('22222222-2222-2222-2222-222222222222', 'Khám sức khỏe tổng quát', 'Kiểm tra sức khỏe định kỳ cho thú cưng.', 250000.00, 45, 'HEALTH_CHECK', NULL, 1),
    ('33333333-3333-3333-3333-333333333333', 'Tiêm phòng', 'Tư vấn và tiêm vaccine theo lịch.', 300000.00, 30, 'VACCINATION', NULL, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO staff (id, name, specialization, phone, email, avatar_url, bio, active)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Nguyễn Minh Anh', 'Grooming specialist', '0900000001', 'minhanh@petcare.local', NULL, 'Chuyên chăm sóc và vệ sinh thú cưng.', 1),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Trần Hoàng Nam', 'Veterinary assistant', '0900000002', 'hoangnam@petcare.local', NULL, 'Hỗ trợ khám sức khỏe và tiêm phòng.', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);
