-- AlterTable
ALTER TABLE `Invoice_Product` ADD COLUMN `discount_amount` DECIMAL(10, 2) NULL DEFAULT 0,
    ADD COLUMN `original_price` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `Voucher_storage` ADD COLUMN `is_used` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `used_at` DATETIME(3) NULL;
