-- Migration: Normalize price_type ENUM to client_type_id FK
-- This removes the ENUM and uses the existing client_types table

-- 1. Add client_type_id column to presale_details
ALTER TABLE presale_details 
ADD COLUMN client_type_id SMALLINT UNSIGNED NULL AFTER price_type;

-- 2. Migrate data from ENUM to FK
UPDATE presale_details pd
SET pd.client_type_id = (
    SELECT ct.id FROM client_types ct 
    WHERE ct.name = pd.price_type
    LIMIT 1
);

-- 3. Make client_type_id NOT NULL after migration
ALTER TABLE presale_details 
MODIFY COLUMN client_type_id SMALLINT UNSIGNED NOT NULL;

-- 4. Add foreign key constraint
ALTER TABLE presale_details 
ADD CONSTRAINT fk_presale_detail_client_type 
FOREIGN KEY (client_type_id) REFERENCES client_types(id);

-- 5. Add index for performance
CREATE INDEX idx_presale_detail_client_type ON presale_details(client_type_id);

-- 6. Drop the ENUM column (EXECUTE ONLY AFTER VERIFYING DATA MIGRATION)
-- ALTER TABLE presale_details DROP COLUMN price_type;
