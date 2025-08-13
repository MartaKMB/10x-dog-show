-- =============================================================================
-- Enums for Hovawart Club Show System
-- =============================================================================
-- Purpose: Define all enumerated types used in the system
-- Date: 2024-12-21
-- =============================================================================

-- simplified user role (only club board)
create type public.user_role as enum ('club_board');

-- show statuses (simplified for Hovawart MVP)
create type public.show_status as enum ('draft', 'completed');

-- dog gender
create type public.dog_gender as enum ('male', 'female');

-- dog classes
create type public.dog_class as enum ('baby', 'puppy', 'junior', 'intermediate', 'open', 'working', 'champion', 'veteran');

-- dog coat colors (maści hovawarta)
create type public.dog_coat as enum ('czarny', 'czarny_podpalany', 'blond');

-- evaluation grades in polish
create type public.evaluation_grade as enum ('doskonała', 'bardzo_dobra', 'dobra', 'zadowalająca', 'zdyskwalifikowana', 'nieobecna');

-- baby/puppy grades in polish
create type public.baby_puppy_grade as enum ('bardzo_obiecujący', 'obiecujący', 'dość_obiecujący');

-- hovawart club titles
create type public.club_title as enum (
    'młodzieżowy_zwycięzca_klubu',
    'zwycięzca_klubu',
    'zwycięzca_klubu_weteranów',
    'najlepszy_reproduktor',
    'najlepsza_suka_hodowlana',
    'najlepsza_para',
    'najlepsza_hodowla',
    'zwycięzca_rasy',
    'zwycięzca_płci_przeciwnej',
    'najlepszy_junior',
    'najlepszy_weteran'
);

-- placement
create type public.placement as enum ('1st', '2nd', '3rd', '4th');
