# API Documentation

## Authentication
All APIs (except login and health check) require admin authentication via Bearer token.

### Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@punchinout.com",
  "password": "admin123"
}
```

**Response:**
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

## User APIs

### Create User
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeCode": "EMP001",
  "name": "John Doe",
  "status": "ACTIVE",
  "faceProfileId": "face_123"
}
```

### Get All Users
```http
GET /api/users?page=1&limit=10&status=ACTIVE
Authorization: Bearer <token>
```

**Response:**
```json
{
  "users": [...],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

### Get User by ID
```http
GET /api/users/1
Authorization: Bearer <token>
```

## Device APIs

### Create Device
```http
POST /api/devices
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceCode": "DEV001",
  "location": "Main Office",
  "isActive": true
}
```

### Get All Devices
```http
GET /api/devices?page=1&limit=10&isActive=true
Authorization: Bearer <token>
```

**Response:**
```json
{
  "devices": [...],
  "total": 10,
  "page": 1,
  "limit": 10
}
```

### Get Device by ID
```http
GET /api/devices/1
Authorization: Bearer <token>
```

## Health Check
```http
GET /api/health
```

## Error Responses
- `401 Unauthorized`: Invalid or missing token
- `400 Bad Request`: Validation errors
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
