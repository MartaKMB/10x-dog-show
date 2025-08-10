import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "../../../../components/auth/RegisterForm";

// Mock fetch globally
const mockFetch = vi.fn();
Object.defineProperty(global, "fetch", {
  value: mockFetch,
  writable: true,
});

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "",
  },
  writable: true,
});

describe("RegisterForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe("Renderowanie", () => {
    it("renderuje formularz rejestracji z wszystkimi polami", () => {
      render(<RegisterForm />);

      expect(screen.getByText("Rejestracja")).toBeInTheDocument();
      expect(screen.getByLabelText("Imię")).toBeInTheDocument();
      expect(screen.getByLabelText("Nazwisko")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Hasło")).toBeInTheDocument();
      expect(screen.getByLabelText("Powtórz hasło")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Utwórz konto" }),
      ).toBeInTheDocument();
    });

    it("renderuje linki nawigacyjne z poprawnymi href", () => {
      render(<RegisterForm />);

      const loginLink = screen.getByText("Zaloguj się");
      expect(loginLink.closest("a")).toHaveAttribute("href", "/auth/login");
    });

    it("renderuje pola w układzie grid dla większych ekranów", () => {
      render(<RegisterForm />);

      const firstNameContainer = screen.getByLabelText("Imię").closest("div");

      expect(firstNameContainer?.parentElement).toHaveClass(
        "grid",
        "grid-cols-1",
        "md:grid-cols-2",
      );
    });
  });

  describe("Walidacja formularza", () => {
    it("pokazuje błąd gdy imię jest puste", async () => {
      render(<RegisterForm />);

      const submitButton = screen.getByRole("button", { name: "Utwórz konto" });
      await user.click(submitButton);

      expect(screen.getByText("Imię jest wymagane")).toBeInTheDocument();
    });

    it("pokazuje błąd gdy nazwisko jest puste", async () => {
      render(<RegisterForm />);

      const submitButton = screen.getByRole("button", { name: "Utwórz konto" });
      await user.click(submitButton);

      expect(screen.getByText("Nazwisko jest wymagane")).toBeInTheDocument();
    });

    it("pokazuje błąd gdy email jest pusty", async () => {
      render(<RegisterForm />);

      const firstNameInput = screen.getByLabelText("Imię");
      const submitButton = screen.getByRole("button", { name: "Utwórz konto" });

      await user.type(firstNameInput, "Jan");
      await user.click(submitButton);

      expect(screen.getByText("Email jest wymagany")).toBeInTheDocument();
    });

    it("pokazuje błąd gdy email ma nieprawidłowy format", async () => {
      render(<RegisterForm />);

      const firstNameInput = screen.getByLabelText("Imię");
      const lastNameInput = screen.getByLabelText("Nazwisko");
      const emailInput = screen.getByLabelText("Email");
      const submitButton = screen.getByRole("button", { name: "Utwórz konto" });

      await user.type(firstNameInput, "Jan");
      await user.type(lastNameInput, "Kowalski");
      await user.type(emailInput, "nieprawidlowy-email");
      await user.click(submitButton);

      expect(
        screen.getByText("Nieprawidłowy format email"),
      ).toBeInTheDocument();
    });

    it("pokazuje błąd gdy hasło jest puste", async () => {
      render(<RegisterForm />);

      const firstNameInput = screen.getByLabelText("Imię");
      const lastNameInput = screen.getByLabelText("Nazwisko");
      const emailInput = screen.getByLabelText("Email");
      const submitButton = screen.getByRole("button", { name: "Utwórz konto" });

      await user.type(firstNameInput, "Jan");
      await user.type(lastNameInput, "Kowalski");
      await user.type(emailInput, "test@example.com");
      await user.click(submitButton);

      expect(screen.getByText("Hasło jest wymagane")).toBeInTheDocument();
    });

    it("pokazuje błąd gdy hasło jest za krótkie", async () => {
      render(<RegisterForm />);

      const firstNameInput = screen.getByLabelText("Imię");
      const lastNameInput = screen.getByLabelText("Nazwisko");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Hasło");
      const submitButton = screen.getByRole("button", { name: "Utwórz konto" });

      await user.type(firstNameInput, "Jan");
      await user.type(lastNameInput, "Kowalski");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "123");
      await user.click(submitButton);

      expect(
        screen.getByText("Hasło musi mieć co najmniej 8 znaków"),
      ).toBeInTheDocument();
    });

    it("pokazuje błąd gdy potwierdzenie hasła jest puste", async () => {
      render(<RegisterForm />);

      const firstNameInput = screen.getByLabelText("Imię");
      const lastNameInput = screen.getByLabelText("Nazwisko");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Hasło");
      const submitButton = screen.getByRole("button", { name: "Utwórz konto" });

      await user.type(firstNameInput, "Jan");
      await user.type(lastNameInput, "Kowalski");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      expect(screen.getByText("Potwierdź hasło")).toBeInTheDocument();
    });

    it("pokazuje błąd gdy hasła nie są zgodne", async () => {
      render(<RegisterForm />);

      const firstNameInput = screen.getByLabelText("Imię");
      const lastNameInput = screen.getByLabelText("Nazwisko");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Hasło");
      const confirmPasswordInput = screen.getByLabelText("Powtórz hasło");
      const submitButton = screen.getByRole("button", { name: "Utwórz konto" });

      await user.type(firstNameInput, "Jan");
      await user.type(lastNameInput, "Kowalski");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "different123");
      await user.click(submitButton);

      expect(screen.getByText("Hasła muszą być zgodne")).toBeInTheDocument();
    });

    it("waliduje wszystkie pola jednocześnie", async () => {
      render(<RegisterForm />);

      const submitButton = screen.getByRole("button", { name: "Utwórz konto" });
      await user.click(submitButton);

      expect(screen.getByText("Imię jest wymagane")).toBeInTheDocument();
      expect(screen.getByText("Nazwisko jest wymagane")).toBeInTheDocument();
      expect(screen.getByText("Email jest wymagany")).toBeInTheDocument();
      expect(screen.getByText("Hasło jest wymagane")).toBeInTheDocument();
      expect(screen.getByText("Potwierdź hasło")).toBeInTheDocument();
    });

    it("nie pokazuje błędów gdy wszystkie dane są poprawne", async () => {
      render(<RegisterForm />);

      const firstNameInput = screen.getByLabelText("Imię");
      const lastNameInput = screen.getByLabelText("Nazwisko");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Hasło");
      const confirmPasswordInput = screen.getByLabelText("Powtórz hasło");

      await user.type(firstNameInput, "Jan");
      await user.type(lastNameInput, "Kowalski");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

      // Sprawdź czy nie ma błędów przed submitem
      expect(screen.queryByText("Imię jest wymagane")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Nazwisko jest wymagane"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Email jest wymagany")).not.toBeInTheDocument();
      expect(screen.queryByText("Hasło jest wymagane")).not.toBeInTheDocument();
      expect(screen.queryByText("Potwierdź hasło")).not.toBeInTheDocument();
    });
  });

  describe("Sukces rejestracji", () => {
    it("przekierowuje na dashboard po udanej rejestracji", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ user: { id: "123", email: "test@example.com" } }),
      } as Response);

      render(<RegisterForm />);

      await fillFormWithValidData();
      const submitButton = screen.getByRole("button", { name: "Utwórz konto" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(window.location.href).toBe("/");
      });
    });

    it("wywołuje fetch z poprawnymi danymi", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ user: { id: "123", email: "test@example.com" } }),
      } as Response);

      render(<RegisterForm />);

      await fillFormWithValidData();
      const submitButton = screen.getByRole("button", { name: "Utwórz konto" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
            first_name: "Jan",
            last_name: "Kowalski",
          }),
        });
      });
    });
  });

  describe("Stylowanie", () => {
    it("pokazuje czerwone obramowanie dla pól z błędami", async () => {
      render(<RegisterForm />);

      const submitButton = screen.getByRole("button", { name: "Utwórz konto" });
      await user.click(submitButton);

      const firstNameInput = screen.getByLabelText("Imię");
      const emailInput = screen.getByLabelText("Email");

      expect(firstNameInput).toHaveClass("border-red-300");
      expect(emailInput).toHaveClass("border-red-300");
    });

    it("pokazuje normalne obramowanie dla pól bez błędów", async () => {
      render(<RegisterForm />);

      const firstNameInput = screen.getByLabelText("Imię");
      const emailInput = screen.getByLabelText("Email");

      expect(firstNameInput).toHaveClass("border-gray-300");
      expect(emailInput).toHaveClass("border-gray-300");
    });
  });

  // Helper function to fill form with valid data
  async function fillFormWithValidData() {
    const firstNameInput = screen.getByLabelText("Imię");
    const lastNameInput = screen.getByLabelText("Nazwisko");
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Hasło");
    const confirmPasswordInput = screen.getByLabelText("Powtórz hasło");

    await user.type(firstNameInput, "Jan");
    await user.type(lastNameInput, "Kowalski");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
  }
});
