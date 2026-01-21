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

### 2. Punch Operations
- **No Authentication Required**
- **Used for**: Both kiosk and remote punch operations
- **Mode Detection**: Automatically determined by presence of `deviceId` in request body

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
    "device": {
        "id": 1,
        "deviceCode": "DEV001",
        "location": "Main Entrance",
        "isActive": true
    }
}
```

**Note:** Device activation no longer returns a JWT token. The `deviceId` should be configured in the kiosk app settings for use in punch operations.

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
    "device": {
        "id": 1,
        "deviceCode": "DEV001",
        "location": "Main Entrance",
        "isActive": true
    }
}
```

**Note:** Device activation no longer returns a JWT token. Use the device `id` from the response to configure the kiosk app.

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

**Note:** This endpoint does not require authentication. The activation code serves as the authentication mechanism. Codes are single-use and expire after 24 hours. After activation, configure the returned device `id` in your kiosk app settings.

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

### Punch In (Unified - Kiosk & Remote)

**Kiosk Mode (with device):**
```
POST /api/punch/in
Content-Type: application/json

{
    "userId": 1,
    "deviceId": 1
}
```

**Remote Mode (without device):**
```
POST /api/punch/in
Content-Type: application/json

{
    "userId": 1
}
```

**Response (201) - Kiosk Mode:**
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
    },
    "mode": "KIOSK"
}
```

**Response (201) - Remote Mode:**
```json
{
    "message": "Punch in successful",
    "punchRecord": {
        "id": 2,
        "userId": 1,
        "deviceId": null,
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
    "device": null,
    "mode": "REMOTE"
}
```

### Punch Out (Unified - Kiosk & Remote)

**Kiosk Mode (with device):**
```
POST /api/punch/out
Content-Type: application/json

{
    "userId": 1,
    "deviceId": 1
}
```

**Remote Mode (without device):**
```
POST /api/punch/out
Content-Type: application/json

{
    "userId": 1
}
```

**Response (200) - Kiosk Mode:**
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
    },
    "mode": "KIOSK"
}
```

**Response (200) - Remote Mode:**
```json
{
    "message": "Punch out successful",
    "punchRecord": {
        "id": 2,
        "userId": 1,
        "deviceId": null,
        "punchInAt": "2026-01-15T12:30:00.000Z",
        "punchOutAt": "2026-01-15T17:45:00.000Z",
        "durationMinutes": 315,
        "status": "CLOSED",
        "createdAt": "2026-01-15T12:30:00.000Z"
    },
    "device": null,
    "mode": "REMOTE"
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
*Not applicable - punch endpoints do not require authentication*

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
    "error": "Device not found or not active"
}
```

**Note:** This error only occurs in kiosk mode when `deviceId` is provided but invalid.

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

#### Remote Mode Testing (Simplest)
1. **Admin Login** → Get `ADMIN_TOKEN`
2. **Create User** → Get `USER_ID`
3. **Punch In (Remote)** → Using only `USER_ID` (no device needed)
4. **Punch Out (Remote)** → Close the punch session

#### Kiosk Mode Testing
1. **Admin Login** → Get `ADMIN_TOKEN`
2. **Create Device** → Get device details
3. **Activate Device** → Ensure device is active
4. **Create User** → Get `USER_ID`
5. **Punch In (Kiosk)** → Using `USER_ID` and `DEVICE_ID`
6. **Punch Out (Kiosk)** → Close the punch session

### Postman Variables

Create these variables in Postman:
- `BASE_URL`: `http://localhost:3000`
- `ADMIN_TOKEN`: From admin login response
- `USER_ID`: From user creation response
- `DEVICE_ID`: From device creation response (optional, for kiosk mode)

---

## Security Isolation

### Authentication Boundaries

- **Admin APIs** require `Authorization: Bearer {{ADMIN_TOKEN}}`
- **Punch APIs** do not require authentication (open endpoints)
  - Mode is automatically determined by presence of `deviceId`
  - Kiosk mode: includes `deviceId` in request
  - Remote mode: omits `deviceId` from request

### Business Logic Validation

- **User must be ACTIVE** for all punch operations
- **Device must be active** (only validated when `deviceId` is provided in kiosk mode)
- **No duplicate punch in** (user cannot have multiple open punch sessions)
- **Punch out requires open punch session**
- **Mode detection**: Automatically set based on `deviceId` presence
  - With `deviceId` → KIOSK mode
  - Without `deviceId` → REMOTE mode

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
- `deviceId` (INTEGER REFERENCES device) - **NULLABLE** (NULL for remote punches)
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

- **Punch endpoints do not require authentication** - simplified for face API integration
- **Device tokens removed** - devices no longer use JWT authentication
- **Kiosk configuration**: Store device `id` in kiosk app settings (hardcoded/configured)
- Admin tokens expire in 24 hours
- Activation codes expire in 24 hours and are single-use
- Activation codes are automatically generated when creating a device
- **Mode detection is automatic**:
  - Request with `deviceId` → KIOSK mode (validates device)
  - Request without `deviceId` → REMOTE mode (deviceId stored as NULL)
- All timestamps are in UTC
- Database uses PostgreSQL (Neon cloud database)
- Server runs on port 3000 by default
- **Future enhancement**: Face verification API will replace `userId` parameter
