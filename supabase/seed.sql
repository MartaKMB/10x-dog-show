-- =============================================================================
-- Seed Data for Dog Show Management System
-- =============================================================================
-- Purpose: Insert sample data for testing the Show Details view
-- Date: 2024-12-20
-- =============================================================================

-- =============================================================================
-- 1. INSERT BREEDS
-- =============================================================================

INSERT INTO dictionary.breeds (name_pl, name_en, fci_group, fci_number, is_active) VALUES
('Owczarek Niemiecki', 'German Shepherd Dog', 'G1', 166, true),
('Labrador Retriever', 'Labrador Retriever', 'G8', 122, true),
('Golden Retriever', 'Golden Retriever', 'G8', 111, true),
('Border Collie', 'Border Collie', 'G1', 297, true),
('Husky Syberyjski', 'Siberian Husky', 'G5', 270, true),
('Bernardyn', 'Saint Bernard', 'G2', 61, true),
('Rottweiler', 'Rottweiler', 'G2', 147, true),
('Doberman', 'Dobermann', 'G2', 143, true),
('Bokser', 'Boxer', 'G2', 144, true),
('Owczarek Belgijski', 'Belgian Shepherd Dog', 'G1', 15, true)
ON CONFLICT (fci_number) DO NOTHING;

-- =============================================================================
-- 2. INSERT VENUES
-- =============================================================================

INSERT INTO dictionary.venues (name, address, city, postal_code, country, is_active) VALUES
('Centrum Wystawowe EXPO XXI', 'ul. Prądzyńskiego 12/14', 'Warszawa', '01-222', 'Polska', true),
('Międzynarodowe Centrum Kongresowe', 'plac Sławika i Antalla 1', 'Katowice', '40-163', 'Polska', true),
('Centrum Targowo-Kongresowe', 'ul. Głogowska 14', 'Poznań', '60-734', 'Polska', true),
('Centrum Kongresowe ICE', 'ul. Marii Konopnickiej 17', 'Kraków', '30-302', 'Polska', true),
('Centrum Wystawienniczo-Kongresowe', 'ul. Marszałkowska 104/122', 'Warszawa', '00-017', 'Polska', true);

-- =============================================================================
-- 3. INSERT JUDGES
-- =============================================================================

INSERT INTO dictionary.judges (first_name, last_name, license_number, email, phone, is_active) VALUES
('Jan', 'Kowalski', 'JUDGE-001', 'jan.kowalski@example.com', '+48 123 456 789', true),
('Anna', 'Nowak', 'JUDGE-002', 'anna.nowak@example.com', '+48 987 654 321', true),
('Piotr', 'Wiśniewski', 'JUDGE-003', 'piotr.wisniewski@example.com', '+48 555 123 456', true),
('Maria', 'Wójcik', 'JUDGE-004', 'maria.wojcik@example.com', '+48 777 888 999', true),
('Tomasz', 'Lewandowski', 'JUDGE-005', 'tomasz.lewandowski@example.com', '+48 111 222 333', true)
ON CONFLICT (license_number) DO NOTHING;

-- =============================================================================
-- 4. INSERT JUDGE SPECIALIZATIONS
-- =============================================================================

INSERT INTO dictionary.judge_specializations (judge_id, fci_group, is_active) VALUES
((SELECT id FROM dictionary.judges WHERE license_number = 'JUDGE-001'), 'G1', true),
((SELECT id FROM dictionary.judges WHERE license_number = 'JUDGE-001'), 'G2', true),
((SELECT id FROM dictionary.judges WHERE license_number = 'JUDGE-002'), 'G8', true),
((SELECT id FROM dictionary.judges WHERE license_number = 'JUDGE-003'), 'G1', true),
((SELECT id FROM dictionary.judges WHERE license_number = 'JUDGE-004'), 'G2', true),
((SELECT id FROM dictionary.judges WHERE license_number = 'JUDGE-005'), 'G5', true);

-- =============================================================================
-- 5. INSERT USERS (create test users in auth.users)
-- =============================================================================

-- Create test users for organizers and secretaries
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'organizer@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000002',
    'secretary1@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000003',
    'secretary2@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now()
),
(
    '00000000-0000-0000-0000-000000000004',
    'secretary3@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now()
);

