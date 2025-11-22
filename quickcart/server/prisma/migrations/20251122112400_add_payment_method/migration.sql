-- AlterTable
ALTER TABLE `order` ADD COLUMN `paymentMethod` ENUM('WALLET', 'UPI', 'COD') NOT NULL DEFAULT 'COD';
