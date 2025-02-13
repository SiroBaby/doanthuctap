/*
  Warnings:

  - You are about to alter the column `shop_address_id` on the `Shop` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Int`.
  - The primary key for the `Shop_address` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `address_id` on the `Shop_address` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `Shop` DROP FOREIGN KEY `Shop_shop_address_id_fkey`;

-- DropIndex
DROP INDEX `Shop_shop_address_id_fkey` ON `Shop`;

-- AlterTable
ALTER TABLE `Shop` MODIFY `shop_address_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `Shop_address` DROP PRIMARY KEY,
    MODIFY `address_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`address_id`);

-- AddForeignKey
ALTER TABLE `Shop` ADD CONSTRAINT `Shop_shop_address_id_fkey` FOREIGN KEY (`shop_address_id`) REFERENCES `Shop_address`(`address_id`) ON DELETE SET NULL ON UPDATE CASCADE;
