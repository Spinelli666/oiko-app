-- CreateEnum
CREATE TYPE "CategoryKind" AS ENUM ('RECEITA', 'DESPESA');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "kind" "CategoryKind" NOT NULL DEFAULT 'DESPESA';
