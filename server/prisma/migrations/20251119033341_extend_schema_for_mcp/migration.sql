/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Play` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `playId` to the `Run` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "_CoreBlockToPlay" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CoreBlockToPlay_A_fkey" FOREIGN KEY ("A") REFERENCES "CoreBlock" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CoreBlockToPlay_B_fkey" FOREIGN KEY ("B") REFERENCES "Play" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Run" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "playId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Run_playId_fkey" FOREIGN KEY ("playId") REFERENCES "Play" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Run" ("id", "status") SELECT "id", "status" FROM "Run";
DROP TABLE "Run";
ALTER TABLE "new_Run" RENAME TO "Run";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_CoreBlockToPlay_AB_unique" ON "_CoreBlockToPlay"("A", "B");

-- CreateIndex
CREATE INDEX "_CoreBlockToPlay_B_index" ON "_CoreBlockToPlay"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Play_name_key" ON "Play"("name");
