import React, { useState } from "react";
import { Button } from "../ui/button";
import AuthLogo from "./AuthLogo";

type ValidationErrors = Record<string, string[]>;

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = { ...errors }; // Zachowaj istniejące błędy

    if (!email.trim()) {
      newErrors.email = ["Email jest wymagany"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = ["Nieprawidłowy format email"];
    }

    if (!password) {
      newErrors.password = ["Hasło jest wymagane"];
    } else if (password.length < 8) {
      newErrors.password = ["Hasło musi mieć co najmniej 8 znaków"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Walidacja w czasie rzeczywistym dla pola email
  const validateEmail = (emailValue: string) => {
    if (!emailValue.trim()) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setErrors((prev) => ({ ...prev, email: ["Nieprawidłowy format email"] }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          errorBody?.error?.message ?? "Nieprawidłowy email lub hasło.";
        throw new Error(message);
      }

      // Sprawdź czy jest parametr redirect w URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get("redirect") || "/";

      // Przekieruj na odpowiednią stronę
      window.location.href = redirectTo;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Wystąpił błąd podczas logowania";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <AuthLogo />

      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Logowanie</h2>

      {serverError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {successMessage}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-300" : "border-gray-300"
            }`}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email[0]}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Hasło
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? "border-red-300" : "border-gray-300"
            }`}
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password[0]}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <a
            href="/auth/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Zapomniałeś hasła?
          </a>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </div>
      </form>

      <p className="text-sm text-gray-600 mt-6">
        Nie masz konta?{" "}
        <a href="/auth/register" className="text-blue-600 hover:underline">
          Zarejestruj się
        </a>
      </p>
    </div>
  );
};

export default LoginForm;
