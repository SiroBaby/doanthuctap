/*
  Warnings:

  - You are about to drop the column `shop_address_id` on the `Shop` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Shop` DROP FOREIGN KEY `Shop_shop_address_id_fkey`;

-- DropIndex
DROP INDEX `Shop_shop_address_id_fkey` ON `Shop`;

-- AlterTable
ALTER TABLE `Shop` DROP COLUMN `shop_address_id`;

-- AlterTable
ALTER TABLE `Shop_address` ADD COLUMN `shop_id` VARCHAR(255) NULL;

-- AddForeignKey
ALTER TABLE `Shop_address` ADD CONSTRAINT `Shop_address_shop_id_fkey` FOREIGN KEY (`shop_id`) REFERENCES `Shop`(`shop_id`) ON DELETE SET NULL ON UPDATE CASCADE;
