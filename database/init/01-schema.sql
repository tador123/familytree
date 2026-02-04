-- Family Tree Database Schema (Enhanced with Prisma Design)

-- Create people table (renamed from family_members for consistency)
CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    maiden_name VARCHAR(100),
    preferred_name VARCHAR(100),
    gender VARCHAR(20),
    
    -- Life Events
    birth_date TIMESTAMP,
    birth_place VARCHAR(255),
    death_date TIMESTAMP,
    death_place VARCHAR(255),
    
    -- Biographical Information
    biography TEXT,
    occupation VARCHAR(150),
    education TEXT,
    
    -- Creative Fields for Rich UI
    personality_tags TEXT[] DEFAULT '{}',
    closest_memories JSONB,
    favorite_quote TEXT,
    life_highlights JSONB,
    
    -- Contact & Location
    email VARCHAR(255),
    phone VARCHAR(50),
    current_location VARCHAR(255),
    
    -- Visual Profile
    profile_photo_id UUID,
    
    -- Metadata
    is_living BOOLEAN DEFAULT true,
    privacy_level VARCHAR(50) DEFAULT 'family',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create relationships table (flexible connection types)
CREATE TABLE IF NOT EXISTS relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Related Persons
    person_from_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    person_to_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    
    -- Relationship Details
    relationship_type VARCHAR(50) NOT NULL, -- 'parent', 'child', 'spouse', 'sibling', 'cousin', 'guardian', 'custom'
    custom_type VARCHAR(100),
    
    -- Timeline
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_current BOOLEAN DEFAULT true,
    
    -- Additional Context
    notes TEXT,
    strength SMALLINT DEFAULT 5, -- 1-10 scale for relationship closeness
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_relationship UNIQUE(person_from_id, person_to_id, relationship_type),
    CONSTRAINT no_self_relationship CHECK (person_from_id != person_to_id)
);

-- Create media table (photos, videos, documents)
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- File Information
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    file_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'document', 'audio'
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    
    -- Media Metadata
    title VARCHAR(255),
    description TEXT,
    caption TEXT,
    
    -- Context
    date_taken TIMESTAMP,
    location VARCHAR(255),
    photographer VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    
    -- Linked Entities
    person_id UUID REFERENCES people(id) ON DELETE SET NULL,
    family_event_id UUID,
    
    -- Metadata
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_family_members_name ON family_members(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_family_members_birth_date ON family_members(birth_date);
CREATE INDEX IF NOT EXISTS idx_relationships_member_1 ON relationships(member_id_1);
CREATE INDEX IF NOT EXISTS idx_relationships_member_2 ON relationships(member_id_2);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_media_member_id ON media(member_id);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON media(file_type);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relationships_updated_at BEFORE UPDATE ON relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO family_members (first_name, last_name, gender, birth_date, biography) VALUES
    ('John', 'Smith', 'Male', '1950-03-15', 'Patriarch of the Smith family'),
    ('Mary', 'Smith', 'Female', '1952-07-22', 'Matriarch of the Smith family'),
    ('Robert', 'Smith', 'Male', '1975-11-08', 'Eldest son, works as an engineer'),
    ('Sarah', 'Smith', 'Female', '1978-05-19', 'Daughter, teacher by profession')
ON CONFLICT DO NOTHING;

-- Get IDs for sample relationships
DO $$
DECLARE
    john_id UUID;
    mary_id UUID;
    robert_id UUID;
    sarah_id UUID;
BEGIN
    SELECT id INTO john_id FROM family_members WHERE first_name = 'John' AND last_name = 'Smith' LIMIT 1;
    SELECT id INTO mary_id FROM family_members WHERE first_name = 'Mary' AND last_name = 'Smith' LIMIT 1;
    SELECT id INTO robert_id FROM family_members WHERE first_name = 'Robert' AND last_name = 'Smith' LIMIT 1;
    SELECT id INTO sarah_id FROM family_members WHERE first_name = 'Sarah' AND last_name = 'Smith' LIMIT 1;

    -- Insert relationships if IDs exist
    IF john_id IS NOT NULL AND mary_id IS NOT NULL THEN
        INSERT INTO relationships (member_id_1, member_id_2, relationship_type, notes) VALUES
            (john_id, mary_id, 'spouse', 'Married in 1974')
        ON CONFLICT DO NOTHING;
    END IF;

    IF john_id IS NOT NULL AND robert_id IS NOT NULL THEN
        INSERT INTO relationships (member_id_1, member_id_2, relationship_type) VALUES
            (john_id, robert_id, 'parent')
        ON CONFLICT DO NOTHING;
    END IF;

    IF john_id IS NOT NULL AND sarah_id IS NOT NULL THEN
        INSERT INTO relationships (member_id_1, member_id_2, relationship_type) VALUES
            (john_id, sarah_id, 'parent')
        ON CONFLICT DO NOTHING;
    END IF;

    IF mary_id IS NOT NULL AND robert_id IS NOT NULL THEN
        INSERT INTO relationships (member_id_1, member_id_2, relationship_type) VALUES
            (mary_id, robert_id, 'parent')
        ON CONFLICT DO NOTHING;
    END IF;

    IF mary_id IS NOT NULL AND sarah_id IS NOT NULL THEN
        INSERT INTO relationships (member_id_1, member_id_2, relationship_type) VALUES
            (mary_id, sarah_id, 'parent')
        ON CONFLICT DO NOTHING;
    END IF;

    IF robert_id IS NOT NULL AND sarah_id IS NOT NULL THEN
        INSERT INTO relationships (member_id_1, member_id_2, relationship_type) VALUES
            (robert_id, sarah_id, 'sibling')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
