# Dokument wymagań produktu (PRD) - 10x Dog Show

## 1. Przegląd produktu

10x Dog Show to aplikacja webowa przyspieszająca i ułatwiająca tworzenie dokumentacji z wystaw psów rasowych.
Głównym celem jest digitalizacja procesu oceny psów, który obecnie odbywa się ręcznie przez sekretarza ringu notującego słowa sędziego na kalkach.

### Kluczowe funkcjonalności MVP:

- System zarządzania wystawami psów z możliwością tworzenia szablonów
- CRUD operacje na opisach psów z ograniczeniami czasowymi
- System kont użytkowników z różnymi rolami i uprawnieniami
- Automatyczne wysyłanie opisów mailem w formacie PDF
- Konfigurowalne zestawy ocen, tytułów i lokat
- System zarządzania zgodami RODO

### Architektura:

- Aplikacja webowa zawsze online z możliwością rozszerzenia o tryb offline
- Automatyczne usuwanie danych po 3 latach zgodnie z RODO
- Bezpieczny system uwierzytelniania i autoryzacji

## 2. Problem użytkownika

### Główny problem:

Obecnie opisy psów są wykonywane ręcznie przez kalkę przez sekretarza ringu, który notuje słowa sędziego. Pojawia się problem:

- Brak czytelności notatek
- Niedokładność opisów
- Wolne tempo wykonywania dokumentacji
- Marnotrawstwo papieru
- Trudności w archiwizacji i wyszukiwaniu

### Użytkownicy dotknięci problemem:

- Sekretarze ringów - spędzają zbyt dużo czasu na ręcznym notowaniu
- Sędziowie - muszą wolno dyktować opisy, powtarzać
- Organizatorzy wystaw - mają problemy z zarządzaniem dokumentacją
- Właściciele psów - otrzymują nieczytelne opisy
- Związki kynologiczne - mają trudności z archiwizacją danych

## 3. Wymagania funkcjonalne

### System zarządzania wystawami:

- Tworzenie, edycja i usuwanie szablonów wystaw
- Konfiguracja dat, lokalizacji i uczestników
- Zarządzanie harmonogramem wystaw

### System zarządzania opisami psów:

- Tworzenie, edycja, przeglądanie i usuwanie opisów
- Ograniczenia czasowe - brak edycji po zakończeniu wystawy
- Automatyczne zapisywanie wersji opisów

### System użytkowników i uprawnień:

- Różne role: Przedstawiciel oddziału, Sekretarz
- Kontrola dostępu do danych w zależności od roli
- Bezpieczne uwierzytelnianie i sesje
- Przedstawiciel oddziału zarządza sekretarzami i ma dostęp do wszystkich danych

### System ocen i tytułów:

- Konfigurowalne zestawy ocen dla różnych klas psów
- Zamknięte listy tytułów i lokat
- Walidacja wprowadzanych danych

### System komunikacji:

- Automatyczne wysyłanie opisów mailem w PDF do właściciela psa
- Powiadomienia o statusie wystaw

### Zgodność RODO:

- System zarządzania zgodami
- Mechanizmy realizacji praw użytkowników
- Automatyczne usuwanie danych po 3 latach

## 4. Granice produktu

### Co wchodzi w MVP:

- Zapisywanie, odczytywanie, przeglądanie i usuwanie opisów psa
- Edycja opisów z ograniczeniami czasowymi
- Prosty system kont użytkowników
- Podstawowe zarządzanie wystawami
- Automatyczne wysyłanie opisów mailem
- System zgodności RODO

### Co NIE wchodzi w MVP:

- Dodawanie opisów na zasadzie zapisu z materiału głosowego
- Zaawansowane funkcje analityczne
- Integracja z systemami zewnętrznymi
- Aplikacja mobilna
- Tryb offline
- Zaawansowane raporty i statystyki

## 5. Historyjki użytkowników

### US-001: Rejestracja użytkownika

**Tytuł:** Jako nowy użytkownik chcę się zarejestrować w systemie, aby uzyskać dostęp do funkcji aplikacji
**Opis:** Użytkownik wypełnia formularz rejestracji z podstawowymi danymi osobowymi i wybiera rolę w systemie
**Kryteria akceptacji:**

