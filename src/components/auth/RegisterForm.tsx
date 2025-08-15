import React, { useState } from "react";
import { Button } from "../ui/button";
import AuthLogo from "./AuthLogo";

type ValidationErrors = Record<string, string[]>;

const RegisterForm: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = { ...errors }; // Zachowaj istniejące błędy

    if (!firstName.trim()) newErrors.firstName = ["Imię jest wymagane"];
    if (!lastName.trim()) newErrors.lastName = ["Nazwisko jest wymagane"];

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

    if (!confirmPassword) {
      newErrors.confirmPassword = ["Potwierdź hasło"];
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = ["Hasła muszą być zgodne"];
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          errorBody?.error?.message ??
          "Nie udało się utworzyć konta. Spróbuj ponownie.";
        throw new Error(message);
      }

      // Po udanej rejestracji i ustanowieniu sesji przekieruj na dashboard
      window.location.href = "/";
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Wystąpił błąd podczas rejestracji";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <AuthLogo />

      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Rejestracja
      </h2>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Imię
            </label>
            <input
              id="first_name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.firstName && (
              <p className="text-red-600 text-sm mt-1">{errors.firstName[0]}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="last_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nazwisko
            </label>
            <input
              id="last_name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.lastName && (
              <p className="text-red-600 text-sm mt-1">{errors.lastName[0]}</p>
            )}
          </div>
        </div>

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
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password[0]}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirm_password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Powtórz hasło
          </label>
          <input
            id="confirm_password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword ? "border-red-300" : "border-gray-300"
            }`}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">
              {errors.confirmPassword[0]}
            </p>
          )}
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Rejestrowanie..." : "Utwórz konto"}
          </Button>
        </div>
      </form>

      <p className="text-sm text-gray-600 mt-6">
        Masz już konto?{" "}
        <a href="/auth/login" className="text-blue-600 hover:underline">
          Zaloguj się
        </a>
      </p>
    </div>
  );
};

export default RegisterForm;
