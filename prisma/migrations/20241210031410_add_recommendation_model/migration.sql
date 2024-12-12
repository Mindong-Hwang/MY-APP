/*
  Warnings:

  - You are about to drop the `clothing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `clothing`;

-- CreateTable
CREATE TABLE `Recommendation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result` VARCHAR(191) NOT NULL,
    `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Recommendation_result_key`(`result`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
