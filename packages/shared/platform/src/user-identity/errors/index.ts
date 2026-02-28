/**
 * Error classes for the User & Identity Management module
 */

export class UserIdentityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserIdentityError';
  }
}

export class UserNotFoundError extends UserIdentityError {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
    this.name = 'UserNotFoundError';
  }
}

export class UserAlreadyExistsError extends UserIdentityError {
  constructor(email: string) {
    super(`User already exists: ${email}`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends UserIdentityError {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class InvalidTokenError extends UserIdentityError {
  constructor() {
    super('Invalid or expired token');
    this.name = 'InvalidTokenError';
  }
}

export class EmailNotVerifiedError extends UserIdentityError {
  constructor() {
    super('Email not verified');
    this.name = 'EmailNotVerifiedError';
  }
}

export class PasswordPolicyError extends UserIdentityError {
  constructor(message: string) {
    super(`Password policy violation: ${message}`);
    this.name = 'PasswordPolicyError';
  }
}

export class RoleNotFoundError extends UserIdentityError {
  constructor(roleId: string) {
    super(`Role not found: ${roleId}`);
    this.name = 'RoleNotFoundError';
  }
}

export class PermissionNotFoundError extends UserIdentityError {
  constructor(permissionId: string) {
    super(`Permission not found: ${permissionId}`);
    this.name = 'PermissionNotFoundError';
  }
}

export class PermissionDeniedError extends UserIdentityError {
  constructor(action: string) {
    super(`Permission denied: ${action}`);
    this.name = 'PermissionDeniedError';
  }
}
