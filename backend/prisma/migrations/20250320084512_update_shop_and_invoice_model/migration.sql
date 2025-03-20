/*
  Warnings:

  - You are about to drop the column `cart_id` on the `Invoice` table. All the data in the column will be lost.
  - Added the required column `shop_id` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Invoice` DROP FOREIGN KEY `Invoice_cart_id_fkey`;

-- DropIndex
DROP INDEX `Invoice_cart_id_fkey` ON `Invoice`;

-- AlterTable
ALTER TABLE `Invoice` DROP COLUMN `cart_id`,
    ADD COLUMN `shop_id` VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_shop_id_fkey` FOREIGN KEY (`shop_id`) REFERENCES `Shop`(`shop_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
