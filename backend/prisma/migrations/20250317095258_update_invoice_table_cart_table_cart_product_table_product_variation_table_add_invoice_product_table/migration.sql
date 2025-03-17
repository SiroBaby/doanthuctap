/*
  Warnings:

  - A unique constraint covering the columns `[id_user,status]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Cart` MODIFY `status` ENUM('active', 'checkout', 'abandoned') NOT NULL DEFAULT 'active',
    MODIFY `create_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Cart_Product` ADD COLUMN `is_selected` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `create_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Invoice` MODIFY `create_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `Invoice_Product` (
    `invoice_product_id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_id` VARCHAR(255) NOT NULL,
    `product_variation_id` INTEGER NOT NULL,
    `product_name` VARCHAR(255) NOT NULL,
    `variation_name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `discount_percent` DECIMAL(5, 2) NOT NULL,
    `create_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`invoice_product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Cart_id_user_status_key` ON `Cart`(`id_user`, `status`);

-- AddForeignKey
ALTER TABLE `Invoice_Product` ADD CONSTRAINT `Invoice_Product_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `Invoice`(`invoice_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice_Product` ADD CONSTRAINT `Invoice_Product_product_variation_id_fkey` FOREIGN KEY (`product_variation_id`) REFERENCES `Product_variation`(`product_variation_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
