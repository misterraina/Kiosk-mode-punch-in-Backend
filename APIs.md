# PunchInPunchOut API Documentation

## Overview

This document provides complete API documentation for the PunchInPunchOut system, including authentication, device management, and punch operations.

## Base URL
```
http://localhost:3000
```

## Authentication Types

### 1. Admin Authentication
- **Header**: `Authorization: Bearer {{ADMIN_TOKEN}}`
- **Used for**: Admin-only operations (device/user management)
- **Get token from**: `/api/admin/login`

### 2. Device Authentication  
- **Header**: `X-Device-Token: {{DEVICE_TOKEN}}`
- **Used for**: Punch operations
- **Get token from**: `/api/devices/activate`

---

## Admin Authentication APIs

### Admin Login
```
POST /api/admin/login
Content-Type: application/json

{
    "email": "admin@punchinout.com",
    "password": "admin123"
}
```

**Response (200):**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
        "id": 1,
        "email": "admin@punchinout.com",
        "role": "SUPER_ADMIN"
    }
}
```

---

## Device Management APIs

### Create Device (Admin Only)
```
POST /api/devices
Content-Type: application/json
Authorization: Bearer {{ADMIN_TOKEN}}

{
    "deviceCode": "DEV001",
    "location": "Main Entrance"
}
```

**Response (201):**
```json
{
    "device": {
        "id": 1,
        "deviceCode": "DEV001",
        "location": "Main Entrance",
        "isActive": false,
        "lastSeenAt": null
    },
    "activationCode": "DEV001-A3F2B8C1",
    "message": "Device created successfully"
}
```

**Note:** The `activationCode` is a one-time use code that expires in 24 hours. Share this code with the device user to activate the device.

### Get All Devices (Admin Only)
```
GET /api/devices?page=1&limit=10&isActive=false
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Response (200):**
```json
{
    "devices": [
        {
            "id": 1,
            "deviceCode": "DEV001",
            "location": "Main Entrance",
            "isActive": false,
            "lastSeenAt": null
        }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
}
```

### Get Device by ID (Admin Only)
```
GET /api/devices/1
Authorization: Bearer {{ADMIN_TOKEN}}
```

### Activate Device (Admin Only)
```
POST /api/devices/activate
Content-Type: application/json
Authorization: Bearer {{ADMIN_TOKEN}}

{
    "deviceCode": "DEV001"
}
```

**Response (200):**
```json
{
    "message": "Device activated successfully",
    "deviceToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "device": {
        "id": 1,
        "deviceCode": "DEV001",
        "location": "Main Entrance",
        "isActive": true
    }
}
```

### Deactivate Device (Admin Only)
```
POST /api/devices/deactivate
Content-Type: application/json
Authorization: Bearer {{ADMIN_TOKEN}}

{
    "deviceCode": "DEV001"
}
```

**Response (200):**
```json
{
    "message": "Device deactivated successfully",
    "device": {
        "id": 1,
        "deviceCode": "DEV001",
        "location": "Main Entrance",
        "isActive": false
    }
}
```

### Activate Device with Activation Code (No Auth Required)
```
POST /api/devices/activate-with-code
Content-Type: application/json

{
    "activationCode": "DEV001-A3F2B8C1"
}
```

**Response (200):**
```json
{
    "message": "Device activated successfully",
    "deviceToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "device": {
        "id": 1,
        "deviceCode": "DEV001",
        "location": "Main Entrance",
        "isActive": true
    }
}
```

**Error Responses:**

**400 - Code Already Used:**
```json
{
    "error": "Activation code has already been used"
}
```

**400 - Code Expired:**
```json
{
    "error": "Activation code has expired"
}
```

**404 - Invalid Code:**
```json
{
    "error": "Invalid activation code"
}
```

**Note:** This endpoint does not require authentication. The activation code serves as the authentication mechanism. Codes are single-use and expire after 24 hours.

---

## User Management APIs

### Create User (Admin Only)
```
POST /api/users
Content-Type: application/json
Authorization: Bearer {{ADMIN_TOKEN}}

{
    "employeeCode": "EMP001",
    "name": "John Doe",
    "status": "ACTIVE"
}
```