- Formularz zawiera pola: imię, nazwisko, email, hasło, potwierdzenie hasła, rola
- Email musi być unikalny w systemie
- Hasło musi mieć minimum 8 znaków
- Po rejestracji użytkownik otrzymuje email weryfikacyjny
- Konto jest aktywowane po weryfikacji emaila

### US-002: Logowanie użytkownika

**Tytuł:** Jako zarejestrowany użytkownik chcę się zalogować do systemu, aby uzyskać dostęp do swoich funkcji
**Opis:** Użytkownik wprowadza email i hasło w formularzu logowania
**Kryteria akceptacji:**

- Formularz zawiera pola: email, hasło
- System weryfikuje poprawność danych logowania
- Po udanym logowaniu użytkownik jest przekierowany do panelu głównego
- Sesja użytkownika jest utrzymywana przez określony czas
- Po nieudanej próbie logowania wyświetlany jest komunikat błędu

### US-003: Wylogowanie użytkownika

**Tytuł:** Jako zalogowany użytkownik chcę się wylogować z systemu, aby zabezpieczyć swoje dane
**Opis:** Użytkownik klika przycisk wylogowania w interfejsie
**Kryteria akceptacji:**

- Przycisk wylogowania jest dostępny w menu użytkownika
- Po wylogowaniu sesja jest zakończona
- Użytkownik jest przekierowany do strony logowania
- Wszystkie dane sesji są usunięte

### US-004: Tworzenie wystawy

**Tytuł:** Jako przedstawiciel oddziału chcę utworzyć nową wystawę, aby zaplanować wydarzenie
**Opis:** Przedstawiciel oddziału wypełnia formularz z danymi wystawy
**Kryteria akceptacji:**

- Formularz zawiera pola: nazwa, data, lokalizacja, opis, maksymalna liczba uczestników
- Data wystawy musi być w przyszłości
- Po utworzeniu wystawa jest widoczna na liście wystaw
- Przedstawiciel oddziału automatycznie staje się administratorem wystawy

### US-005: Edycja wystawy

**Tytuł:** Jako przedstawiciel oddziału chcę edytować dane wystawy, aby zaktualizować informacje
**Opis:** Przedstawiciel oddziału modyfikuje istniejące dane wystawy
**Kryteria akceptacji:**

- Edycja możliwa tylko przed rozpoczęciem wystawy
- Wszystkie pola są edytowalne
- Zmiany są zapisywane natychmiast
- Historia zmian jest logowana

### US-006: Usuwanie wystawy

**Tytuł:** Jako przedstawiciel oddziału chcę usunąć wystawę, aby anulować wydarzenie
**Opis:** Przedstawiciel oddziału usuwa wystawę z systemu
**Kryteria akceptacji:**

- Usuwanie możliwe tylko przed rozpoczęciem wystawy
- System wymaga potwierdzenia usunięcia
- Po usunięciu wszystkie powiązane dane są usuwane
- Uczestnicy otrzymują powiadomienie o anulowaniu

### US-007: Dodawanie psa do wystawy

**Tytuł:** Jako przedstawiciel oddziału chcę dodać psa do wystawy, aby umożliwić jego ocenę
**Opis:** Przedstawiciel oddziału wprowadza dane psa i jego właściciela
**Kryteria akceptacji:**

- Formularz zawiera dane psa: imię, rasa, płeć, data urodzenia, hodowla
- Formularz zawiera dane właściciela: imię, nazwisko, email, telefon, adres
- System waliduje poprawność danych
- Pies jest przypisany do odpowiedniej klasy na podstawie wieku i płci
- Właściciel otrzymuje email z potwierdzeniem zgłoszenia

### US-008: Edycja danych psa

**Tytuł:** Jako przedstawiciel oddziału chcę edytować dane psa, aby poprawić błędy w rejestracji
**Opis:** Przedstawiciel oddziału modyfikuje dane psa w systemie
**Kryteria akceptacji:**

- Edycja możliwa tylko przed rozpoczęciem wystawy
- Wszystkie pola są edytowalne
- Zmiany są zapisywane natychmiast
- Właściciel otrzymuje powiadomienie o zmianach

### US-009: Usuwanie psa z wystawy

