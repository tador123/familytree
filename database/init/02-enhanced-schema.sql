-- Family Tree Database Schema (Enhanced - Part 2)
-- Additional tables for family events and memories

-- Create family_events table
CREATE TABLE IF NOT EXISTS family_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL, -- 'wedding', 'reunion', 'birthday', 'anniversary', 'funeral', 'holiday', 'custom'
    
    -- Timeline
    event_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    location VARCHAR(255),
    venue VARCHAR(255),
    
    -- Event Data
    attendee_count INTEGER,
    organizers TEXT[] DEFAULT '{}',
    highlights JSONB,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create event_attendance table
CREATE TABLE IF NOT EXISTS event_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES family_events(id) ON DELETE CASCADE,
    
    -- Attendance Details
    role VARCHAR(50), -- 'host', 'guest', 'organizer', 'speaker'
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_attendance UNIQUE(person_id, event_id)
);

-- Create memories table (stories and closest memories)
CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    
    -- Memory Content
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    memory_type VARCHAR(50) NOT NULL, -- 'story', 'quote', 'achievement', 'tradition', 'humor'
    
    -- Context
    date_of_memory TIMESTAMP,
    location VARCHAR(255),
    shared_by VARCHAR(100),
    
    -- Engagement
    is_featured BOOLEAN DEFAULT false,
    emotional_tone VARCHAR(50), -- 'joyful', 'nostalgic', 'inspiring', 'humorous'
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key for profile_photo_id
ALTER TABLE people ADD CONSTRAINT fk_profile_photo 
    FOREIGN KEY (profile_photo_id) REFERENCES media(id) ON DELETE SET NULL;

-- Add foreign key for family_event_id in media
ALTER TABLE media ADD CONSTRAINT fk_media_family_event 
    FOREIGN KEY (family_event_id) REFERENCES family_events(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_people_name ON people(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_people_birth_date ON people(birth_date);
CREATE INDEX IF NOT EXISTS idx_people_is_living ON people(is_living);
CREATE INDEX IF NOT EXISTS idx_people_personality_tags ON people USING GIN(personality_tags);

CREATE INDEX IF NOT EXISTS idx_relationships_person_from ON relationships(person_from_id);
CREATE INDEX IF NOT EXISTS idx_relationships_person_to ON relationships(person_to_id);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON relationships(relationship_type);

CREATE INDEX IF NOT EXISTS idx_media_person ON media(person_id);
CREATE INDEX IF NOT EXISTS idx_media_event ON media(family_event_id);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON media(file_type);
CREATE INDEX IF NOT EXISTS idx_media_date_taken ON media(date_taken);

CREATE INDEX IF NOT EXISTS idx_family_events_date ON family_events(event_date);
CREATE INDEX IF NOT EXISTS idx_family_events_type ON family_events(event_type);

CREATE INDEX IF NOT EXISTS idx_event_attendance_person ON event_attendance(person_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_event ON event_attendance(event_id);

CREATE INDEX IF NOT EXISTS idx_memories_person ON memories(person_id);
CREATE INDEX IF NOT EXISTS idx_memories_featured ON memories(is_featured);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relationships_updated_at BEFORE UPDATE ON relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_events_updated_at BEFORE UPDATE ON family_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert enhanced sample data with personality tags and memories
INSERT INTO people (
    first_name, last_name, gender, birth_date, biography, occupation,
    personality_tags, favorite_quote, is_living, life_highlights
) VALUES
    (
        'John', 'Smith', 'Male', '1950-03-15',
        'Patriarch of the Smith family, known for his love of gardening and storytelling.',
        'Retired Engineer',
        ARRAY['storyteller', 'gardener', 'mentor'],
        'The best time to plant a tree was 20 years ago. The second best time is now.',
        true,
        '[
            {"year": 1950, "age": 0, "title": "Born in Boston", "description": "Born in Boston, Massachusetts", "category": "birth"},
            {"year": 1974, "age": 24, "title": "Married Mary", "description": "Wedding at St. Mary Church", "category": "family"},
            {"year": 1975, "age": 25, "title": "First Child Born", "description": "Robert was born", "category": "family"},
            {"year": 1990, "age": 40, "title": "Senior Engineer", "description": "Promoted to Senior Engineering position", "category": "career"}
        ]'::jsonb
    ),
    (
        'Mary', 'Smith', 'Female', '1952-07-22',
        'Matriarch of the Smith family, devoted mother and talented musician.',
        'Music Teacher',
        ARRAY['musician', 'educator', 'caregiver'],
        'Music is the universal language of mankind.',
        true,
        '[
            {"year": 1952, "age": 0, "title": "Born in New York", "description": "Born in New York City", "category": "birth"},
            {"year": 1970, "age": 18, "title": "Music Degree", "description": "Graduated with Music Education degree", "category": "education"},
            {"year": 1974, "age": 22, "title": "Married John", "description": "Wedding at St. Mary Church", "category": "family"}
        ]'::jsonb
    ),
    (
        'Robert', 'Smith', 'Male', '1975-11-08',
        'Eldest son, brilliant engineer and technology enthusiast.',
        'Software Engineer',
        ARRAY['innovator', 'athlete', 'traveler'],
        'Innovation distinguishes between a leader and a follower.',
        true,
        '[
            {"year": 1975, "age": 0, "title": "Born", "description": "First child of John and Mary", "category": "birth"},
            {"year": 1997, "age": 22, "title": "College Graduation", "description": "Computer Science degree from MIT", "category": "education"},
            {"year": 2005, "age": 30, "title": "Started Tech Company", "description": "Founded successful startup", "category": "career"}
        ]'::jsonb
    ),
    (
        'Sarah', 'Smith', 'Female', '1978-05-19',
        'Daughter, dedicated teacher and community volunteer.',
        'Elementary School Teacher',
        ARRAY['educator', 'artist', 'volunteer'],
        'Teaching is the one profession that creates all other professions.',
        true,
        '[
            {"year": 1978, "age": 0, "title": "Born", "description": "Second child of John and Mary", "category": "birth"},
            {"year": 2000, "age": 22, "title": "Teaching Degree", "description": "Education degree from state university", "category": "education"},
            {"year": 2015, "age": 37, "title": "Teacher of the Year", "description": "Received district Teacher of the Year award", "category": "achievement"}
        ]'::jsonb
    )
