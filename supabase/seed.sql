-- =============================================================================
-- Seed Data for Hovawart Club Show MVP
-- =============================================================================
-- Purpose: Insert sample data for testing the Hovawart Club Show system
-- Date: 2025-08-06
-- =============================================================================

-- =============================================================================
-- 1. INSERT USERS (club board members)
-- =============================================================================

INSERT INTO public.users (email, password_hash, first_name, last_name, role) VALUES
('admin@klub-hovawarta.pl', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewvYPcGvIjZxNe5.', 'Admin', 'Klubu Hovawarta', 'club_board'),
('jan.kowalski@klub-hovawarta.pl', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewvYPcGvIjZxNe5.', 'Jan', 'Kowalski', 'club_board'),
('anna.nowak@klub-hovawarta.pl', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewvYPcGvIjZxNe5.', 'Anna', 'Nowak', 'club_board')
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 2. INSERT OWNERS
-- =============================================================================

INSERT INTO public.owners (first_name, last_name, email, phone, address, city, postal_code, kennel_name, gdpr_consent, gdpr_consent_date) VALUES
('Marek', 'Zieliński', 'marek.zielinski@example.com', '+48 123 456 789', 'ul. Kwiatowa 15', 'Warszawa', '00-001', 'Hodowla Zieliński', true, '2024-01-01'),
('Katarzyna', 'Kaczmarek', 'katarzyna.kaczmarek@example.com', '+48 987 654 321', 'ul. Dębowa 22', 'Kraków', '30-001', 'Hodowla Kaczmarek', true, '2024-01-01'),
('Andrzej', 'Pawlak', 'andrzej.pawlak@example.com', '+48 555 123 456', 'ul. Lipowa 8', 'Poznań', '60-001', 'Hodowla Pawlak', true, '2024-01-01'),
('Ewa', 'Michalska', 'ewa.michalska@example.com', '+48 777 888 999', 'ul. Brzozowa 12', 'Wrocław', '50-001', 'Hodowla Michalska', true, '2024-01-01'),
('Robert', 'Jankowski', 'robert.jankowski@example.com', '+48 111 222 333', 'ul. Sosnowa 5', 'Gdańsk', '80-001', 'Hodowla Jankowski', true, '2024-01-01');

-- =============================================================================
-- 3. INSERT DOGS (Hovawart only)
-- =============================================================================

INSERT INTO public.dogs (name, gender, birth_date, coat, microchip_number, kennel_name, father_name, mother_name) VALUES
('Hovawart z Przykładu', 'male', '2020-03-15', 'czarny', '123456789012345', 'Hodowla Przykładowa', 'Hovawart Ojciec', 'Hovawartka Matka'),
('Hovawartka z Przykładu', 'female', '2019-07-22', 'czarny_podpalany', '987654321098765', 'Hodowla Przykładowa', 'Hovawart Ojciec', 'Hovawartka Matka'),
('Hovawart Max', 'male', '2021-05-10', 'blond', '111111111111111', 'Hodowla Zieliński', 'Hovawart Ojciec', 'Hovawartka Matka'),
('Hovawartka Luna', 'female', '2022-08-15', 'czarny', '222222222222222', 'Hodowla Kaczmarek', 'Hovawart Ojciec', 'Hovawartka Matka'),
('Hovawart Rocky', 'male', '2020-12-03', 'czarny_podpalany', '333333333333333', 'Hodowla Pawlak', 'Hovawart Ojciec', 'Hovawartka Matka'),
('Hovawartka Bella', 'female', '2023-01-20', 'blond', '444444444444444', 'Hodowla Michalska', 'Hovawart Ojciec', 'Hovawartka Matka'),
('Hovawart Shadow', 'male', '2021-09-08', 'czarny', '555555555555555', 'Hodowla Jankowski', 'Hovawart Ojciec', 'Hovawartka Matka'),
('Hovawartka Storm', 'female', '2018-06-12', 'czarny_podpalany', '666666666666666', 'Hodowla Przykładowa', 'Hovawart Ojciec', 'Hovawartka Matka'),
('Hovawart Blizzard', 'male', '2022-03-25', 'blond', '777777777777777', 'Hodowla Zieliński', 'Hovawart Ojciec', 'Hovawartka Matka'),
('Hovawartka Aurora', 'female', '2021-11-30', 'czarny', '888888888888888', 'Hodowla Kaczmarek', 'Hovawart Ojciec', 'Hovawartka Matka')
ON CONFLICT (microchip_number) DO NOTHING;

-- =============================================================================
-- 4. INSERT DOG OWNERS (M:N relationship)
-- =============================================================================

INSERT INTO public.dog_owners (dog_id, owner_id, is_primary) VALUES
((SELECT id FROM public.dogs WHERE name = 'Hovawart z Przykładu' LIMIT 1), (SELECT id FROM public.owners WHERE email = 'marek.zielinski@example.com' LIMIT 1), true),
((SELECT id FROM public.dogs WHERE name = 'Hovawartka z Przykładu' LIMIT 1), (SELECT id FROM public.owners WHERE email = 'katarzyna.kaczmarek@example.com' LIMIT 1), true),
((SELECT id FROM public.dogs WHERE name = 'Hovawart Max' LIMIT 1), (SELECT id FROM public.owners WHERE email = 'andrzej.pawlak@example.com' LIMIT 1), true),
((SELECT id FROM public.dogs WHERE name = 'Hovawartka Luna' LIMIT 1), (SELECT id FROM public.owners WHERE email = 'ewa.michalska@example.com' LIMIT 1), true),
((SELECT id FROM public.dogs WHERE name = 'Hovawart Rocky' LIMIT 1), (SELECT id FROM public.owners WHERE email = 'robert.jankowski@example.com' LIMIT 1), true),
((SELECT id FROM public.dogs WHERE name = 'Hovawartka Bella' LIMIT 1), (SELECT id FROM public.owners WHERE email = 'marek.zielinski@example.com' LIMIT 1), true),
((SELECT id FROM public.dogs WHERE name = 'Hovawart Shadow' LIMIT 1), (SELECT id FROM public.owners WHERE email = 'katarzyna.kaczmarek@example.com' LIMIT 1), true),
((SELECT id FROM public.dogs WHERE name = 'Hovawartka Storm' LIMIT 1), (SELECT id FROM public.owners WHERE email = 'andrzej.pawlak@example.com' LIMIT 1), true),
((SELECT id FROM public.dogs WHERE name = 'Hovawart Blizzard' LIMIT 1), (SELECT id FROM public.owners WHERE email = 'ewa.michalska@example.com' LIMIT 1), true),
((SELECT id FROM public.dogs WHERE name = 'Hovawartka Aurora' LIMIT 1), (SELECT id FROM public.owners WHERE email = 'robert.jankowski@example.com' LIMIT 1), true)
ON CONFLICT (dog_id, owner_id) DO NOTHING;

-- =============================================================================
-- 5. INSERT SHOWS
-- =============================================================================

INSERT INTO public.shows (name, status, show_date, location, judge_name, description, max_participants) VALUES
('Wystawa Klubowa Hovawartów 2024', 'draft', '2024-06-15', 'Warszawa, ul. Wystawowa 1', 'dr Jan Sędzia', 'Doroczna wystawa klubowa hovawartów', 100),
('Wystawa Klubowa Hovawartów 2024 - Jesień', 'draft', '2024-09-20', 'Kraków, ul. Wystawowa 5', 'dr Anna Sędzia', 'Jesienna wystawa klubowa hovawartów', 80),
('Wystawa Klubowa Hovawartów 2023', 'completed', '2023-06-10', 'Poznań, ul. Wystawowa 10', 'dr Piotr Sędzia', 'Doroczna wystawa klubowa hovawartów 2023', 120);

-- =============================================================================
-- 6. INSERT SHOW REGISTRATIONS
-- =============================================================================

INSERT INTO public.show_registrations (show_id, dog_id, dog_class) VALUES
-- Registrations for the first show (Warszawa 2024) - draft status
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2024' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawart z Przykładu' LIMIT 1), 'open'),
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2024' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawartka z Przykładu' LIMIT 1), 'open'),
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2024' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawart Max' LIMIT 1), 'champion'),
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2024' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawartka Luna' LIMIT 1), 'junior'),
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2024' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawart Rocky' LIMIT 1), 'open'),
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2024' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawartka Bella' LIMIT 1), 'puppy'),
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2024' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawart Shadow' LIMIT 1), 'working'),
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2024' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawartka Storm' LIMIT 1), 'veteran'),
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2024' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawart Blizzard' LIMIT 1), 'open'),
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2024' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawartka Aurora' LIMIT 1), 'intermediate'),

