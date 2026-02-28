# User & Identity Management Module

A comprehensive user authentication, authorization, and identity management system for the WebWaka platform.

## Features

- **User Registration**: Email/password registration with email verification
- **User Authentication**: Secure login with JWT-based sessions
- **Password Management**: Password reset and change functionality
- **Role-Based Access Control (RBAC)**: Flexible roles and permissions system
- **Multi-Tenant Support**: Strict data isolation by tenant
- **Event-Driven**: Emits events for all significant operations

## Installation

```typescript
import { UserIdentity } from './user-identity';

const userIdentity = new UserIdentity({
  database: db,
  eventBus: eventBus,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '7d',
  bcryptRounds: 10,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
});

await userIdentity.initialize();
```

## Usage

### User Registration

```typescript
const user = await userIdentity.auth.register(tenantId, {
  email: 'user@example.com',
  password: 'SecurePassword123!',
  firstName: 'John',
  lastName: 'Doe',
});
```

### User Login

```typescript
const token = await userIdentity.auth.login(tenantId, {
  email: 'user@example.com',
  password: 'SecurePassword123!',
});

console.log(token.accessToken); // JWT token
```

### Update User Profile

```typescript
const profile = await userIdentity.user.updateProfile(tenantId, userId, {
  firstName: 'Jane',
  phone: '+2348012345678',
});
```

### Change Password

```typescript
await userIdentity.user.changePassword(
  tenantId,
  userId,
  'OldPassword123!',
  'NewPassword456!'
);
```

### Password Reset

```typescript
// Step 1: Initiate reset
await userIdentity.user.initiatePasswordReset(tenantId, 'user@example.com');

// Step 2: Complete reset (with token from email)
await userIdentity.user.completePasswordReset(tenantId, resetToken, 'NewPassword789!');
```

### RBAC

```typescript
// Create a role
const role = await userIdentity.rbac.createRole(tenantId, 'editor', 'Content Editor');

// Create a permission
const permission = await userIdentity.rbac.createPermission(
  tenantId,
  'posts.create',
  'posts',
  'create',
  'Create blog posts'
);

// Grant permission to role
await userIdentity.rbac.grantPermissionToRole(tenantId, role.id, permission.id);

// Assign role to user
await userIdentity.rbac.assignRoleToUser(tenantId, userId, role.id);

// Check permission
const canCreate = await userIdentity.rbac.hasPermission(tenantId, userId, 'posts', 'create');

// Enforce permission (throws if denied)
await userIdentity.rbac.enforcePermission(tenantId, userId, 'posts', 'create');
```

## API Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Log in a user
- `POST /auth/logout` - Log out a user
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile
- `POST /users/me/password` - Change password
- `POST /password/reset` - Initiate password reset
- `POST /password/reset/:token` - Complete password reset

## Events

- `user.created` - When a new user is created
- `user.updated` - When a user's profile is updated
- `user.login` - When a user logs in
- `user.password.changed` - When a user changes their password
- `user.password.reset.requested` - When a password reset is requested
- `user.password.reset.completed` - When a password reset is completed
- `role.created` - When a new role is created
- `permission.created` - When a new permission is created
- `user.role.assigned` - When a role is assigned to a user
- `user.role.removed` - When a role is removed from a user
- `role.permission.granted` - When a permission is granted to a role
- `role.permission.revoked` - When a permission is revoked from a role

## Security

- **Password Hashing**: All passwords are hashed using bcrypt with configurable rounds
- **JWT Tokens**: Secure, stateless authentication using JSON Web Tokens
- **Password Policy**: Configurable password complexity requirements
- **Email Verification**: Optional email verification for new accounts
- **Password Reset**: Secure password reset with time-limited tokens
- **Multi-Tenant Isolation**: Strict data isolation by tenant ID

## Database Schema

See `UserIdentity.ts` for the complete database schema.
