-- =============================================================================
-- Migration: Populate Breeds Data
-- =============================================================================
-- Purpose: Insert all FCI recognized dog breeds into dictionary.breeds table
-- Source: breeds-list-from-perplexity.md
-- Date: 2024-12-21
-- =============================================================================

-- =============================================================================
-- 1. INSERT BREEDS DATA
-- =============================================================================

-- Grupa 1: Psy pasterskie i zaganiające (z wyłączeniem szwajcarskich psów do bydła)
INSERT INTO dictionary.breeds (name_pl, name_en, fci_group, is_active) VALUES
('Owczarek Niemiecki', 'German Shepherd Dog', 'G1', true),
('Owczarek Australijski', 'Australian Shepherd', 'G1', true),
('Border Collie', 'Border Collie', 'G1', true),
('Owczarek Szkocki Długowłosy', 'Collie Rough', 'G1', true),
('Owczarek Szkocki Krótkowłosy', 'Collie Smooth', 'G1', true),
('Owczarek Belgijski Malinois', 'Belgian Shepherd Dog Malinois', 'G1', true),
('Owczarek Belgijski Tervueren', 'Belgian Shepherd Dog Tervueren', 'G1', true),
('Owczarek Belgijski Groenendael', 'Belgian Shepherd Dog Groenendael', 'G1', true),
('Owczarek Belgijski Lakenois', 'Belgian Shepherd Dog Laekenois', 'G1', true),
('Owczarek Chorwacki', 'Croatian Sheepdog', 'G1', true),
('Owczarek Kataloński', 'Catalan Sheepdog', 'G1', true),
('Owczarek Holenderski', 'Dutch Shepherd Dog', 'G1', true),
('Owczarek Francuski Beauceron', 'Beauceron', 'G1', true),
('Owczarek Francuski Briard', 'Briard', 'G1', true),
('Owczarek Szetlandzki', 'Shetland Sheepdog', 'G1', true),
('Owczarek Węgierski Mudi', 'Mudi', 'G1', true),
('Pumi', 'Pumi', 'G1', true),
('Puli', 'Puli', 'G1', true),
('Komondor', 'Komondor', 'G1', true),
('Kuvasz', 'Kuvasz', 'G1', true),
('Cão da Serra de Aires', 'Portuguese Sheepdog', 'G1', true),
('Pastore della Lessinia e del Lagorai', 'Lessinia and Lagorai Shepherd Dog', 'G1', true),
('Welsh Corgi Pembroke', 'Welsh Corgi Pembroke', 'G1', true),
('Welsh Corgi Cardigan', 'Welsh Corgi Cardigan', 'G1', true),
('Owczarek Australijski Kelpie', 'Australian Kelpie', 'G1', true),
('Owczarek Australijski Cattle Dog', 'Australian Cattle Dog', 'G1', true),
('Bobtail', 'Old English Sheepdog', 'G1', true),

-- Grupa 2: Pinczery, sznaucery, molosy i szwajcarskie psy do bydła
('Dog Niemiecki', 'Great Dane', 'G2', true),
('Bokser', 'Boxer', 'G2', true),
('Doberman', 'Dobermann', 'G2', true),
('Rottweiler', 'Rottweiler', 'G2', true),
('Nowofundland', 'Newfoundland', 'G2', true),
('Mastif Angielski', 'English Mastiff', 'G2', true),
('Mastif Neapolitański', 'Neapolitan Mastiff', 'G2', true),
('Cane Corso', 'Cane Corso Italiano', 'G2', true),
('Dogo Argentino', 'Dogo Argentino', 'G2', true),
('Mastin Español', 'Spanish Mastiff', 'G2', true),
('Mastif Francuski', 'Dogue de Bordeaux', 'G2', true),
('Leonberger', 'Leonberger', 'G2', true),
('Bernardyn', 'Saint Bernard', 'G2', true),
('Sznaucer', 'Standard Schnauzer', 'G2', true),
('Sznaucer Miniaturowy', 'Miniature Schnauzer', 'G2', true),
('Sznaucer Olbrzym', 'Giant Schnauzer', 'G2', true),
('Pinczer Miniaturowy', 'Miniature Pinscher', 'G2', true),
('Pinczer Średni', 'German Pinscher', 'G2', true),
('Pinscher Austriacki', 'Austrian Pinscher', 'G2', true),
('Bouvier des Flandres', 'Bouvier des Flandres', 'G2', true),
('Bouvier des Ardennes', 'Bouvier des Ardennes', 'G2', true),
('Mastino degli Abruzzi', 'Maremma and Abruzzes Sheepdog', 'G2', true),
('Ca de Bou', 'Perro Dogo Mallorquín', 'G2', true),
('Szwajcarski Pies Pasterski Entlebucheński', 'Entlebucher Mountain Dog', 'G2', true),
('Szwajcarski Pies Pasterski Appenzellerski', 'Appenzeller Mountain Dog', 'G2', true),
('Szwajcarski Pies Pasterski Berneński', 'Bernese Mountain Dog', 'G2', true),
('Duży Szwajcarski Pies Pasterski', 'Greater Swiss Mountain Dog', 'G2', true),