-- Registrations for the second show (Kraków 2024) - draft status
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2024 - Jesień' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawart z Przykładu' LIMIT 1), 'open'),
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2024 - Jesień' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawartka z Przykładu' LIMIT 1), 'champion'),

-- Registrations for the third show (Poznań 2023) - completed status
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2023' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawart Max' LIMIT 1), 'open'),
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2023' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawartka Luna' LIMIT 1), 'junior'),
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2023' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawart Rocky' LIMIT 1), 'champion')
ON CONFLICT (show_id, dog_id) DO NOTHING;

-- =============================================================================
-- 7. INSERT EVALUATIONS (for completed show)
-- =============================================================================

INSERT INTO public.evaluations (show_id, dog_id, dog_class, grade, baby_puppy_grade, club_title, placement) VALUES
-- Evaluations for the completed show (Poznań 2023)
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2023' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawart Max' LIMIT 1), 'open', 'doskonała', null, 'zwycięzca_klubu', '1st'),
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2023' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawartka Luna' LIMIT 1), 'junior', 'bardzo_dobra', null, 'najlepszy_junior', '1st'),
((SELECT id FROM public.shows WHERE name = 'Wystawa Klubowa Hovawartów 2023' LIMIT 1), (SELECT id FROM public.dogs WHERE name = 'Hovawart Rocky' LIMIT 1), 'champion', 'doskonała', null, 'najlepszy_reproduktor', '1st')
ON CONFLICT (show_id, dog_id) DO NOTHING;

-- =============================================================================
-- COMPLETED: Sample data inserted successfully
-- =============================================================================
-- 
-- Summary of inserted data:
-- - 3 users (club board members)
-- - 5 owners with GDPR consent
-- - 10 hovawart dogs with various ages and genders
-- - 10 dog-owner relationships
-- - 3 shows (different statuses: draft, draft, completed)
-- - 15 show registrations (10 for Warszawa, 2 for Kraków, 3 for Poznań)
-- - 3 evaluations for the completed show
-- ============================================================================= 
