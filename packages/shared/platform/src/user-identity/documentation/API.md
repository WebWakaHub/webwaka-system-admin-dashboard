# User & Identity Management - API Reference

**Date:** 2026-02-12  
**Module:** User & Identity Management  
**Author:** webwakaagent3 (Specifications & Documentation)

---

## 1. Authentication API

### `POST /auth/register`

Register a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "emailVerified": false,
  "createdAt": "2026-02-12T12:00:00.000Z"
}
```

### `POST /auth/login`

Log in a user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**

```json
{
  "accessToken": "jwt-token",
  "expiresIn": 604800,
  "tokenType": "Bearer"
}
```

## 2. User API

### `GET /users/me`

Get the profile of the currently authenticated user.

**Response (200):**

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "emailVerified": true,
  "createdAt": "2026-02-12T12:00:00.000Z"
}
```

### `PUT /users/me`

Update the profile of the currently authenticated user.

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response (200):**

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "emailVerified": true,
  "createdAt": "2026-02-12T12:00:00.000Z"
}
```

### `POST /users/me/password`

Change the password of the currently authenticated user.

**Request Body:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Response (204):** No content.

## 3. Password Reset API

### `POST /password/reset`

Initiate the password reset process for a user.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (204):** No content.

### `POST /password/reset/:token`

Complete the password reset process using a token sent to the user's email.

**Request Body:**

```json
{
  "newPassword": "NewPassword789!"
}
```

**Response (204):** No content.

## 4. RBAC API

### `POST /roles`

Create a new role.

**Request Body:**

```json
{
  "name": "editor",
  "description": "Content Editor"
}
```

**Response (201):**

```json
{
  "id": "role-id",
  "name": "editor",
  "description": "Content Editor",
  "createdAt": "2026-02-12T12:00:00.000Z"
}
```

### `GET /roles`

List all roles for the tenant.

**Response (200):**

```json
[
  {
    "id": "role-id",
    "name": "editor",
    "description": "Content Editor",
    "createdAt": "2026-02-12T12:00:00.000Z"
  }
]
```

### `POST /permissions`

Create a new permission.

**Request Body:**

```json
{
  "name": "posts.create",
  "resource": "posts",
  "action": "create",
  "description": "Create blog posts"
}
```

**Response (201):**

```json
{
  "id": "permission-id",
  "name": "posts.create",
  "resource": "posts",
  "action": "create",
  "description": "Create blog posts",
  "createdAt": "2026-02-12T12:00:00.000Z"
}
```

### `POST /roles/:roleId/permissions`

Grant a permission to a role.

**Request Body:**

```json
{
  "permissionId": "permission-id"
}
```

**Response (204):** No content.

### `POST /users/:userId/roles`

Assign a role to a user.

**Request Body:**

```json
{
  "roleId": "role-id"
}
```

**Response (204):** No content.