**Tytuł:** Jako przedstawiciel oddziału chcę usunąć psa z wystawy, aby anulować jego udział
**Opis:** Przedstawiciel oddziału usuwa psa z listy uczestników wystawy
**Kryteria akceptacji:**

- Usuwanie możliwe tylko przed rozpoczęciem wystawy
- System wymaga potwierdzenia usunięcia
- Właściciel otrzymuje powiadomienie o anulowaniu udziału
- Miejsce zostaje zwolnione dla innych psów

### US-010: Tworzenie opisu psa

**Tytuł:** Jako sekretarz ringu chcę utworzyć opis psa podczas wystawy, aby udokumentować ocenę
**Opis:** Sekretarz wprowadza opis psa na podstawie słów sędziego
**Kryteria akceptacji:**

- Formularz zawiera pole tekstowe na opis
- System automatycznie zapisuje datę i czas utworzenia
- Opis jest przypisany do konkretnego psa i sędziego
- Możliwość zapisania wersji roboczej

### US-011: Edycja opisu psa

**Tytuł:** Jako sekretarz ringu chcę edytować opis psa, aby poprawić błędy
**Opis:** Sekretarz modyfikuje istniejący opis psa
**Kryteria akceptacji:**

- Edycja możliwa tylko przed zakończeniem wystawy
- System zachowuje historię zmian
- Możliwość dodania komentarza do zmiany

### US-012: Przeglądanie opisów psa

**Tytuł:** Jako użytkownik chcę przeglądać opisy psów, aby sprawdzić dokumentację
**Opis:** Użytkownik przegląda listę opisów z możliwością filtrowania
**Kryteria akceptacji:**

- Lista zawiera podstawowe informacje o opisach
- Możliwość filtrowania po wystawie, psie
- Możliwość wyszukiwania tekstowego

### US-017: Wprowadzanie oceny psa

**Tytuł:** Jako sekretarz ringu chcę wprowadzić ocenę psa, aby udokumentować wynik
**Opis:** Sekretarz wybiera ocenę z zamkniętej listy dla danej klasy psa
**Kryteria akceptacji:**

- Lista ocen jest konfigurowalna dla każdej klasy
- Można wybrać tylko jedną ocenę
- Ocena jest automatycznie zapisywana z datą
- Możliwość edycji przed zakończeniem wystawy

### US-018: Przydzielanie tytułu psu

**Tytuł:** Jako sekretarz ringu chcę przydzielić tytuł psu, aby udokumentować osiągnięcie
**Opis:** Sekretarz wybiera tytuł z zamkniętej listy
**Kryteria akceptacji:**

- Lista tytułów jest konfigurowalna
- Tytuł jest powiązany z oceną psa
- Możliwość edycji przed zakończeniem wystawy

### US-019: Przydzielanie lokaty psu

**Tytuł:** Jako sekretarz ringu chcę przydzielić lokatę psu, aby udokumentować pozycję
**Opis:** Sekretarz wybiera lokatę z zamkniętej listy
**Kryteria akceptacji:**

- Lista lokat jest konfigurowalna
- Lokata jest powiązana z oceną i tytułem
- Możliwość edycji przed zakończeniem wystawy

### US-020: Wysyłanie opisów mailem

**Tytuł:** Jako system chcę automatycznie wysłać opisy mailem, aby dostarczyć dokumentację
**Opis:** System automatycznie generuje PDF z opisami i wysyła je mailem
**Kryteria akceptacji:**

- PDF zawiera opis konkretnego psa
- Email jest wysyłany do właściciela psa
- Format PDF jest czytelny i profesjonalny
- Wysyłanie następuje po zakończeniu wystawy

### US-021: Zarządzanie zgodami RODO

**Tytuł:** Jako właściciel psa chcę wyrazić zgodę na przetwarzanie danych, aby uczestniczyć w wystawie
**Opis:** Właściciel wyraża zgodę podczas rejestracji psa
**Kryteria akceptacji:**

- Zgoda jest wyrażana świadomie i dobrowolnie
- System zapisuje timestamp zgody
- Możliwość wycofania zgody w dowolnym momencie
- Zgoda jest wymagana do uczestnictwa w wystawie

### US-022: Wycofanie zgody RODO

