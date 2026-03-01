import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from '../common/dto/create-tenant.dto';
import {
  UpdateTenantDto,
  SuspendTenantDto,
  SetTenantConfigDto,
  SetFeatureFlagDto,
  CompleteTenantOnboardingDto,
} from '../common/dto/tenant-operations.dto';
import { TenantStatus, TenantPlan } from '../common/enums/tenant-status.enum';

/**
 * Tenants Controller
 *
 * Exposes the full tenant lifecycle API:
 * - CRUD operations
 * - Lifecycle transitions (activate, suspend, reactivate, terminate)
 * - Configuration management
 * - Feature flag management
 * - Onboarding workflow
 *
 * Mobile-First: All list endpoints are paginated.
 * Nigeria-First: Default values enforced at DTO level.
 */
@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // ===== TENANT CRUD =====

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  @ApiResponse({ status: 409, description: 'Tenant with this slug already exists' })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all tenants (Super Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: TenantStatus })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: TenantStatus,
  ) {
    return this.tenantsService.findAll(page, limit, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tenant by ID' })
  @ApiResponse({ status: 200, description: 'Tenant found' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a tenant by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tenant details' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  // ===== LIFECYCLE TRANSITIONS =====

  @Post(':id/onboarding/complete')
  @ApiOperation({ summary: 'Complete tenant onboarding (PENDING → ACTIVE)' })
  @HttpCode(HttpStatus.OK)
  completeOnboarding(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteTenantOnboardingDto,
  ) {
    return this.tenantsService.completeOnboarding(id, dto);
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend a tenant (ACTIVE → SUSPENDED)' })
  @HttpCode(HttpStatus.OK)
  suspend(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SuspendTenantDto,
  ) {
    return this.tenantsService.suspend(id, dto);
  }

  @Post(':id/reactivate')
  @ApiOperation({ summary: 'Reactivate a suspended tenant (SUSPENDED → ACTIVE)' })
  @HttpCode(HttpStatus.OK)
  reactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.reactivate(id);
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Terminate a tenant permanently' })
  @HttpCode(HttpStatus.OK)
  terminate(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.terminate(id);
  }

  @Patch(':id/plan')
  @ApiOperation({ summary: 'Change tenant subscription plan' })
  changePlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('plan') plan: TenantPlan,
  ) {
    return this.tenantsService.changePlan(id, plan);
  }

  // ===== CONFIGURATION =====

  @Get(':id/config')
  @ApiOperation({ summary: 'Get all configuration for a tenant' })
  getConfig(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.getConfig(id);
  }

  @Put(':id/config')
  @ApiOperation({ summary: 'Set a configuration value for a tenant' })
  setConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetTenantConfigDto,
  ) {
    return this.tenantsService.setConfig(id, dto);
  }

  // ===== FEATURE FLAGS =====

  @Get(':id/features')
  @ApiOperation({ summary: 'Get all feature flags for a tenant' })
  getFeatureFlags(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantsService.getFeatureFlags(id);
  }

  @Put(':id/features')
  @ApiOperation({ summary: 'Set a feature flag for a tenant' })
  setFeatureFlag(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetFeatureFlagDto,
  ) {
    return this.tenantsService.setFeatureFlag(id, dto);
  }

  @Get(':id/features/:feature/enabled')
  @ApiOperation({ summary: 'Check if a feature is enabled for a tenant' })
  isFeatureEnabled(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('feature') feature: string,
  ) {
    return this.tenantsService.isFeatureEnabled(id, feature);
  }
}
