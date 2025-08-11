import React, { useState } from "react";
import { Button } from "../ui/button";

type ValidationErrors = Record<string, string[]>;

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!email.trim()) {
      newErrors.email = ["Email jest wymagany"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = ["Nieprawidłowy format email"];
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMessage(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Miejsce na integrację z backendem/Supabase reset link
      await new Promise((resolve) => setTimeout(resolve, 600));
      setInfoMessage(
        "Jeśli adres istnieje, wysłaliśmy instrukcje resetu hasła.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Odzyskiwanie hasła
      </h1>

      {infoMessage && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
          {infoMessage}
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
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-300" : "border-gray-300"
            }`}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email[0]}</p>
          )}
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Wysyłanie..." : "Wyślij instrukcje"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