-- =============================================================================
-- 6. INSERT SHOWS
-- =============================================================================

INSERT INTO dog_shows.shows (
    name, 
    show_type, 
    status, 
    show_date, 
    registration_deadline, 
    venue_id, 
    organizer_id, 
    max_participants, 
    description, 
    entry_fee, 
    language
) VALUES
(
    'Międzynarodowa Wystawa Psów Rasowych Warszawa 2024',
    'international',
    'open_for_registration',
    '2024-06-15',
    '2024-06-01',
    (SELECT id FROM dictionary.venues WHERE name = 'Centrum Wystawowe EXPO XXI'),
    '00000000-0000-0000-0000-000000000001', -- Placeholder organizer ID
    500,
    'Międzynarodowa wystawa psów rasowych zgodna ze standardami FCI. Wystawa obejmuje wszystkie grupy FCI.',
    150.00,
    'pl'
),
(
    'Narodowa Wystawa Psów Rasowych Katowice 2024',
    'national',
    'draft',
    '2024-07-20',
    '2024-07-10',
    (SELECT id FROM dictionary.venues WHERE name = 'Międzynarodowe Centrum Kongresowe'),
    '00000000-0000-0000-0000-000000000001', -- Placeholder organizer ID
    300,
    'Narodowa wystawa psów rasowych w Katowicach.',
    100.00,
    'pl'
),
(
    'Wystawa Psów Rasowych Poznań 2024',
    'national',
    'completed',
    '2024-05-10',
    '2024-05-01',
    (SELECT id FROM dictionary.venues WHERE name = 'Centrum Targowo-Kongresowe'),
    '00000000-0000-0000-0000-000000000001', -- Placeholder organizer ID
    200,
    'Wystawa psów rasowych w Poznaniu.',
    80.00,
    'pl'
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 7. INSERT OWNERS
-- =============================================================================

INSERT INTO dog_shows.owners (
    first_name, 
    last_name, 
    email, 
    phone, 
    address, 
    city, 
    postal_code, 
    country, 
    kennel_name, 
    language, 
    gdpr_consent, 
    gdpr_consent_date
) VALUES
('Marek', 'Zieliński', 'marek.zielinski@example.com', '+48 123 456 789', 'ul. Kwiatowa 15', 'Warszawa', '00-001', 'Polska', 'Hodowla Zieliński', 'pl', true, '2024-01-01'),
('Katarzyna', 'Kaczmarek', 'katarzyna.kaczmarek@example.com', '+48 987 654 321', 'ul. Dębowa 22', 'Kraków', '30-001', 'Polska', 'Hodowla Kaczmarek', 'pl', true, '2024-01-01'),
('Andrzej', 'Pawlak', 'andrzej.pawlak@example.com', '+48 555 123 456', 'ul. Lipowa 8', 'Poznań', '60-001', 'Polska', 'Hodowla Pawlak', 'pl', true, '2024-01-01'),
('Ewa', 'Michalska', 'ewa.michalska@example.com', '+48 777 888 999', 'ul. Brzozowa 12', 'Wrocław', '50-001', 'Polska', 'Hodowla Michalska', 'pl', true, '2024-01-01'),
('Robert', 'Jankowski', 'robert.jankowski@example.com', '+48 111 222 333', 'ul. Sosnowa 5', 'Gdańsk', '80-001', 'Polska', 'Hodowla Jankowski', 'pl', true, '2024-01-01');

-- =============================================================================
-- 8. INSERT DOGS
-- =============================================================================

INSERT INTO dog_shows.dogs (
    name, 
    breed_id, 
    gender, 
    birth_date, 
    microchip_number, 
    kennel_club_number, 
    kennel_name, 
    father_name, 
    mother_name
) VALUES
('Max', (SELECT id FROM dictionary.breeds WHERE name_pl = 'Owczarek Niemiecki'), 'male', '2022-03-15', '123456789012345', 'ZWPN/123/2022', 'Hodowla Zieliński', 'Ares z Hodowli Zieliński', 'Luna z Hodowli Zieliński'),
('Luna', (SELECT id FROM dictionary.breeds WHERE name_pl = 'Labrador Retriever'), 'female', '2021-08-20', '234567890123456', 'ZWPN/456/2021', 'Hodowla Kaczmarek', 'Rocky z Hodowli Kaczmarek', 'Bella z Hodowli Kaczmarek'),
('Rocky', (SELECT id FROM dictionary.breeds WHERE name_pl = 'Golden Retriever'), 'male', '2020-12-10', '345678901234567', 'ZWPN/789/2020', 'Hodowla Pawlak', 'Shadow z Hodowli Pawlak', 'Sunny z Hodowli Pawlak'),
('Bella', (SELECT id FROM dictionary.breeds WHERE name_pl = 'Border Collie'), 'female', '2023-01-25', '456789012345678', 'ZWPN/012/2023', 'Hodowla Michalska', 'Storm z Hodowli Michalska', 'Rain z Hodowli Michalska'),
('Shadow', (SELECT id FROM dictionary.breeds WHERE name_pl = 'Husky Syberyjski'), 'male', '2021-06-05', '567890123456789', 'ZWPN/345/2021', 'Hodowla Jankowski', 'Blizzard z Hodowli Jankowski', 'Aurora z Hodowli Jankowski'),
('Sunny', (SELECT id FROM dictionary.breeds WHERE name_pl = 'Bernardyn'), 'female', '2022-09-12', '678901234567890', 'ZWPN/678/2022', 'Hodowla Zieliński', 'Alpine z Hodowli Zieliński', 'Misty z Hodowli Zieliński'),
('Storm', (SELECT id FROM dictionary.breeds WHERE name_pl = 'Rottweiler'), 'male', '2020-11-30', '789012345678901', 'ZWPN/901/2020', 'Hodowla Kaczmarek', 'Titan z Hodowli Kaczmarek', 'Ruby z Hodowli Kaczmarek'),
('Rain', (SELECT id FROM dictionary.breeds WHERE name_pl = 'Doberman'), 'female', '2023-04-18', '890123456789012', 'ZWPN/234/2023', 'Hodowla Pawlak', 'Zeus z Hodowli Pawlak', 'Athena z Hodowli Pawlak'),
('Blizzard', (SELECT id FROM dictionary.breeds WHERE name_pl = 'Bokser'), 'male', '2021-07-22', '901234567890123', 'ZWPN/567/2021', 'Hodowla Michalska', 'Thunder z Hodowli Michalska', 'Lightning z Hodowli Michalska'),
('Aurora', (SELECT id FROM dictionary.breeds WHERE name_pl = 'Owczarek Belgijski'), 'female', '2022-02-14', '012345678901234', 'ZWPN/890/2022', 'Hodowla Jankowski', 'Phoenix z Hodowli Jankowski', 'Ember z Hodowli Jankowski')
ON CONFLICT (microchip_number) DO NOTHING;

-- =============================================================================
-- 9. INSERT DOG OWNERS (M:N relationship)
-- =============================================================================

INSERT INTO dog_shows.dog_owners (dog_id, owner_id, is_primary) VALUES
((SELECT id FROM dog_shows.dogs WHERE name = 'Max'), (SELECT id FROM dog_shows.owners WHERE email = 'marek.zielinski@example.com'), true),
((SELECT id FROM dog_shows.dogs WHERE name = 'Luna'), (SELECT id FROM dog_shows.owners WHERE email = 'katarzyna.kaczmarek@example.com'), true),
((SELECT id FROM dog_shows.dogs WHERE name = 'Rocky'), (SELECT id FROM dog_shows.owners WHERE email = 'andrzej.pawlak@example.com'), true),
((SELECT id FROM dog_shows.dogs WHERE name = 'Bella'), (SELECT id FROM dog_shows.owners WHERE email = 'ewa.michalska@example.com'), true),
((SELECT id FROM dog_shows.dogs WHERE name = 'Shadow'), (SELECT id FROM dog_shows.owners WHERE email = 'robert.jankowski@example.com'), true),
((SELECT id FROM dog_shows.dogs WHERE name = 'Sunny'), (SELECT id FROM dog_shows.owners WHERE email = 'marek.zielinski@example.com'), true),
((SELECT id FROM dog_shows.dogs WHERE name = 'Storm'), (SELECT id FROM dog_shows.owners WHERE email = 'katarzyna.kaczmarek@example.com'), true),
((SELECT id FROM dog_shows.dogs WHERE name = 'Rain'), (SELECT id FROM dog_shows.owners WHERE email = 'andrzej.pawlak@example.com'), true),
((SELECT id FROM dog_shows.dogs WHERE name = 'Blizzard'), (SELECT id FROM dog_shows.owners WHERE email = 'ewa.michalska@example.com'), true),
((SELECT id FROM dog_shows.dogs WHERE name = 'Aurora'), (SELECT id FROM dog_shows.owners WHERE email = 'robert.jankowski@example.com'), true)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 10. INSERT SHOW REGISTRATIONS
-- =============================================================================

INSERT INTO dog_shows.show_registrations (
    show_id, 
    dog_id, 
    dog_class, 
    catalog_number, 
    registration_fee, 
    is_paid, 
    registered_at
) VALUES
-- Registrations for the first show (Warszawa 2024)
((SELECT id FROM dog_shows.shows WHERE name = 'Międzynarodowa Wystawa Psów Rasowych Warszawa 2024'), (SELECT id FROM dog_shows.dogs WHERE name = 'Max'), 'open', 1, 150.00, true, '2024-01-15 10:30:00'),
((SELECT id FROM dog_shows.shows WHERE name = 'Międzynarodowa Wystawa Psów Rasowych Warszawa 2024'), (SELECT id FROM dog_shows.dogs WHERE name = 'Luna'), 'open', 2, 150.00, true, '2024-01-16 14:20:00'),
((SELECT id FROM dog_shows.shows WHERE name = 'Międzynarodowa Wystawa Psów Rasowych Warszawa 2024'), (SELECT id FROM dog_shows.dogs WHERE name = 'Rocky'), 'champion', 3, 150.00, false, '2024-01-17 09:15:00'),
((SELECT id FROM dog_shows.shows WHERE name = 'Międzynarodowa Wystawa Psów Rasowych Warszawa 2024'), (SELECT id FROM dog_shows.dogs WHERE name = 'Bella'), 'junior', 4, 150.00, true, '2024-01-18 16:45:00'),
((SELECT id FROM dog_shows.shows WHERE name = 'Międzynarodowa Wystawa Psów Rasowych Warszawa 2024'), (SELECT id FROM dog_shows.dogs WHERE name = 'Shadow'), 'open', 5, 150.00, true, '2024-01-19 11:30:00'),
((SELECT id FROM dog_shows.shows WHERE name = 'Międzynarodowa Wystawa Psów Rasowych Warszawa 2024'), (SELECT id FROM dog_shows.dogs WHERE name = 'Sunny'), 'veteran', 6, 150.00, false, '2024-01-20 13:20:00'),
((SELECT id FROM dog_shows.shows WHERE name = 'Międzynarodowa Wystawa Psów Rasowych Warszawa 2024'), (SELECT id FROM dog_shows.dogs WHERE name = 'Storm'), 'working', 7, 150.00, true, '2024-01-21 15:10:00'),
((SELECT id FROM dog_shows.shows WHERE name = 'Międzynarodowa Wystawa Psów Rasowych Warszawa 2024'), (SELECT id FROM dog_shows.dogs WHERE name = 'Rain'), 'intermediate', 8, 150.00, true, '2024-01-22 08:45:00'),
((SELECT id FROM dog_shows.shows WHERE name = 'Międzynarodowa Wystawa Psów Rasowych Warszawa 2024'), (SELECT id FROM dog_shows.dogs WHERE name = 'Blizzard'), 'open', 9, 150.00, false, '2024-01-23 12:30:00'),
((SELECT id FROM dog_shows.shows WHERE name = 'Międzynarodowa Wystawa Psów Rasowych Warszawa 2024'), (SELECT id FROM dog_shows.dogs WHERE name = 'Aurora'), 'puppy', 10, 150.00, true, '2024-01-24 10:15:00'),

-- Registrations for the second show (Katowice 2024) - draft status
((SELECT id FROM dog_shows.shows WHERE name = 'Narodowa Wystawa Psów Rasowych Katowice 2024'), (SELECT id FROM dog_shows.dogs WHERE name = 'Max'), 'open', 1, 100.00, false, '2024-02-01 14:30:00'),
((SELECT id FROM dog_shows.shows WHERE name = 'Narodowa Wystawa Psów Rasowych Katowice 2024'), (SELECT id FROM dog_shows.dogs WHERE name = 'Luna'), 'champion', 2, 100.00, false, '2024-02-02 16:20:00'),

-- Registrations for the third show (Poznań 2024) - completed status
((SELECT id FROM dog_shows.shows WHERE name = 'Wystawa Psów Rasowych Poznań 2024'), (SELECT id FROM dog_shows.dogs WHERE name = 'Rocky'), 'open', 1, 80.00, true, '2024-04-01 09:30:00'),
((SELECT id FROM dog_shows.shows WHERE name = 'Wystawa Psów Rasowych Poznań 2024'), (SELECT id FROM dog_shows.dogs WHERE name = 'Bella'), 'junior', 2, 80.00, true, '2024-04-02 11:15:00'),
((SELECT id FROM dog_shows.shows WHERE name = 'Wystawa Psów Rasowych Poznań 2024'), (SELECT id FROM dog_shows.dogs WHERE name = 'Shadow'), 'champion', 3, 80.00, true, '2024-04-03 13:45:00')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 11. INSERT JUDGE ASSIGNMENTS
-- =============================================================================

INSERT INTO dog_shows.show_judge_assignments (show_id, judge_id, fci_group) VALUES
((SELECT id FROM dog_shows.shows WHERE name = 'Międzynarodowa Wystawa Psów Rasowych Warszawa 2024'), (SELECT id FROM dictionary.judges WHERE license_number = 'JUDGE-001'), 'G1'),
((SELECT id FROM dog_shows.shows WHERE name = 'Międzynarodowa Wystawa Psów Rasowych Warszawa 2024'), (SELECT id FROM dictionary.judges WHERE license_number = 'JUDGE-002'), 'G8'),
((SELECT id FROM dog_shows.shows WHERE name = 'Międzynarodowa Wystawa Psów Rasowych Warszawa 2024'), (SELECT id FROM dictionary.judges WHERE license_number = 'JUDGE-004'), 'G2'),
((SELECT id FROM dog_shows.shows WHERE name = 'Narodowa Wystawa Psów Rasowych Katowice 2024'), (SELECT id FROM dictionary.judges WHERE license_number = 'JUDGE-003'), 'G1'),
((SELECT id FROM dog_shows.shows WHERE name = 'Wystawa Psów Rasowych Poznań 2024'), (SELECT id FROM dictionary.judges WHERE license_number = 'JUDGE-005'), 'G5')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 12. INSERT SECRETARY ASSIGNMENTS
-- =============================================================================

INSERT INTO dog_shows.secretary_assignments (show_id, secretary_id) VALUES
((SELECT id FROM dog_shows.shows WHERE name = 'Międzynarodowa Wystawa Psów Rasowych Warszawa 2024'), '00000000-0000-0000-0000-000000000002'),
((SELECT id FROM dog_shows.shows WHERE name = 'Narodowa Wystawa Psów Rasowych Katowice 2024'), '00000000-0000-0000-0000-000000000003'),
((SELECT id FROM dog_shows.shows WHERE name = 'Wystawa Psów Rasowych Poznań 2024'), '00000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- COMPLETED: Sample data inserted successfully
-- =============================================================================
-- 
-- Summary of inserted data:
-- - 10 breeds (G1, G2, G5, G8)
-- - 5 venues (Warszawa, Katowice, Poznań, Kraków, Gdańsk)
-- - 5 judges with specializations
-- - 3 shows (different statuses: draft, open_for_registration, completed)
-- - 5 owners with GDPR consent
-- - 10 dogs with various breeds and ages
-- - 10 dog-owner relationships
-- - 15 show registrations (10 for Warszawa, 2 for Katowice, 3 for Poznań)
-- - 5 judge assignments
-- - 3 secretary assignments
-- ============================================================================= 
