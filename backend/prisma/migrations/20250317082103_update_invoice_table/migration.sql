/*
  Warnings:

  - You are about to drop the `Order_Status` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `order_status` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Order_Status` DROP FOREIGN KEY `Order_Status_invoice_id_fkey`;

-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `order_status` VARCHAR(50) NOT NULL;

-- DropTable
DROP TABLE `Order_Status`;
