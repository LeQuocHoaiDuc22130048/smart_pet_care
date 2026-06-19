-- Store the product image snapshot returned to the cart UI.
ALTER TABLE cart_items
    ADD COLUMN image_url VARCHAR(1000) NULL AFTER product_name;
