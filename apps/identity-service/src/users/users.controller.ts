import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from '../common/dto/create-user.dto';
import { UpdateUserDto } from '../common/dto/update-user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ActorTypeGuard } from '../guards/actor-type.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { ActorTypes } from '../decorators/actor-types.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ActorType } from '../common/enums/actor-type.enum';
import { JwtPayload } from '../common/dto/auth.dto';

/**
 * Users Controller
 *
 * Provides CRUD endpoints for user management:
 * - POST /users — Create a new user
 * - GET /users — List users (tenant-scoped)
 * - GET /users/:id — Get a single user
 * - PATCH /users/:id — Update a user
 * - DELETE /users/:id — Deactivate a user (soft delete)
 *
 * All endpoints are protected by JWT auth and tenant isolation.
 * Actor hierarchy is enforced on create, update, and deactivate.
 *
 * Mobile-First: Paginated responses with compact JSON.
 * Offline-First: All responses include syncStatus for client-side tracking.
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(ActorTypeGuard)
  @ActorTypes(ActorType.SUPER_ADMIN, ActorType.PARTNER, ActorType.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient authority' })
  @ApiResponse({ status: 409, description: 'Email already exists in tenant' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.usersService.create(createUserDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'List users (tenant-scoped)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Users retrieved' })
  async findAll(
    @CurrentUser() currentUser: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.findAll(
      currentUser,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.usersService.findOne(id, currentUser);
  }

  @Patch(':id')
  @UseGuards(ActorTypeGuard)
  @ActorTypes(ActorType.SUPER_ADMIN, ActorType.PARTNER, ActorType.TENANT_ADMIN)
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 403, description: 'Insufficient authority' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.usersService.update(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(ActorTypeGuard)
  @ActorTypes(ActorType.SUPER_ADMIN, ActorType.PARTNER, ActorType.TENANT_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a user (soft delete)' })
  @ApiResponse({ status: 204, description: 'User deactivated' })
  @ApiResponse({ status: 403, description: 'Insufficient authority' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.usersService.deactivate(id, currentUser);
  }
}
