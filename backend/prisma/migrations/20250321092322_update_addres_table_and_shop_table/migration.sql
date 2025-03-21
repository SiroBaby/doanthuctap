/*
  Warnings:

  - Added the required column `address_name` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Made the column `full_name` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Address` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `Address` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Address` ADD COLUMN `address_name` VARCHAR(255) NOT NULL,
    MODIFY `full_name` VARCHAR(255) NOT NULL,
    MODIFY `phone` VARCHAR(20) NOT NULL,
    MODIFY `address` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Shop` ADD COLUMN `logo` VARCHAR(255) NULL;
