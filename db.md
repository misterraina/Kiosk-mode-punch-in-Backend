user :- 
id
employeeCode
name
status            // ACTIVE | DISABLED
faceProfileId     // reference only
createdAt

admin :- 
id
email
passwordHash
role              // SUPER_ADMIN | ADMIN
createdAt


Device:- 
id
deviceCode        // printed QR or manually entered
location
isActive
lastSeenAt


PunchRecords:- 
id
userId
deviceId
punchInAt
punchOutAt        // nullable
durationMinutes   // derived
status            // OPEN | CLOSED | INVALID


Session/Auth
id
subjectId         // adminId or deviceId
subjectType       // ADMIN | DEVICE
expiresAt


Office/Organization
id
name
timezone

AuditLog
id
actorType         // ADMIN | DEVICE | SYSTEM
actorId
action
metadata
createdAt
