# Plan implementacji widoku Description Editor

## 1. Przegląd
Widok Description Editor służy do tworzenia i edycji opisów psów podczas konkretnej wystawy przez sekretarza ringu. Każdy pies może mieć różne opisy i oceny na różnych wystawach.
Umożliwia wprowadzanie opisu w dwóch językach (PL/EN), ocenianie psa (ocena, tytuł, lokata, punkty), przeglądanie historii wersji oraz finalizację opisu.
Obsługuje ręczne zapisywanie, walidację uprawnień i ograniczenia czasowe.

## 2. Routing widoku
- `/descriptions/{id}/edit` – edycja istniejącego opisu dla konkretnej wystawy
- `/shows/{showId}/dogs/{dogId}/description/new` – tworzenie nowego opisu dla psa na konkretnej wystawie

## 3. Struktura komponentów
- `DescriptionEditor`
  - `DescriptionHeader`
    - `DogInfo`
    - `ShowInfo`
    - `ShowStatusIndicator`
  - `RichTextEditor` (PL/EN)
  - `EvaluationForm`
    - `GradeSelector`
    - `TitleSelector`
    - `PlacementSelector`
    - `PointsInput`
  - `ActionButtons` (Zapisz, Finalizuj, Anuluj)
  - `ChangeHistory`
    - `VersionList`
    - `SimpleDiffViewer`
  - `FormWithConfirmation`
  - `OfflineDetector`

## 4. Szczegóły komponentów

### DescriptionEditor
- **Opis**: Główny kontener widoku, zarządza stanem formularza, walidacją, integracją z API.
- **Elementy**: Header, edytor tekstu, formularz oceny, historia zmian, przyciski akcji.
- **Interakcje**: onSave, onFinalize, onCancel, onFieldChange.
- **Walidacja**: uprawnienia sekretarza, status wystawy, obecność treści w min. jednym języku, poprawność oceny.
- **Typy**: `DescriptionResponseDto`, `CreateDescriptionDto`, `UpdateDescriptionDto`, `EvaluationResponseDto`
- **Props**: `descriptionId?`, `dogId`, `showId`, `initialData?`

### RichTextEditor
- **Opis**: Edytor rich text z obsługą PL/EN, wsparcie dla dostępności.
- **Elementy**: zakładki językowe, toolbar, pole edycji.
- **Interakcje**: onChange, onBlur, onFocus.
- **Walidacja**: długość, obecność treści, XSS.
- **Typy**: `{ content_pl: string, content_en: string }`
- **Props**: `value`, `onChange`, `disabled`

### EvaluationForm
- **Opis**: Formularz oceny psa (ocena, tytuł, lokata, punkty) dla konkretnej wystawy.
- **Elementy**: selecty, inputy, walidacja zależna od klasy psa.
- **Interakcje**: onGradeChange, onTitleChange, onPlacementChange, onPointsChange.
- **Walidacja**: poprawność oceny dla klasy, tytuł tylko dla wybranych ocen, max 4 lokaty.
- **Typy**: `CreateEvaluationDto`, `EvaluationResponseDto`
- **Props**: `value`, `onChange`, `dogClass`, `disabled`

### ChangeHistory
- **Opis**: Wyświetla historię wersji opisu z minimalnymi informacjami o zmianach.
- **Elementy**: lista wersji, prosty diff viewer.
- **Interakcje**: onVersionSelect.
- **Walidacja**: tylko do odczytu.
- **Typy**: `DescriptionVersionDto[]`
- **Props**: `versions`, `onSelect`

### SimpleDiffViewer
- **Opis**: Minimalny diff viewer pokazujący kto, kiedy i jakie pole edytował.
- **Elementy**: lista zmian z informacjami o autorze, czasie i edytowanym polu.
- **Interakcje**: brak.
- **Walidacja**: brak.
- **Typy**: `{ field: string, oldValue: string, newValue: string, author: string, timestamp: string }`
- **Props**: `changes`

### ActionButtons
- **Opis**: Zbiór przycisków akcji (Zapisz, Finalizuj, Anuluj).
- **Elementy**: buttony, potwierdzenia.
- **Interakcje**: onClick dla każdej akcji.
- **Walidacja**: dostępność przycisków zależna od statusu wystawy i uprawnień.
- **Typy**: brak.
- **Props**: `onSave`, `onFinalize`, `onCancel`, `disabled`, `isDirty`

## 5. Typy