**Tytuł:** Jako właściciel psa chcę wycofać zgodę na przetwarzanie danych, aby chronić swoją prywatność
**Opis:** Właściciel wycofuje zgodę w panelu użytkownika
**Kryteria akceptacji:**

- Wycofanie zgody jest możliwe w dowolnym momencie
- System automatycznie usuwa dane osobowe
- Potwierdzenie wycofania jest wysyłane mailem
- Dane są usuwane w ciągu 30 dni

### US-023: Automatyczne usuwanie danych

**Tytuł:** Jako system chcę automatycznie usuwać dane po 3 latach, aby zachować zgodność z RODO
**Opis:** System automatycznie usuwa dane osobowe po upływie 3 lat
**Kryteria akceptacji:**

- Usuwanie następuje automatycznie co miesiąc
- Przed usunięciem właściciel jest powiadamiany
- Usunięte dane nie mogą być odzyskane
- Proces jest logowany dla celów audytowych

### US-013: Zarządzanie sekretarzami

**Tytuł:** Jako przedstawiciel oddziału chcę zarządzać sekretarzami, aby kontrolować dostęp do systemu
**Opis:** Przedstawiciel oddziału dodaje, edytuje i usuwa sekretarzy w systemie
**Kryteria akceptacji:**

- Możliwość przypisywania ról użytkownikom
- Kontrola dostępu do funkcji systemu
- Możliwość dezaktywacji konta
- Historia zmian jest logowana

### US-014: Ukrywanie danych osobowych

**Tytuł:** Jako sekretarz ringu chcę ukrywać dane osobowe, aby chronić prywatność
**Opis:** Sekretarz może ukrywać dane osobowe w interfejsie
**Kryteria akceptacji:**

- Przełącznik ukrywania danych osobowych
- Możliwość tymczasowego wyświetlenia danych

### US-015: Dostęp do wszystkich danych wystawy

**Tytuł:** Jako przedstawiciel oddziału chcę mieć dostęp do wszystkich danych wystawy, aby nadzorować proces
**Opis:** Przedstawiciel oddziału ma pełny dostęp do danych wystawy
**Kryteria akceptacji:**

- Dostęp do wszystkich opisów i ocen
- Możliwość eksportu danych do Excel
- Statystyki wystawy
- Możliwość zarządzania polityką prywatności

### US-016: Zarządzanie polityką prywatności

**Tytuł:** Jako przedstawiciel oddziału chcę zarządzać polityką prywatności, aby zapewnić zgodność z RODO
**Opis:** Przedstawiciel oddziału konfiguruje ustawienia prywatności
**Kryteria akceptacji:**

- Możliwość edycji polityki prywatności
- Kontrola okresu przechowywania danych
- Ustawienia automatycznego usuwania
- Powiadomienia o zmianach polityki

## 6. Metryki sukcesu

### Metryki wydajnościowe:

- **10% szybsze tworzenie opisu** - mierzone czasem wprowadzania opisu przez sekretarza ringu
- **Oszczędność 2 stron papieru na psa** - mierzone liczbą wydruków eliminowanych przez system
- **Eliminacja błędów czytelności** - mierzone porównaniem z ręcznymi notatkami (cel: 0% błędów)

### Metryki adopcji:

- **Adopcja systemu przez sekretarzy ringów** - mierzone liczbą aktywnych użytkowników
- **Liczba wystaw obsługiwanych przez system** - mierzone miesięcznie
- **Liczba opisów utworzonych w systemie** - mierzone dziennie/tygodniowo

### Metryki jakościowe:

- **Zgodność z RODO** - mierzone audytem i brakiem naruszeń (cel: 100% zgodność)
- **Satysfakcja użytkowników** - mierzona ankietami (cel: >80% satysfakcji)
- **Czas odpowiedzi systemu** - mierzony dla kluczowych operacji (cel: <2 sekundy)

### Metryki biznesowe:

- **Liczba wystaw obsługiwanych miesięcznie** - cel: wzrost o 20% w pierwszym roku
- **Liczba aktywnych organizatorów** - cel: wzrost o 15% kwartalnie
- **Wskaźnik retencji użytkowników** - cel: >90% po 6 miesiącach
