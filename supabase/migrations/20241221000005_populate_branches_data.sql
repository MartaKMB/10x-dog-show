-- Populate branches table with real ZKwP (Polish Kennel Club) branch data
-- Based on official ZKwP branch information

-- Clear existing sample data
DELETE FROM public.branches;

-- Insert real ZKwP branches with verified addresses
INSERT INTO public.branches (name, address, city, postal_code, region, is_active) VALUES
-- Oddziały z potwierdzonymi adresami
('Oddział Białystok', 'ul. Warszawska 6a lok.1', 'Białystok', '15-062', 'Podlaskie', true),
('Oddział Będzin', 'ul. Bolesława Chrobrego 3', 'Będzin', '42-500', 'Śląskie', true),
('Oddział Bydgoszcz', 'ul. Ułańska 4A', 'Bydgoszcz', '85-689', 'Kujawsko-Pomorskie', true),
('Oddział Bytom', 'ul. Mickiewicza 13', 'Bytom', '41-902', 'Śląskie', true),
('Oddział Bielsko-Biała', 'ul. Jana III Sobieskiego 132', 'Bielsko-Biała', '43-300', 'Śląskie', true),
('Oddział Chojnice', 'pl. Jagielloński 2', 'Chojnice', '89-600', 'Pomorskie', true),
('Oddział Chorzów', 'ul. Powstańców 41', 'Chorzów', '41-500', 'Śląskie', true),
('Oddział Częstochowa', 'ul. Jana III Sobieskiego 19a lok. 3', 'Częstochowa', '42-200', 'Śląskie', true),
('Oddział Gorzów Wlkp.', 'ul. Kosynierów Gdyńskich 98', 'Gorzów Wielkopolski', '66-400', 'Lubuskie', true),
('Oddział Kalisz', 'ul. Złota 41', 'Kalisz', '62-800', 'Wielkopolskie', true),
('Oddział Kielce', 'ul. Śląska 10', 'Kielce', '25-328', 'Świętokrzyskie', true),
('Oddział Koszalin', 'ul. 1 Maja 36', 'Koszalin', '75-001', 'Zachodniopomorskie', true),
('Oddział Szczecin', 'Al. Jana Pawła II 44', 'Szczecin', '70-413', 'Zachodniopomorskie', true),

-- Oddziały bez potwierdzonych adresów (z podstawowymi danymi)
('Oddział Gdynia', null, 'Gdynia', null, 'Pomorskie', true),
('Oddział Grudziądz', null, 'Grudziądz', null, 'Kujawsko-Pomorskie', true),
('Oddział Inowrocław', null, 'Inowrocław', null, 'Kujawsko-Pomorskie', true),
('Oddział Jelenia Góra', null, 'Jelenia Góra', null, 'Dolnośląskie', true),
('Oddział Katowice', null, 'Katowice', null, 'Śląskie', true),
('Oddział Kraków', null, 'Kraków', null, 'Małopolskie', true),
('Oddział Krosno', null, 'Krosno', null, 'Podkarpackie', true),
('Oddział Legionowo', null, 'Legionowo', null, 'Mazowieckie', true),
('Oddział Legnica', null, 'Legnica', null, 'Dolnośląskie', true),
('Oddział Leszno', null, 'Leszno', null, 'Wielkopolskie', true),
('Oddział Lublin', null, 'Lublin', null, 'Lubelskie', true),
('Oddział Łódź', null, 'Łódź', null, 'Łódzkie', true),
('Oddział Nowy Sącz', null, 'Nowy Sącz', null, 'Małopolskie', true),
('Oddział Nowy Targ', null, 'Nowy Targ', null, 'Małopolskie', true),
('Oddział Olsztyn', null, 'Olsztyn', null, 'Warmińsko-Mazurskie', true),
('Oddział Opole', null, 'Opole', null, 'Opolskie', true),
('Oddział Piaseczno', null, 'Piaseczno', null, 'Mazowieckie', true),
('Oddział Płock', null, 'Płock', null, 'Mazowieckie', true),
('Oddział Poznań', null, 'Poznań', null, 'Wielkopolskie', true),
('Oddział Przemyśl', null, 'Przemyśl', null, 'Podkarpackie', true),
('Oddział Racibórz', null, 'Racibórz', null, 'Śląskie', true),
('Oddział Radom', null, 'Radom', null, 'Mazowieckie', true),
('Oddział Rybnik', null, 'Rybnik', null, 'Śląskie', true),
('Oddział Rzeszów', null, 'Rzeszów', null, 'Podkarpackie', true),
('Oddział Sopot', null, 'Sopot', null, 'Pomorskie', true),
('Oddział Słupsk', null, 'Słupsk', null, 'Pomorskie', true),
('Oddział Toruń', null, 'Toruń', null, 'Kujawsko-Pomorskie', true),
('Oddział Wałbrzych', null, 'Wałbrzych', null, 'Dolnośląskie', true),
('Oddział Warszawa', null, 'Warszawa', null, 'Mazowieckie', true),
('Oddział Wieliczka', null, 'Wieliczka', null, 'Małopolskie', true),
('Oddział Włocławek', null, 'Włocławek', null, 'Kujawsko-Pomorskie', true),
('Oddział Wrocław', null, 'Wrocław', null, 'Dolnośląskie', true),
('Oddział Zabrze', null, 'Zabrze', null, 'Śląskie', true),
('Oddział Zakopane', null, 'Zakopane', null, 'Małopolskie', true),
('Oddział Zielona Góra', null, 'Zielona Góra', null, 'Lubuskie', true);

-- Add comment about data source
COMMENT ON TABLE public.branches IS 'Dog show organization branches - ZKwP (Polish Kennel Club) branches with real data'; 