- `CreateDescriptionDto` – { show_id, dog_id, judge_id, content_pl?, content_en? }
- `UpdateDescriptionDto` – { content_pl?, content_en? }
- `DescriptionResponseDto` – opis, pies, sędzia, sekretarz, wersja, is_final, evaluation, daty
- `CreateEvaluationDto` – { dog_class, grade?, baby_puppy_grade?, title?, placement?, points?, is_best_in_group?, is_best_in_show? }
- `EvaluationResponseDto` – jak wyżej + id, description_id, created_at
- `DescriptionVersionDto` – { id, version, content_pl, content_en, changed_by, change_reason, created_at, changed_fields: string[] }

## 6. Zarządzanie stanem

- Lokalny stan formularza (treść PL/EN, ocena, tytuł, lokata, punkty)
- Stan zapisu (isSaving, lastSaved, error, isDirty)
- Stan historii wersji (pobrane wersje, wybrana wersja)
- Stan uprawnień i statusu wystawy (czy można edytować/finalizować)
- Custom hooki: `useDescriptionEditor`, `useEvaluationValidation`

## 7. Integracja API

- **Tworzenie opisu**: `POST /descriptions` (`CreateDescriptionDto`)
- **Aktualizacja opisu**: `PUT /descriptions/{id}` (`UpdateDescriptionDto`)
- **Finalizacja**: `PATCH /descriptions/{id}/finalize`
- **Ocena**: `POST /descriptions/{id}/evaluations` (`CreateEvaluationDto`)
- **Historia wersji**: `GET /descriptions/{id}/versions` (`DescriptionVersionDto[]`)
- **Obsługa błędów**: mapowanie kodów 400/403/409/422 na komunikaty UI

## 8. Interakcje użytkownika

- Edycja treści opisu (PL/EN) – lokalne zmiany bez auto-zapisu
- Wybór oceny, tytułu, lokaty – lokalne zmiany bez auto-zapisu
- Zapis ręczny – przycisk "Zapisz" z potwierdzeniem zmian
- Finalizacja – przycisk "Finalizuj" z potwierdzeniem (zapisuje i finalizuje)
- Przeglądanie historii wersji – kliknięcie wersji, podgląd zmian
- Anulowanie zmian – przycisk "Anuluj" z potwierdzeniem
- Obsługa offline – informacja o braku połączenia, lokalny draft

## 9. Warunki i walidacja

- Edycja tylko jeśli wystawa nie jest zakończona (`show.status !== 'completed'`)
- Sekretarz musi mieć uprawnienia do rasy psa na tej konkretnej wystawie (walidacja po stronie backendu, obsługa 403)
- Treść opisu: wymagane min. jedno pole (PL lub EN)
- Ocena: tylko jedna, zgodna z klasą psa na tej wystawie
- Tytuł/lokata: tylko jeśli spełnione warunki biznesowe
- Finalizacja: tylko jeśli opis jest kompletny i nie jest już finalny
- Sprawdzenie czy opis już istnieje dla tej kombinacji (show_id, dog_id, judge_id)

## 10. Obsługa błędów

- 400 – walidacja pól, wyświetlenie błędów przy polach
- 403 – brak uprawnień do rasy psa na tej wystawie, komunikat i blokada edycji
- 409 – opis już istnieje dla tej kombinacji (show_id, dog_id, judge_id), przekierowanie do edycji istniejącego
- 422 – wystawa zakończona, komunikat i blokada edycji
- Błędy sieci – tryb offline, powiadomienia toast
- Konflikty wersji – informacja o nadpisaniu, możliwość odświeżenia

## 11. Kroki implementacji

1. Stworzenie routingu i skeletonu strony (`/descriptions/[id]/edit`, `/shows/[showId]/dogs/[dogId]/description/new`)
2. Implementacja komponentu `DescriptionEditor` z obsługą stanu i integracją API
3. Dodanie `RichTextEditor` z obsługą PL/EN i walidacją treści
4. Implementacja `EvaluationForm` z walidacją zależną od klasy psa
5. Implementacja przycisków akcji z obsługą walidacji i potwierdzeń (bez auto-save)
6. Pobieranie i wyświetlanie historii wersji (`ChangeHistory`)
7. Implementacja `SimpleDiffViewer` z minimalnymi informacjami o zmianach
8. Obsługa finalizacji opisu i blokady edycji po finalizacji
9. Obsługa błędów i komunikatów (w tym tryb offline)
10. Testy jednostkowe i integracyjne komponentów
11. Dokumentacja interfejsu i typów
12. Przegląd kodu i wdrożenie
