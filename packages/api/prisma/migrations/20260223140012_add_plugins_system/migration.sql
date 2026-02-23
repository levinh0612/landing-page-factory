-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'HANDED_OVER';

-- CreateTable
CREATE TABLE "plugins" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "icon" TEXT,
    "config_schema" JSONB,
    "is_built_in" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plugins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_plugins" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "plugin_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_plugins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_templates" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "preview_url" TEXT,
    "source_url" TEXT,
    "source" TEXT NOT NULL,
    "github_repo" TEXT,
    "stars" INTEGER,
    "cloned_to_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plugins_slug_key" ON "plugins"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "project_plugins_project_id_plugin_id_key" ON "project_plugins"("project_id", "plugin_id");

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_templates_slug_key" ON "marketplace_templates"("slug");

-- AddForeignKey
ALTER TABLE "project_plugins" ADD CONSTRAINT "project_plugins_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_plugins" ADD CONSTRAINT "project_plugins_plugin_id_fkey" FOREIGN KEY ("plugin_id") REFERENCES "plugins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