ON CONFLICT DO NOTHING;

-- Insert sample relationships
DO $$
DECLARE
    john_id UUID;
    mary_id UUID;
    robert_id UUID;
    sarah_id UUID;
BEGIN
    SELECT id INTO john_id FROM people WHERE first_name = 'John' AND last_name = 'Smith' LIMIT 1;
    SELECT id INTO mary_id FROM people WHERE first_name = 'Mary' AND last_name = 'Smith' LIMIT 1;
    SELECT id INTO robert_id FROM people WHERE first_name = 'Robert' AND last_name = 'Smith' LIMIT 1;
    SELECT id INTO sarah_id FROM people WHERE first_name = 'Sarah' AND last_name = 'Smith' LIMIT 1;

    IF john_id IS NOT NULL AND mary_id IS NOT NULL THEN
        INSERT INTO relationships (person_from_id, person_to_id, relationship_type, notes, strength, start_date) VALUES
            (john_id, mary_id, 'spouse', 'Married in 1974 at St. Mary Church', 10, '1974-06-15')
        ON CONFLICT DO NOTHING;
    END IF;

    IF john_id IS NOT NULL AND robert_id IS NOT NULL THEN
        INSERT INTO relationships (person_from_id, person_to_id, relationship_type, strength) VALUES
            (john_id, robert_id, 'parent', 10)
        ON CONFLICT DO NOTHING;
    END IF;

    IF john_id IS NOT NULL AND sarah_id IS NOT NULL THEN
        INSERT INTO relationships (person_from_id, person_to_id, relationship_type, strength) VALUES
            (john_id, sarah_id, 'parent', 10)
        ON CONFLICT DO NOTHING;
    END IF;

    IF mary_id IS NOT NULL AND robert_id IS NOT NULL THEN
        INSERT INTO relationships (person_from_id, person_to_id, relationship_type, strength) VALUES
            (mary_id, robert_id, 'parent', 10)
        ON CONFLICT DO NOTHING;
    END IF;

    IF mary_id IS NOT NULL AND sarah_id IS NOT NULL THEN
        INSERT INTO relationships (person_from_id, person_to_id, relationship_type, strength) VALUES
            (mary_id, sarah_id, 'parent', 10)
        ON CONFLICT DO NOTHING;
    END IF;

    IF robert_id IS NOT NULL AND sarah_id IS NOT NULL THEN
        INSERT INTO relationships (person_from_id, person_to_id, relationship_type, strength) VALUES
            (robert_id, sarah_id, 'sibling', 9)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert sample memories
DO $$
DECLARE
    john_id UUID;
    mary_id UUID;
BEGIN
    SELECT id INTO john_id FROM people WHERE first_name = 'John' AND last_name = 'Smith' LIMIT 1;
    SELECT id INTO mary_id FROM people WHERE first_name = 'Mary' AND last_name = 'Smith' LIMIT 1;

    IF john_id IS NOT NULL THEN
        INSERT INTO memories (person_id, title, content, memory_type, is_featured, emotional_tone, shared_by) VALUES
            (
                john_id,
                'The Great Garden Project',
                'In the summer of 1985, John transformed the backyard into a magnificent garden. Every weekend, the family would work together, planting vegetables and flowers. Those moments taught us about patience, nature, and family unity.',
                'story',
                true,
                'nostalgic',
                'Robert Smith'
            ),
            (
                john_id,
                'Wisdom About Trees',
                'Dad always said: "The best time to plant a tree was 20 years ago. The second best time is now." This became our family motto for never giving up on dreams.',
                'quote',
                true,
                'inspiring',
                'Sarah Smith'
            );
    END IF;

    IF mary_id IS NOT NULL THEN
        INSERT INTO memories (person_id, title, content, memory_type, is_featured, emotional_tone, shared_by) VALUES
            (
                mary_id,
                'Piano Lessons and Laughter',
                'Mom taught piano to dozens of students over the years. Our home was always filled with music and the sound of young learners. She had infinite patience and made every student feel special.',
                'story',
                true,
                'joyful',
                'Sarah Smith'
            ),
            (
                mary_id,
                'The Lullaby Tradition',
                'Every night, Mom would sing us the same lullaby her grandmother taught her. Now I sing it to my own children, keeping the tradition alive across four generations.',
                'tradition',
                true,
                'nostalgic',
                'Robert Smith'
            );
    END IF;
END $$;

-- Insert a sample family event
INSERT INTO family_events (title, description, event_type, event_date, location, attendee_count, organizers) VALUES
    (
        'Smith Family 50th Anniversary Reunion',
        'Celebrating John and Mary Smith 50th wedding anniversary with extended family',
        'anniversary',
        '2024-06-15',
        'Smith Family Home, Boston MA',
        45,
        ARRAY['Robert Smith', 'Sarah Smith']
    )
ON CONFLICT DO NOTHING;
