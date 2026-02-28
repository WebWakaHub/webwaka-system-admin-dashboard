/**
 * UserIdentity - Main class for the User & Identity Management module
 */

import { AuthService } from './services/AuthService';
import { UserService } from './services/UserService';
import { RBACService } from './services/RBACService';
import { UserIdentityConfig } from './types';

export class UserIdentity {
  public auth: AuthService;
  public user: UserService;
  public rbac: RBACService;

  private db: any;
  private eventBus: any;
  private initialized: boolean = false;

  constructor(private config: UserIdentityConfig) {
    this.db = config.database;
    this.eventBus = config.eventBus;

    // Initialize services
    this.auth = new AuthService({
      database: this.db,
      eventBus: this.eventBus,
      jwtSecret: config.jwtSecret,
      jwtExpiresIn: config.jwtExpiresIn,
      bcryptRounds: config.bcryptRounds,
      passwordPolicy: config.passwordPolicy,
    });

    this.user = new UserService({
      database: this.db,
      eventBus: this.eventBus,
      bcryptRounds: config.bcryptRounds,
    });

    this.rbac = new RBACService({
      database: this.db,
      eventBus: this.eventBus,
    });
  }

  /**
   * Initialize the module
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Create database tables
    await this.createTables();

    this.initialized = true;

    // Emit event
    await this.eventBus.emit('user-identity.initialized', {
      timestamp: new Date(),
    });
  }

  /**
   * Shutdown the module
   */
  async shutdown(): Promise<void> {
    this.initialized = false;

    // Emit event
    await this.eventBus.emit('user-identity.shutdown', {
      timestamp: new Date(),
    });
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    // Users table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash TEXT NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        phone VARCHAR(50),
        email_verified BOOLEAN DEFAULT FALSE,
        email_verification_token UUID,
        email_verification_expires TIMESTAMP,
        password_reset_token UUID,
        password_reset_expires TIMESTAMP,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tenant_id, email)
      );

      CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
      CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON users(password_reset_token);
    `);

    // Roles table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tenant_id, name)
      );

      CREATE INDEX IF NOT EXISTS idx_roles_tenant_id ON roles(tenant_id);
    `);

    // Permissions table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        resource VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tenant_id, name)
      );

      CREATE INDEX IF NOT EXISTS idx_permissions_tenant_id ON permissions(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action);
    `);

    // User roles table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id, role_id)
      );

      CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
    `);

    // Role permissions table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
        permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
        granted_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (role_id, permission_id)
      );

      CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
      CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
    `);
  }
}
