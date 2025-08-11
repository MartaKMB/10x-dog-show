import React, { useState } from "react";
import { Button } from "../ui/button";

type ValidationErrors = Record<string, string[]>;

const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Miejsce na integrację z Supabase updateUser
      await new Promise((resolve) => setTimeout(resolve, 700));
      setSuccessMessage("Hasło zostało zaktualizowane (placeholder)");
    } catch (err) {
      setServerError("Nie udało się zaktualizować hasła");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Ustaw nowe hasło
      </h1>

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
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nowe hasło
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
            {isSubmitting ? "Zapisywanie..." : "Zapisz nowe hasło"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
