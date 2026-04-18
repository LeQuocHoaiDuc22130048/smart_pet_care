-- Flyway Migration for Product Service
-- Creates tables for products, categories, images, and inventory logs

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    category_id VARCHAR(36) NOT NULL PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    price DECIMAL(19,2),
    stock_quantity INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product-Category join table
CREATE TABLE IF NOT EXISTS product_category (
    product_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Image table
CREATE TABLE IF NOT EXISTS image (
    image_id VARCHAR(36) NOT NULL PRIMARY KEY,
    product_id VARCHAR(36),
    image_url VARCHAR(500) NOT NULL,
    is_primary BIT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory Log table
CREATE TABLE IF NOT EXISTS inventory_log (
    log_id VARCHAR(36) NOT NULL PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_image_product_id ON image(product_id);
CREATE INDEX idx_inventory_log_product_id ON inventory_log(product_id);
CREATE INDEX idx_inventory_log_created_at ON inventory_log(created_at);

-- Insert sample categories
INSERT INTO categories (category_id, category_name, description) VALUES
('cat-001', 'Thức ăn & Dinh dưỡng', 'Thức ăn, bánh thưởng, sữa cho thú cưng'),
('cat-002', 'Vệ sinh & Chăm sóc', 'Sữa tắm, dầu xả, dụng cụ vệ sinh'),
('cat-003', 'Nhà Chuồng & Nệm', 'Chuồng, nệm, thảm, ổ đệm'),
('cat-004', 'Đồ dùng & Phụ kiện', 'Balo, túi đựng, vòng cổ, dây dắt')
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name);
