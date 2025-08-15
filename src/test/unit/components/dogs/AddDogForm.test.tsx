import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddDogForm from "../../../../components/dogs/AddDogForm";

// Mock fetch
global.fetch = vi.fn();

describe("AddDogForm", () => {
  const user = userEvent.setup();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe("Renderowanie", () => {
    it("renderuje podstawowe elementy formularza", () => {
      render(<AddDogForm onSuccess={mockOnSuccess} />);

      // Nagłówek
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Dodaj psa",
      );

      // Formularz
      expect(screen.getByTestId("add-dog-form")).toBeInTheDocument();

      // Przycisk submit
      expect(
        screen.getByRole("button", { name: "Dodaj psa" }),
      ).toBeInTheDocument();
    });
  });

  describe("Walidacja", () => {
    it("waliduje wymagane pola psa", async () => {
      render(<AddDogForm onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole("button", { name: "Dodaj psa" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Nazwa psa jest wymagana")).toBeInTheDocument();
        expect(
          screen.getByText("Nazwa hodowli jest wymagana"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Data urodzenia jest wymagana"),
        ).toBeInTheDocument();
      });
    });

    it("waliduje wymagane pola właściciela", async () => {
      render(<AddDogForm onSuccess={mockOnSuccess} />);

      // Wypełnij dane psa
      await user.type(screen.getByLabelText("Nazwa *"), "Rex");
      await user.type(screen.getByLabelText("Nazwa hodowli *"), "Test Kennel");
      await user.type(screen.getByLabelText("Data urodzenia *"), "2020-01-01");

      const submitButton = screen.getByRole("button", { name: "Dodaj psa" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Imię właściciela jest wymagane"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Nazwisko właściciela jest wymagane"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Email właściciela jest wymagany"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Zgoda RODO jest wymagana"),
        ).toBeInTheDocument();
      });
    });

    it("waliduje format email", async () => {
      render(<AddDogForm onSuccess={mockOnSuccess} />);

      // Wypełnij dane psa
      await user.type(screen.getByLabelText("Nazwa *"), "Rex");
      await user.type(screen.getByLabelText("Nazwa hodowli *"), "Test Kennel");
      await user.type(screen.getByLabelText("Data urodzenia *"), "2020-01-01");

      // Wypełnij dane właściciela z nieprawidłowym emailem
      await user.type(screen.getByLabelText("Imię *"), "Jan");
      await user.type(screen.getByLabelText("Nazwisko *"), "Kowalski");
      await user.type(screen.getByLabelText("Email *"), "nieprawidlowy-email");
      await user.click(screen.getByTestId("gdpr-consent-checkbox"));

      const submitButton = screen.getByRole("button", { name: "Dodaj psa" });
      await user.click(submitButton);

      // Sprawdź że błąd email jest wyświetlony (HTML5 validation)
      await waitFor(() => {
        const emailInput = screen.getByLabelText("Email *");
        expect(emailInput).toBeInvalid();
      });
    });
  });

  describe("Interakcje", () => {
    it("obsługuje wprowadzanie danych w polach psa", async () => {
      render(<AddDogForm onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByLabelText("Nazwa *");
      const kennelInput = screen.getByLabelText("Nazwa hodowli *");
      const birthDateInput = screen.getByLabelText("Data urodzenia *");

      await user.type(nameInput, "Rex");
      await user.type(kennelInput, "Test Kennel");
      await user.type(birthDateInput, "2020-01-01");

      expect(nameInput).toHaveValue("Rex");
      expect(kennelInput).toHaveValue("Test Kennel");
      expect(birthDateInput).toHaveValue("2020-01-01");
    });

    it("obsługuje zmianę płci i maści", async () => {
      render(<AddDogForm onSuccess={mockOnSuccess} />);

      const genderSelect = screen.getByRole("combobox", { name: "Płeć *" });
      const coatSelect = screen.getByRole("combobox", { name: "Maść *" });

      await user.selectOptions(genderSelect, "female");
      await user.selectOptions(coatSelect, "czarny_podpalany");

      expect(genderSelect).toHaveValue("female");
      expect(coatSelect).toHaveValue("czarny_podpalany");
    });

    it("obsługuje wprowadzanie danych właściciela", async () => {
      render(<AddDogForm onSuccess={mockOnSuccess} />);

      const firstNameInput = screen.getByLabelText("Imię *");
      const lastNameInput = screen.getByLabelText("Nazwisko *");
      const emailInput = screen.getByLabelText("Email *");
      const phoneInput = screen.getByLabelText("Telefon");

      await user.type(firstNameInput, "Jan");
      await user.type(lastNameInput, "Kowalski");
      await user.type(emailInput, "jan@example.com");
      await user.type(phoneInput, "123456789");

      expect(firstNameInput).toHaveValue("Jan");
      expect(lastNameInput).toHaveValue("Kowalski");
      expect(emailInput).toHaveValue("jan@example.com");
      expect(phoneInput).toHaveValue("123456789");
    });

    it("obsługuje zaznaczenie zgody RODO", async () => {
      render(<AddDogForm onSuccess={mockOnSuccess} />);

      const gdprCheckbox = screen.getByRole("checkbox");

      expect(gdprCheckbox).not.toBeChecked();

      await user.click(gdprCheckbox);

      expect(gdprCheckbox).toBeChecked();
    });
  });

  describe("Wysyłanie formularza", () => {
    it("wysyła dane psa i właściciela pomyślnie", async () => {
      const mockFetch = vi.mocked(fetch);

      // Mock dla sprawdzenia istniejącego właściciela
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      // Mock dla tworzenia właściciela
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "owner-123" }),
      } as Response);

      // Mock dla tworzenia psa
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "dog-123" }),
      } as Response);

      render(<AddDogForm onSuccess={mockOnSuccess} />);

      // Wypełnij formularz
      await user.type(screen.getByLabelText("Nazwa *"), "Rex");
      await user.type(screen.getByLabelText("Nazwa hodowli *"), "Test Kennel");
      await user.type(screen.getByLabelText("Data urodzenia *"), "2020-01-01");
      await user.type(screen.getByLabelText("Imię *"), "Jan");
      await user.type(screen.getByLabelText("Nazwisko *"), "Kowalski");
      await user.type(screen.getByLabelText("Email *"), "jan@example.com");
      await user.click(screen.getByTestId("gdpr-consent-checkbox"));

      const submitButton = screen.getByRole("button", { name: "Dodaj psa" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("success-message")).toBeInTheDocument();
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      // Sprawdź wywołania fetch
      expect(mockFetch).toHaveBeenCalledTimes(3);

      // Pierwsze wywołanie - sprawdzenie istniejącego właściciela
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "/api/owners?email=jan@example.com",
      );

      // Drugie wywołanie - tworzenie właściciela
      expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: "Jan",
          last_name: "Kowalski",
          email: "jan@example.com",
          phone: null,
          address: null,
          city: null,
          postal_code: null,
          kennel_name: null,
          gdpr_consent: true,
        }),
      });

      // Trzecie wywołanie - tworzenie psa
      expect(mockFetch).toHaveBeenNthCalledWith(3, "/api/dogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Rex",
          gender: "male",
          birth_date: "2020-01-01",
          coat: "czarny",
          microchip_number: null,
          kennel_name: "Test Kennel",
          father_name: null,
          mother_name: null,
          owners: [{ id: "owner-123", is_primary: true }],
        }),
      });
    });

    it("używa istniejącego właściciela jeśli email już istnieje", async () => {
      const mockFetch = vi.mocked(fetch);

      // Mock dla istniejącego właściciela
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ id: "existing-owner-123", email: "jan@example.com" }],
        }),
      } as Response);

      // Mock dla tworzenia psa
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "dog-123" }),
      } as Response);

      render(<AddDogForm onSuccess={mockOnSuccess} />);

      // Wypełnij formularz
      await user.type(screen.getByLabelText("Nazwa *"), "Rex");
      await user.type(screen.getByLabelText("Nazwa hodowli *"), "Test Kennel");
      await user.type(screen.getByLabelText("Data urodzenia *"), "2020-01-01");
      await user.type(screen.getByLabelText("Imię *"), "Jan");
      await user.type(screen.getByLabelText("Nazwisko *"), "Kowalski");
      await user.type(screen.getByLabelText("Email *"), "jan@example.com");
      await user.click(screen.getByTestId("gdpr-consent-checkbox"));

      const submitButton = screen.getByRole("button", { name: "Dodaj psa" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("success-message")).toBeInTheDocument();
      });

      // Sprawdź że fetch był wywołany tylko 2 razy (sprawdzenie właściciela + tworzenie psa)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("obsługuje błąd podczas tworzenia właściciela", async () => {
      const mockFetch = vi.mocked(fetch);

      // Mock dla sprawdzenia istniejącego właściciela
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      // Mock dla błędu tworzenia właściciela
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { message: "Błąd tworzenia właściciela" },
        }),
      } as Response);

      render(<AddDogForm onSuccess={mockOnSuccess} />);

      // Wypełnij formularz
      await user.type(screen.getByLabelText("Nazwa *"), "Rex");
      await user.type(screen.getByLabelText("Nazwa hodowli *"), "Test Kennel");
      await user.type(screen.getByLabelText("Data urodzenia *"), "2020-01-01");
      await user.type(screen.getByLabelText("Imię *"), "Jan");
      await user.type(screen.getByLabelText("Nazwisko *"), "Kowalski");
      await user.type(screen.getByLabelText("Email *"), "jan@example.com");
      await user.click(screen.getByTestId("gdpr-consent-checkbox"));

      const submitButton = screen.getByRole("button", { name: "Dodaj psa" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("submit-error")).toBeInTheDocument();
      });
    });

    it("obsługuje błąd podczas tworzenia psa", async () => {
      const mockFetch = vi.mocked(fetch);

      // Mock dla sprawdzenia istniejącego właściciela
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      // Mock dla tworzenia właściciela
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "owner-123" }),
      } as Response);

      // Mock dla błędu tworzenia psa
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: "Błąd tworzenia psa" } }),
      } as Response);

      render(<AddDogForm onSuccess={mockOnSuccess} />);

      // Wypełnij formularz
      await user.type(screen.getByLabelText("Nazwa *"), "Rex");
      await user.type(screen.getByLabelText("Nazwa hodowli *"), "Test Kennel");
      await user.type(screen.getByLabelText("Data urodzenia *"), "2020-01-01");
      await user.type(screen.getByLabelText("Imię *"), "Jan");
      await user.type(screen.getByLabelText("Nazwisko *"), "Kowalski");
      await user.type(screen.getByLabelText("Email *"), "jan@example.com");
      await user.click(screen.getByTestId("gdpr-consent-checkbox"));

      const submitButton = screen.getByRole("button", { name: "Dodaj psa" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("submit-error")).toBeInTheDocument();
      });
    });
  });

  describe("Stany komponentu", () => {
    it("pokazuje loading podczas wysyłania", async () => {
      const mockFetch = vi.mocked(fetch);

      // Mock dla opóźnionej odpowiedzi
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: false,
                  status: 404,
                } as Response),
              100,
            ),
          ),
      );

      render(<AddDogForm onSuccess={mockOnSuccess} />);

      // Wypełnij formularz
      await user.type(screen.getByLabelText("Nazwa *"), "Rex");
      await user.type(screen.getByLabelText("Nazwa hodowli *"), "Test Kennel");
      await user.type(screen.getByLabelText("Data urodzenia *"), "2020-01-01");
      await user.type(screen.getByLabelText("Imię *"), "Jan");
      await user.type(screen.getByLabelText("Nazwisko *"), "Kowalski");
      await user.type(screen.getByLabelText("Email *"), "jan@example.com");
      await user.click(screen.getByTestId("gdpr-consent-checkbox"));

      const submitButton = screen.getByRole("button", { name: "Dodaj psa" });
      await user.click(submitButton);

      // Sprawdź stan loading
      expect(
        screen.getByRole("button", { name: "Zapisywanie..." }),
      ).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });
});
