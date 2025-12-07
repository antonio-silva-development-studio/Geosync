-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isActive" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- AlterTable: Add workspaceId to Organization and change slug to non-unique
-- First, drop the unique constraint on slug
CREATE TABLE "Organization_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Organization_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy data from old table
INSERT INTO "Organization_new" ("id", "name", "slug", "createdAt", "updatedAt")
SELECT "id", "name", "slug", "createdAt", "updatedAt" FROM "Organization";

-- Drop old table
DROP TABLE "Organization";

-- Rename new table
ALTER TABLE "Organization_new" RENAME TO "Organization";

-- CreateIndex
CREATE UNIQUE INDEX "Organization_workspaceId_slug_key" ON "Organization"("workspaceId", "slug");

-- CreateTable
CREATE TABLE "VariableTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isGlobal" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VariableTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VariableTemplateItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "defaultValue" TEXT,
    "isSecret" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VariableTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "VariableTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

