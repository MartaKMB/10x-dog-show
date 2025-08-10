import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../../../../components/auth/LoginForm";

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

describe("LoginForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe("Renderowanie", () => {
    it("renderuje formularz logowania z wszystkimi polami", () => {
      render(<LoginForm />);

      expect(screen.getByText("Logowanie")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Hasło")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Zaloguj się" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Zapomniałeś hasła?")).toBeInTheDocument();
      expect(screen.getByText("Nie masz konta?")).toBeInTheDocument();
    });

    it("renderuje linki nawigacyjne z poprawnymi href", () => {
      render(<LoginForm />);

      const forgotPasswordLink = screen.getByText("Zapomniałeś hasła?");
      const registerLink = screen.getByText("Zarejestruj się");

      expect(forgotPasswordLink.closest("a")).toHaveAttribute(
        "href",
        "/auth/forgot-password",
      );
      expect(registerLink.closest("a")).toHaveAttribute(
        "href",
        "/auth/register",
      );
    });
  });

  describe("Walidacja formularza", () => {
    it("pokazuje błąd gdy email jest pusty", async () => {
      render(<LoginForm />);

      const submitButton = screen.getByRole("button", { name: "Zaloguj się" });
      await user.click(submitButton);

      expect(screen.getByText("Email jest wymagany")).toBeInTheDocument();
    });

    it("pokazuje błąd gdy email ma nieprawidłowy format", async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const submitButton = screen.getByRole("button", { name: "Zaloguj się" });

      await user.type(emailInput, "nieprawidlowy-email");
      await user.click(submitButton);

      expect(
        screen.getByText("Nieprawidłowy format email"),
      ).toBeInTheDocument();
    });

    it("pokazuje błąd gdy hasło jest puste", async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const submitButton = screen.getByRole("button", { name: "Zaloguj się" });

      await user.type(emailInput, "test@example.com");
      await user.click(submitButton);

      expect(screen.getByText("Hasło jest wymagane")).toBeInTheDocument();
    });

    it("pokazuje błąd gdy hasło jest za krótkie", async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Hasło");
      const submitButton = screen.getByRole("button", { name: "Zaloguj się" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "123");
      await user.click(submitButton);

      expect(
        screen.getByText("Hasło musi mieć co najmniej 8 znaków"),
      ).toBeInTheDocument();
    });

    it("waliduje wszystkie pola jednocześnie", async () => {
      render(<LoginForm />);

      const submitButton = screen.getByRole("button", { name: "Zaloguj się" });
      await user.click(submitButton);

      expect(screen.getByText("Email jest wymagany")).toBeInTheDocument();
      expect(screen.getByText("Hasło jest wymagane")).toBeInTheDocument();
    });

    it("nie pokazuje błędów gdy dane są poprawne", async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Hasło");

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      // Sprawdź czy nie ma błędów przed submitem
      expect(screen.queryByText("Email jest wymagany")).not.toBeInTheDocument();
      expect(screen.queryByText("Hasło jest wymagane")).not.toBeInTheDocument();
    });
  });

  describe("Sukces logowania", () => {
    it("przekierowuje na dashboard po udanym logowaniu", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ user: { id: "123", email: "test@example.com" } }),
      } as Response);

      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Hasło");
      const submitButton = screen.getByRole("button", { name: "Zaloguj się" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
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

      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Hasło");
      const submitButton = screen.getByRole("button", { name: "Zaloguj się" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        });
      });
    });
  });

  describe("Stylowanie", () => {
    it("pokazuje czerwone obramowanie dla pól z błędami", async () => {
      render(<LoginForm />);

      const submitButton = screen.getByRole("button", { name: "Zaloguj się" });
      await user.click(submitButton);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Hasło");

      expect(emailInput).toHaveClass("border-red-300");
      expect(passwordInput).toHaveClass("border-red-300");
    });

    it("pokazuje normalne obramowanie dla pól bez błędów", async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Hasło");

      expect(emailInput).toHaveClass("border-gray-300");
      expect(passwordInput).toHaveClass("border-gray-300");
    });
  });
});