**Response (201):**
```json
{
    "id": 1,
    "employeeCode": "EMP001",
    "name": "John Doe",
    "status": "ACTIVE",
    "faceProfileId": null,
    "createdAt": "2026-01-15T12:00:00.000Z"
}
```

### Get All Users (Admin Only)
```
GET /api/users?page=1&limit=10&status=ACTIVE
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Response (200):**
```json
{
    "users": [
        {
            "id": 1,
            "employeeCode": "EMP001",
            "name": "John Doe",
            "status": "ACTIVE",
            "faceProfileId": null,
            "createdAt": "2026-01-15T12:00:00.000Z"
        }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
}
```

### Get User by ID (Admin Only)
```
GET /api/users/1
Authorization: Bearer {{ADMIN_TOKEN}}
```

---

## Punch Operations APIs

### Punch In (Device Authenticated)
```
POST /api/punch/in
Content-Type: application/json
X-Device-Token: {{DEVICE_TOKEN}}

{
    "userId": 1
}
```

**Response (201):**
```json
{
    "message": "Punch in successful",
    "punchRecord": {
        "id": 1,
        "userId": 1,
        "deviceId": 1,
        "punchInAt": "2026-01-15T12:30:00.000Z",
        "punchOutAt": null,
        "durationMinutes": null,
        "status": "OPEN",
        "createdAt": "2026-01-15T12:30:00.000Z"
    },
    "user": {
        "id": 1,
        "employeeCode": "EMP001",
        "name": "John Doe",
        "status": "ACTIVE",
        "faceProfileId": null,
        "createdAt": "2026-01-15T12:00:00.000Z"
    },
    "device": {
        "id": 1,
        "deviceCode": "DEV001",
        "location": "Main Entrance",
        "isActive": true,
        "lastSeenAt": "2026-01-15T12:30:00.000Z"
    }
}
```

### Punch Out (Device Authenticated)
```
POST /api/punch/out
Content-Type: application/json
X-Device-Token: {{DEVICE_TOKEN}}

{
    "userId": 1
}
```

**Response (200):**
```json
{
    "message": "Punch out successful",
    "punchRecord": {
        "id": 1,
        "userId": 1,
        "deviceId": 1,
        "punchInAt": "2026-01-15T12:30:00.000Z",
        "punchOutAt": "2026-01-15T17:45:00.000Z",
        "durationMinutes": 315,
        "status": "CLOSED",
        "createdAt": "2026-01-15T12:30:00.000Z"
    },
    "device": {
        "id": 1,
        "deviceCode": "DEV001",
        "location": "Main Entrance",
        "isActive": true,
        "lastSeenAt": "2026-01-15T17:45:00.000Z"
    }
}
```

### Get User Punch Records
```
GET /api/punch/user/1?page=1&limit=10&status=OPEN
```

**Response (200):**
```json
{
    "punchRecords": [
        {
            "id": 1,
            "userId": 1,
            "deviceId": 1,
            "punchInAt": "2026-01-15T12:30:00.000Z",
            "punchOutAt": null,
            "durationMinutes": null,
            "status": "OPEN",
            "createdAt": "2026-01-15T12:30:00.000Z",
            "userName": "John Doe",
            "employeeCode": "EMP001",
            "deviceCode": "DEV001",
            "location": "Main Entrance"
        }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
}
```

---

## Error Responses

### Common Error Codes

#### 400 Bad Request
```json
{
    "error": "User ID is required"
}
```

#### 401 Unauthorized
```json
{
    "error": "Device token required"
}
```
```json
{
    "error": "Invalid device token"
}
```

#### 404 Not Found
```json
{
    "error": "User not found or not active"
}
```

#### 500 Internal Server Error
```json
{
    "error": "Internal server error",
    "details": "Database connection failed"
}
```

### Punch In Specific Errors

```json
{
    "error": "User already has an open punch session"
}
```

```json
{
    "error": "Device is not active"
}
```

### Device Management Specific Errors

```json
{
    "error": "Device code already exists"
}
```

```json
{
    "error": "Device is already active"
}
```

```json
{
    "error": "Device is already inactive"
}
```

---

## Testing Flow

### Complete Testing Sequence

#### Option 1: Using Activation Code (Recommended)
1. **Admin Login** → Get `ADMIN_TOKEN`
2. **Create Device** → Get `ACTIVATION_CODE` (e.g., `DEV001-A3F2B8C1`)
3. **Activate Device with Code** → Get `DEVICE_TOKEN` (no admin auth needed)
4. **Create User** → Get `USER_ID`
5. **Punch In** → Using `DEVICE_TOKEN` and `USER_ID`
6. **Punch Out** → Close the punch session

#### Option 2: Using Admin Token (Legacy)
1. **Admin Login** → Get `ADMIN_TOKEN`
2. **Create Device** → Device created with `isActive: false`
3. **Activate Device** → Get `DEVICE_TOKEN` (requires admin auth)
4. **Create User** → Get `USER_ID`
5. **Punch In** → Using `DEVICE_TOKEN` and `USER_ID`
6. **Punch Out** → Close the punch session

### Postman Variables

Create these variables in Postman:
- `BASE_URL`: `http://localhost:3000`
- `ADMIN_TOKEN`: From admin login response
- `ACTIVATION_CODE`: From device creation response
- `DEVICE_TOKEN`: From device activation response
- `USER_ID`: From user creation response

---

## Security Isolation

### Authentication Boundaries

- **Admin APIs** require `Authorization: Bearer {{ADMIN_TOKEN}}`
- **Device APIs** require `X-Device-Token: {{DEVICE_TOKEN}}`
- **Cross-authentication fails**:
  - Using admin token on punch endpoints → 401 Unauthorized
  - Using device token on admin endpoints → 401 Unauthorized

### Business Logic Validation

- **Device must be active** for punch operations
- **User must be ACTIVE** for punch operations
- **No duplicate punch in** (user cannot have open punch session)
- **Punch out requires open punch session**

---

## Database Schema

### Tables

#### admin
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR(255) UNIQUE)
- `passwordHash` (VARCHAR(255))
- `role` (VARCHAR(50))
- `createdAt` (TIMESTAMP)

#### user
- `id` (SERIAL PRIMARY KEY)
- `employeeCode` (VARCHAR(50) UNIQUE)
- `name` (VARCHAR(255))
- `status` (VARCHAR(20)) - ACTIVE/DISABLED
- `faceProfileId` (VARCHAR(255))
- `createdAt` (TIMESTAMP)

#### device
- `id` (SERIAL PRIMARY KEY)
- `deviceCode` (VARCHAR(50) UNIQUE)
- `location` (VARCHAR(255))
- `isActive` (BOOLEAN) - DEFAULT false
- `lastSeenAt` (TIMESTAMP)

#### punchRecords
- `id` (SERIAL PRIMARY KEY)
- `userId` (INTEGER REFERENCES user)
- `deviceId` (INTEGER REFERENCES device)
- `punchInAt` (TIMESTAMP)
- `punchOutAt` (TIMESTAMP)
- `durationMinutes` (GENERATED)
- `status` (VARCHAR(20)) - OPEN/CLOSED/INVALID
- `createdAt` (TIMESTAMP)

#### activation_codes
- `id` (SERIAL PRIMARY KEY)
- `code` (VARCHAR(255) UNIQUE)
- `deviceId` (INTEGER REFERENCES device)
- `expiresAt` (TIMESTAMP)
- `isUsed` (BOOLEAN) - DEFAULT false
- `usedAt` (TIMESTAMP)
- `createdAt` (TIMESTAMP)

---

## Health Check

### Server Health
```
GET /api/health
```

**Response (200):**
```json
{
    "status": "OK",
    "timestamp": "2026-01-15T12:00:00.000Z"
}
```

### Test Endpoint
```
GET /api/test
```

**Response (200):**
```json
{
    "message": "Server is working!",
    "timestamp": "2026-01-15T12:00:00.000Z"
}
```

---

## Notes

- Device tokens are long-lived (365 days)
- Admin tokens expire in 24 hours
- Activation codes expire in 24 hours and are single-use
- Activation codes are automatically generated when creating a device
- All timestamps are in UTC
- Database uses PostgreSQL (Neon cloud database)
- Server runs on port 3000 by default
