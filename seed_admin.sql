-- Seed admin user into the database
-- Make sure to update the email and password hash as needed

INSERT INTO admin (
    id,
    email,
    passwordHash,
    role,
    createdAt
) VALUES (
    1,
    'admin@punchinout.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO.', -- This is 'admin123' hashed with bcrypt
    'SUPER_ADMIN',
    CURRENT_TIMESTAMP
);

-- Verify the admin was created
SELECT * FROM admin WHERE email = 'admin@punchinout.com';
