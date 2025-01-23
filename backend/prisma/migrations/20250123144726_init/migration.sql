-- CreateTable
CREATE TABLE `User` (
    `id_user` VARCHAR(255) NOT NULL,
    `user_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `avatar` VARCHAR(255) NULL,
    `status` VARCHAR(50) NULL,
    `role` ENUM('admin', 'seller', 'user') NOT NULL,
    `create_at` DATETIME(3) NULL,
    `update_at` DATETIME(3) NULL,
    `delete_at` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Address` (
    `address_id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `address` TEXT NULL,
    `is_default` BOOLEAN NULL,
    `id_user` VARCHAR(255) NOT NULL,
    `create_at` DATETIME(3) NULL,
    `update_at` DATETIME(3) NULL,
    `delete_at` DATETIME(3) NULL,

    PRIMARY KEY (`address_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
    `location_id` VARCHAR(255) NOT NULL,
    `location_name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`location_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shop_address` (
    `address_id` VARCHAR(255) NOT NULL,
    `address` TEXT NOT NULL,
    `phone` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`address_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shop` (
    `shop_id` VARCHAR(255) NOT NULL,
    `shop_name` VARCHAR(255) NULL,
    `link` VARCHAR(255) NULL,
    `status` ENUM('active', 'inactive', 'banned') NOT NULL,
    `location_id` VARCHAR(255) NULL,
    `shop_address_id` VARCHAR(255) NULL,
    `id_user` VARCHAR(255) NOT NULL,
    `create_at` DATETIME(3) NULL,
    `update_at` DATETIME(3) NULL,
    `delete_at` DATETIME(3) NULL,

    PRIMARY KEY (`shop_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_name` VARCHAR(255) NULL,
    `create_at` DATETIME(3) NULL,
    `update_at` DATETIME(3) NULL,

    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product_Detail` (
    `product_detail_id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` TEXT NULL,
    `specifications` TEXT NULL,
    `create_at` DATETIME(3) NULL,
    `update_at` DATETIME(3) NULL,

    PRIMARY KEY (`product_detail_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `product_id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_name` VARCHAR(255) NOT NULL,
    `brand` VARCHAR(255) NULL,
    `status` ENUM('active', 'inactive', 'out_of_stock') NOT NULL,
    `category_id` INTEGER NULL,
    `product_detail_id` INTEGER NULL,
    `shop_id` VARCHAR(255) NOT NULL,
    `create_at` DATETIME(3) NULL,
    `update_at` DATETIME(3) NULL,
    `delete_at` DATETIME(3) NULL,

    UNIQUE INDEX `Product_product_detail_id_key`(`product_detail_id`),
    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product_Image` (
    `image_id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `image_url` VARCHAR(255) NOT NULL,
    `is_thumbnail` BOOLEAN NULL,
    `create_at` DATETIME(3) NULL,

    PRIMARY KEY (`image_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product_variation` (
    `product_variation_id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_variation_name` VARCHAR(255) NOT NULL,
    `base_price` DECIMAL(10, 2) NOT NULL,
    `percent_discount` DECIMAL(5, 2) NOT NULL,
    `stock_quantity` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive', 'out_of_stock') NOT NULL,
    `product_id` INTEGER NOT NULL,
    `create_at` DATETIME(3) NULL,
    `update_at` DATETIME(3) NULL,

    PRIMARY KEY (`product_variation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart` (
    `cart_id` VARCHAR(255) NOT NULL,
    `id_user` VARCHAR(255) NOT NULL,
    `status` ENUM('active', 'checkout', 'abandoned') NOT NULL,
    `create_at` DATETIME(3) NULL,
    `update_at` DATETIME(3) NULL,

    PRIMARY KEY (`cart_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart_Product` (
    `cart_product_id` INTEGER NOT NULL AUTO_INCREMENT,
    `cart_id` VARCHAR(255) NOT NULL,
    `product_variation_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `create_at` DATETIME(3) NULL,
    `update_at` DATETIME(3) NULL,

    PRIMARY KEY (`cart_product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Voucher` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(255) NOT NULL,
    `discount_percent` DOUBLE NOT NULL,
    `minimum_require_price` DECIMAL(10, 2) NOT NULL,
    `max_discount_price` DECIMAL(10, 2) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `max_use_per_user` INTEGER NULL,
    `valid_from` DATE NULL,
    `valid_to` DATE NULL,
    `create_at` DATETIME(3) NULL,
    `delete_at` DATETIME(3) NULL,

    UNIQUE INDEX `Voucher_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shop_Voucher` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(255) NOT NULL,
    `discount_percent` DOUBLE NOT NULL,
    `minimum_require_price` DECIMAL(10, 2) NOT NULL,
    `max_discount_price` DECIMAL(10, 2) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `max_use_per_user` INTEGER NULL,
    `shop_id` VARCHAR(255) NOT NULL,
    `valid_from` DATE NULL,
    `valid_to` DATE NULL,
    `create_at` DATETIME(3) NULL,
    `delete_at` DATETIME(3) NULL,

    UNIQUE INDEX `Shop_Voucher_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Voucher_storage` (
    `voucher_storage_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(255) NOT NULL,
    `voucher_id` INTEGER NOT NULL,
    `voucher_type` ENUM('voucher', 'shop_voucher') NOT NULL,
    `claimed_at` DATETIME(3) NULL,

    PRIMARY KEY (`voucher_storage_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `invoice_id` VARCHAR(255) NOT NULL,
    `payment_method` VARCHAR(255) NULL,
    `payment_status` VARCHAR(50) NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `shipping_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `id_user` VARCHAR(255) NOT NULL,
    `cart_id` VARCHAR(255) NOT NULL,
    `voucher_storage_id` INTEGER NULL,
    `shipping_address_id` INTEGER NULL,
    `create_at` DATETIME(3) NULL,
    `update_at` DATETIME(3) NULL,

    PRIMARY KEY (`invoice_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order_Status` (
    `status_id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_id` VARCHAR(255) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `notes` TEXT NULL,
    `create_at` DATETIME(3) NULL,

    PRIMARY KEY (`status_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `review_id` INTEGER NOT NULL AUTO_INCREMENT,
    `rating` DOUBLE NOT NULL,
    `comment` TEXT NULL,
    `is_review` BOOLEAN NULL,
    `product_id` INTEGER NOT NULL,
    `id_user` VARCHAR(255) NOT NULL,
    `create_at` DATETIME(3) NULL,
    `update_at` DATETIME(3) NULL,

    PRIMARY KEY (`review_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chat` (
    `chat_id` VARCHAR(255) NOT NULL,
    `id_user` VARCHAR(255) NOT NULL,
    `shop_id` VARCHAR(255) NOT NULL,
    `last_message_at` DATETIME(3) NULL,
    `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`chat_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chat_Message` (
    `message_id` INTEGER NOT NULL AUTO_INCREMENT,
    `chat_id` VARCHAR(255) NOT NULL,
    `sender_type` ENUM('user', 'shop') NOT NULL,
    `sender_id` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `sent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_read` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Favorite` (
    `favorite_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(255) NOT NULL,
    `product_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Favorite_user_id_product_id_key`(`user_id`, `product_id`),
    PRIMARY KEY (`favorite_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shop` ADD CONSTRAINT `Shop_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shop` ADD CONSTRAINT `Shop_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Location`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shop` ADD CONSTRAINT `Shop_shop_address_id_fkey` FOREIGN KEY (`shop_address_id`) REFERENCES `Shop_address`(`address_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`category_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_product_detail_id_fkey` FOREIGN KEY (`product_detail_id`) REFERENCES `Product_Detail`(`product_detail_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_shop_id_fkey` FOREIGN KEY (`shop_id`) REFERENCES `Shop`(`shop_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product_Image` ADD CONSTRAINT `Product_Image_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product_variation` ADD CONSTRAINT `Product_variation_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart_Product` ADD CONSTRAINT `Cart_Product_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `Cart`(`cart_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart_Product` ADD CONSTRAINT `Cart_Product_product_variation_id_fkey` FOREIGN KEY (`product_variation_id`) REFERENCES `Product_variation`(`product_variation_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shop_Voucher` ADD CONSTRAINT `Shop_Voucher_shop_id_fkey` FOREIGN KEY (`shop_id`) REFERENCES `Shop`(`shop_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Voucher_storage` ADD CONSTRAINT `Voucher_storage_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Voucher_storage` ADD CONSTRAINT `Voucher_storage_voucher_fk` FOREIGN KEY (`voucher_id`) REFERENCES `Voucher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Voucher_storage` ADD CONSTRAINT `Voucher_storage_shop_voucher_fk` FOREIGN KEY (`voucher_id`) REFERENCES `Shop_Voucher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `Cart`(`cart_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_voucher_storage_id_fkey` FOREIGN KEY (`voucher_storage_id`) REFERENCES `Voucher_storage`(`voucher_storage_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order_Status` ADD CONSTRAINT `Order_Status_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`invoice_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_shop_id_fkey` FOREIGN KEY (`shop_id`) REFERENCES `Shop`(`shop_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat_Message` ADD CONSTRAINT `Chat_Message_chat_id_fkey` FOREIGN KEY (`chat_id`) REFERENCES `Chat`(`chat_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