-- Grupa 3: Teriery
-- Sekcja 1: Teriery duże i średnie
('Airedale Terrier', 'Airedale Terrier', 'G3', true),
('Foxterrier Krótkowłosy', 'Smooth Fox Terrier', 'G3', true),
('Foxterrier Szorstkowłosy', 'Wire Fox Terrier', 'G3', true),
('Welsh Terrier', 'Welsh Terrier', 'G3', true),
('Lakeland Terrier', 'Lakeland Terrier', 'G3', true),
('Kerry Blue Terrier', 'Kerry Blue Terrier', 'G3', true),

-- Sekcja 2: Teriery małe
('Scottish Terrier', 'Scottish Terrier', 'G3', true),
('West Highland White Terrier', 'West Highland White Terrier', 'G3', true),
('Cairn Terrier', 'Cairn Terrier', 'G3', true),
('Norfolk Terrier', 'Norfolk Terrier', 'G3', true),
('Norwich Terrier', 'Norwich Terrier', 'G3', true),
('Border Terrier', 'Border Terrier', 'G3', true),
('Irish Soft Coated Wheaten Terrier', 'Irish Soft Coated Wheaten Terrier', 'G3', true),
('Sealyham Terrier', 'Sealyham Terrier', 'G3', true),
('Bedlington Terrier', 'Bedlington Terrier', 'G3', true),
('Dandie Dinmont Terrier', 'Dandie Dinmont Terrier', 'G3', true),

-- Sekcja 3: Teriery typu bull
('Bull Terrier', 'Bull Terrier', 'G3', true),
('Miniaturowy Bull Terrier', 'Miniature Bull Terrier', 'G3', true),
('Staffordshire Bull Terrier', 'Staffordshire Bull Terrier', 'G3', true),

-- Sekcja 4: Teriery miniaturowe
('Jack Russell Terrier', 'Jack Russell Terrier', 'G3', true),
('Parson Russell Terrier', 'Parson Russell Terrier', 'G3', true),
('Yorkshire Terrier', 'Yorkshire Terrier', 'G3', true),

-- Grupa 4: Jamniki
('Jamnik Krótkowłosy Standardowy', 'Dachshund Smooth-haired Standard', 'G4', true),
('Jamnik Krótkowłosy Miniaturowy', 'Dachshund Smooth-haired Miniature', 'G4', true),
('Jamnik Krótkowłosy Króliczy', 'Dachshund Smooth-haired Rabbit', 'G4', true),
('Jamnik Długowłosy Standardowy', 'Dachshund Long-haired Standard', 'G4', true),
('Jamnik Długowłosy Miniaturowy', 'Dachshund Long-haired Miniature', 'G4', true),
('Jamnik Długowłosy Króliczy', 'Dachshund Long-haired Rabbit', 'G4', true),
('Jamnik Szorstkowłosy Standardowy', 'Dachshund Wire-haired Standard', 'G4', true),
('Jamnik Szorstkowłosy Miniaturowy', 'Dachshund Wire-haired Miniature', 'G4', true),
('Jamnik Szorstkowłosy Króliczy', 'Dachshund Wire-haired Rabbit', 'G4', true),

