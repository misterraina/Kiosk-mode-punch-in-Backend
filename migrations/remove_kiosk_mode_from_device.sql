-- Remove kioskMode column from device table
ALTER TABLE device DROP COLUMN IF EXISTS kioskMode;
