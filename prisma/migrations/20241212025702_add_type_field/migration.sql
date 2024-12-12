/*
  Warnings:

  - You are about to drop the `recommendation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `recommendation`;

-- CreateTable
CREATE TABLE `Clothing` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `minTemp` INTEGER NOT NULL,
    `maxTemp` INTEGER NOT NULL,
    `weather` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
