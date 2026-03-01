import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateTenancyTables
 *
 * Creates the core tenancy tables with PostgreSQL Row-Level Security (RLS).
 *
 * Tables created:
 * - tenants: Core tenant records
 * - tenant_configs: Per-tenant configuration key-value store
 * - tenant_feature_flags: Per-tenant feature gate system
 *
 * RLS Policies:
 * - All tenant-scoped tables enforce: tenantId = current_setting('app.current_tenant_id')
 * - Super Admin bypass: current_setting('app.bypass_rls', true) = 'true'
 *
 * Nigeria-First: Default values for locale, timezone, currency, countryCode.
 */
export class CreateTenancyTables1709280000000 implements MigrationInterface {
  name = 'CreateTenancyTables1709280000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ===== TENANTS TABLE =====
    await queryRunner.query(`
      CREATE TYPE "tenant_status_enum" AS ENUM (
        'PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "tenant_plan_enum" AS ENUM (
        'STARTER', 'GROWTH', 'ENTERPRISE', 'CUSTOM'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id"                   UUID NOT NULL DEFAULT gen_random_uuid(),
        "name"                 VARCHAR(255) NOT NULL,
        "slug"                 VARCHAR(100) NOT NULL,
        "partnerId"            UUID,
        "status"               "tenant_status_enum" NOT NULL DEFAULT 'PENDING',
        "plan"                 "tenant_plan_enum" NOT NULL DEFAULT 'STARTER',
        "contactEmail"         VARCHAR(255) NOT NULL,
        "contactPhone"         VARCHAR(20),
        "countryCode"          VARCHAR(2) NOT NULL DEFAULT 'NG',
        "locale"               VARCHAR(10) NOT NULL DEFAULT 'en-NG',
        "timezone"             VARCHAR(50) NOT NULL DEFAULT 'Africa/Lagos',
        "currency"             VARCHAR(3) NOT NULL DEFAULT 'NGN',
        "branding"             JSONB,
        "maxUsers"             INTEGER NOT NULL DEFAULT 10,
        "maxStorageMb"         INTEGER NOT NULL DEFAULT 1024,
        "onboardingCompleted"  BOOLEAN NOT NULL DEFAULT false,
        "activatedAt"          TIMESTAMP,
        "suspendedAt"          TIMESTAMP,
        "suspensionReason"     TEXT,
        "terminatedAt"         TIMESTAMP,
        "syncStatus"           VARCHAR(10) NOT NULL DEFAULT 'synced',
        "createdAt"            TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"            TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenants" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenants_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenants_partnerId" ON "tenants" ("partnerId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_tenants_status" ON "tenants" ("status")
    `);

    // ===== TENANT_CONFIGS TABLE =====
    await queryRunner.query(`
      CREATE TABLE "tenant_configs" (
        "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
        "tenantId"    UUID NOT NULL,
        "key"         VARCHAR(255) NOT NULL,
        "value"       TEXT NOT NULL,
        "isSensitive" BOOLEAN NOT NULL DEFAULT false,
        "description" TEXT,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenant_configs" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenant_configs_tenant_key" UNIQUE ("tenantId", "key"),
        CONSTRAINT "FK_tenant_configs_tenant" FOREIGN KEY ("tenantId")
          REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_configs_tenantId" ON "tenant_configs" ("tenantId")
    `);

    // ===== TENANT_FEATURE_FLAGS TABLE =====
    await queryRunner.query(`
      CREATE TABLE "tenant_feature_flags" (
        "id"        UUID NOT NULL DEFAULT gen_random_uuid(),
        "tenantId"  UUID NOT NULL,
        "feature"   VARCHAR(255) NOT NULL,
        "enabled"   BOOLEAN NOT NULL DEFAULT false,
        "metadata"  JSONB,
        "toggledAt" TIMESTAMP,
        "toggledBy" UUID,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenant_feature_flags" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenant_feature_flags_tenant_feature" UNIQUE ("tenantId", "feature"),
        CONSTRAINT "FK_tenant_feature_flags_tenant" FOREIGN KEY ("tenantId")
          REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_tenant_feature_flags_tenantId" ON "tenant_feature_flags" ("tenantId")
    `);

    // ===== POSTGRESQL ROW-LEVEL SECURITY (RLS) =====
    // Enable RLS on tenant-scoped tables
    await queryRunner.query(`ALTER TABLE "tenant_configs" ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE "tenant_feature_flags" ENABLE ROW LEVEL SECURITY`);

    // RLS Policy for tenant_configs:
    // - Super Admin bypass: current_setting('app.bypass_rls', true) = 'true'
    // - All others: tenantId must match current session tenant
    await queryRunner.query(`
      CREATE POLICY "tenant_configs_isolation" ON "tenant_configs"
        USING (
          current_setting('app.bypass_rls', true) = 'true'
          OR "tenantId"::text = current_setting('app.current_tenant_id', true)
        )
    `);

    // RLS Policy for tenant_feature_flags
    await queryRunner.query(`
      CREATE POLICY "tenant_feature_flags_isolation" ON "tenant_feature_flags"
        USING (
          current_setting('app.bypass_rls', true) = 'true'
          OR "tenantId"::text = current_setting('app.current_tenant_id', true)
        )
    `);

    // Note: The tenants table itself does NOT have RLS — it is the root isolation table.
    // Access to tenants is controlled at the application layer via TenantGuard.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop RLS policies
    await queryRunner.query(`DROP POLICY IF EXISTS "tenant_feature_flags_isolation" ON "tenant_feature_flags"`);
    await queryRunner.query(`DROP POLICY IF EXISTS "tenant_configs_isolation" ON "tenant_configs"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_feature_flags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant_configs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenants"`);

    // Drop types
    await queryRunner.query(`DROP TYPE IF EXISTS "tenant_plan_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "tenant_status_enum"`);
  }
}