-- Grupa 5: Szpice i psy ras pierwotnych
('Alaskan Malamute', 'Alaskan Malamute', 'G5', true),
('Husky Syberyjski', 'Siberian Husky', 'G5', true),
('Samoyed', 'Samoyed', 'G5', true),
('Akita', 'Akita', 'G5', true),
('Shiba Inu', 'Shiba', 'G5', true),
('Kishu', 'Kishu', 'G5', true),
('Basenji', 'Basenji', 'G5', true),
('Chow Chow', 'Chow Chow', 'G5', true),
('Pomorski Szpic Miniaturowy', 'Pomeranian', 'G5', true),
('Szpic Niemiecki Mały', 'German Spitz Klein', 'G5', true),
('Szpic Niemiecki Średni', 'German Spitz Mittel', 'G5', true),
('Szpic Niemiecki Duży', 'German Spitz Gross', 'G5', true),
('Szpic Niemiecki Wilczy', 'German Spitz Wolfspitz', 'G5', true),
('Szpic Fiński', 'Finnish Spitz', 'G5', true),
('Norsk Elghund', 'Norwegian Elkhound', 'G5', true),
('Eurasier', 'Eurasier', 'G5', true),
('Kai Ken', 'Kai', 'G5', true),
('Jämthund', 'Swedish Elkhound', 'G5', true),
('Lapinporokoira', 'Lapponian Herder', 'G5', true),
('Laika Wschodniosyberyjska', 'East Siberian Laika', 'G5', true),
('Laika Zachodniosyberyjska', 'West Siberian Laika', 'G5', true),
('Laika Rosyjska-Europejska', 'Russian-European Laika', 'G5', true),
('Norweski Lundehund', 'Norwegian Lundehund', 'G5', true),
('Islandzki Pies Owczarski', 'Icelandic Sheepdog', 'G5', true),

-- Grupa 6: Psy gończe i rasy pokrewne
('Bloodhound', 'Bloodhound', 'G6', true),
('Beagle', 'Beagle', 'G6', true),
('Basset Hound', 'Basset Hound', 'G6', true),
('Basset Artezyjsko-Normandzki', 'Basset Artésien Normand', 'G6', true),
('Basset Fauve de Bretagne', 'Basset Fauve de Bretagne', 'G6', true),
('Grand Bleu de Gascogne', 'Grand Bleu de Gascogne', 'G6', true),
('Petit Bleu de Gascogne', 'Petit Bleu de Gascogne', 'G6', true),
('Foxhound Angielski', 'English Foxhound', 'G6', true),
('Harrier', 'Harrier', 'G6', true),
('Polski Gończy', 'Polish Hunting Dog', 'G6', true),
('Ogar Polski', 'Polish Hound', 'G6', true),
('Dalmatyńczyk', 'Dalmatian', 'G6', true),
('Rhodesian Ridgeback', 'Rhodesian Ridgeback', 'G6', true),
('Posokowiec Bawarski', 'Bavarian Mountain Scent Hound', 'G6', true),
('Posokowiec Hanowerski', 'Hanoverian Scent Hound', 'G6', true),
('Posokowiec Alpejski', 'Alpine Dachsbracke', 'G6', true),

-- Grupa 7: Wyżły
('Wyżeł Niemiecki Krótkowłosy', 'German Shorthaired Pointer', 'G7', true),
('Wyżeł Niemiecki Długowłosy', 'German Longhaired Pointer', 'G7', true),
('Wyżeł Niemiecki Szorstkowłosy', 'German Wirehaired Pointer', 'G7', true),
('Pointer Angielski', 'English Pointer', 'G7', true),
('Setter Irlandzki Czerwony', 'Irish Red Setter', 'G7', true),
('Setter Angielski', 'English Setter', 'G7', true),
('Gordon Setter', 'Gordon Setter', 'G7', true),
('Wyżeł Węgierski Krótkowłosy', 'Hungarian Short-haired Pointer', 'G7', true),
('Wyżeł Węgierski Długowłosy', 'Hungarian Wire-haired Pointer', 'G7', true),
('Bracco Italiano', 'Bracco Italiano', 'G7', true),
('Spinone Italiano', 'Spinone Italiano', 'G7', true),
('Épagneul Breton', 'Brittany', 'G7', true),
('Wyżeł Czeski Fousek', 'Czechoslovakian Wire-haired Pointing Griffon', 'G7', true),
('Wyżeł Słowacki', 'Slovakian Wire-haired Pointing Dog', 'G7', true),
('Wyżeł Francuski', 'French Pointing Dog', 'G7', true),
('Wyżeł Portugalski', 'Portuguese Pointing Dog', 'G7', true),
('Münsterländer Mały', 'Small Münsterländer', 'G7', true),
('Münsterländer Duży', 'Large Münsterländer', 'G7', true),

