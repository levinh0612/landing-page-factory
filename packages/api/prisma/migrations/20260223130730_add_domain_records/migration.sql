-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'TRANSFERRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "domain_records" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "project_id" TEXT,
    "registrar" TEXT,
    "purchased_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "purchase_cost" DOUBLE PRECISION,
    "renew_cost" DOUBLE PRECISION,
    "billed_amount" DOUBLE PRECISION,
    "notes" TEXT,
    "status" "DomainStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domain_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "domain_records_domain_key" ON "domain_records"("domain");

-- AddForeignKey
ALTER TABLE "domain_records" ADD CONSTRAINT "domain_records_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_records" ADD CONSTRAINT "domain_records_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
