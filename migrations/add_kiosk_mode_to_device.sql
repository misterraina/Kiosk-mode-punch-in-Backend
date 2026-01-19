-- Add kioskMode column to device table
ALTER TABLE device ADD COLUMN IF NOT EXISTS kioskMode BOOLEAN DEFAULT FALSE;

-- Update existing devices to have kioskMode = false
UPDATE device SET kioskMode = FALSE WHERE kioskMode IS NULL;