-- Grupa 8: Aportery, płochacze i psy dowodne
('Labrador Retriever', 'Labrador Retriever', 'G8', true),
('Golden Retriever', 'Golden Retriever', 'G8', true),
('Flat Coated Retriever', 'Flat Coated Retriever', 'G8', true),
('Chesapeake Bay Retriever', 'Chesapeake Bay Retriever', 'G8', true),
('Nova Scotia Duck Tolling Retriever', 'Nova Scotia Duck Tolling Retriever', 'G8', true),
('Cocker Spaniel Angielski', 'English Cocker Spaniel', 'G8', true),
('Cocker Spaniel Amerykański', 'American Cocker Spaniel', 'G8', true),
('Springer Spaniel Angielski', 'English Springer Spaniel', 'G8', true),
('Field Spaniel', 'Field Spaniel', 'G8', true),
('Welsh Springer Spaniel', 'Welsh Springer Spaniel', 'G8', true),
('Curly Coated Retriever', 'Curly Coated Retriever', 'G8', true),
('Płochacz Niemiecki', 'German Spaniel', 'G8', true),
('Płochacz Holenderski', 'Drentse Patrijshond', 'G8', true),
('Barbet', 'Barbet', 'G8', true),
('Lagotto Romagnolo', 'Lagotto Romagnolo', 'G8', true),
('Irish Water Spaniel', 'Irish Water Spaniel', 'G8', true),

-- Grupa 9: Psy ozdobne i do towarzystwa
('Bichon Frisé', 'Bichon Frisé', 'G9', true),
('Bolończyk', 'Bolognese', 'G9', true),
('Chihuahua', 'Chihuahua', 'G9', true),
('Pekińczyk', 'Pekingese', 'G9', true),
('Szpic Miniaturowy', 'Pomeranian', 'G9', true),
('Papillon', 'Papillon', 'G9', true),
('Phalène', 'Phalène', 'G9', true),
('Shih Tzu', 'Shih Tzu', 'G9', true),
('Lhasa Apso', 'Lhasa Apso', 'G9', true),
('Maltańczyk', 'Maltese', 'G9', true),
('Hawańczyk', 'Havanese', 'G9', true),
('Cavalier King Charles Spaniel', 'Cavalier King Charles Spaniel', 'G9', true),
('King Charles Spaniel', 'King Charles Spaniel', 'G9', true),
('Mops', 'Pug', 'G9', true),
('Boston Terrier', 'Boston Terrier', 'G9', true),
('Buldog Francuski', 'French Bulldog', 'G9', true),
('Gryfon Brukselski', 'Griffon Bruxellois', 'G9', true),
('Gryfon Belgijski', 'Griffon Belge', 'G9', true),
('Gryfon Brabancki', 'Petit Brabançon', 'G9', true),
('Pudel Toy', 'Poodle Toy', 'G9', true),
('Pudel Miniaturowy', 'Poodle Miniature', 'G9', true),
('Pudel Średni', 'Poodle Medium', 'G9', true),
('Pudel Duży', 'Poodle Standard', 'G9', true),

-- Grupa 10: Charty
('Chart Afgański', 'Afghan Hound', 'G10', true),
('Chart Rosyjski Borzoj', 'Russian Borzoi', 'G10', true),
('Chart Irlandzki Wilczarz', 'Irish Wolfhound', 'G10', true),
('Chart Szkocki Deerhound', 'Scottish Deerhound', 'G10', true),
('Chart Angielski Greyhound', 'Greyhound', 'G10', true),
('Chart Włoski', 'Italian Greyhound', 'G10', true),
('Whippet', 'Whippet', 'G10', true),
('Saluki', 'Saluki', 'G10', true),
('Azawakh', 'Azawakh', 'G10', true),
('Chart Perski', 'Sloughi', 'G10', true),
('Chart Hiszpański Galgo', 'Spanish Greyhound', 'G10', true),
('Magyar Agár', 'Hungarian Greyhound', 'G10', true),
('Chart Arabski', 'Arabian Greyhound', 'G10', true)

;

-- =============================================================================
-- 2. VERIFICATION QUERIES
-- =============================================================================

-- Sprawdzenie liczby wstawionych ras
SELECT 
    fci_group,
    COUNT(*) as breed_count
FROM dictionary.breeds 
WHERE is_active = true 
GROUP BY fci_group 
ORDER BY fci_group;

-- Sprawdzenie całkowitej liczby ras
SELECT COUNT(*) as total_breeds FROM dictionary.breeds WHERE is_active = true;

-- Sprawdzenie duplikatów nazw (powinno być puste)
SELECT name_pl, COUNT(*) 
FROM dictionary.breeds 
GROUP BY name_pl 
HAVING COUNT(*) > 1; 
