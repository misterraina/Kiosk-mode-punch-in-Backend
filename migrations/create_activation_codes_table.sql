-- Create activation_codes table
CREATE TABLE IF NOT EXISTS activation_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255) UNIQUE NOT NULL,
    deviceId INTEGER NOT NULL REFERENCES device(id) ON DELETE CASCADE,
    expiresAt TIMESTAMP NOT NULL,
    isUsed BOOLEAN DEFAULT FALSE,
    usedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_activation_codes_code ON activation_codes(code);
CREATE INDEX IF NOT EXISTS idx_activation_codes_device ON activation_codes(deviceId);
