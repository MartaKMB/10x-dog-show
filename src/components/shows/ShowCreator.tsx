import React, { useState } from "react";
import type { CreateShowDto } from "../../types";
import { useShowCreator } from "../../hooks/useShowCreator";
import LoadingSpinner from "./LoadingSpinner";
import ErrorDisplay from "./ErrorDisplay";

type ShowCreatorProps = object;

interface ShowCreatorData {
  // Basic Information for Hovawart Club
  name: string;
  showDate: string;
  location: string;
  judgeName: string;
  description: string;
}

const ShowCreator: React.FC<ShowCreatorProps> = () => {
  const [formData, setFormData] = useState<ShowCreatorData>({
    name: "",
    showDate: "",
    location: "",
    judgeName: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoading, error, createShow } = useShowCreator();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nazwa wystawy jest wymagana";
    }

    if (!formData.showDate) {
      newErrors.showDate = "Data wystawy jest wymagana";
    } else {
      const showDate = new Date(formData.showDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day

      if (showDate > today) {
        newErrors.showDate =
          "Data wystawy nie może być w przyszłości. Wystawy są tworzone najwcześniej w dniu wystawy.";
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = "Lokalizacja jest wymagana";
    }

    if (!formData.judgeName.trim()) {
      newErrors.judgeName = "Imię i nazwisko sędziego jest wymagane";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const showData: CreateShowDto = {
        name: formData.name,
        show_date: formData.showDate,
        location: formData.location,
        judge_name: formData.judgeName,
        description: formData.description || undefined,
      };

      await createShow(showData);

      // Redirect to shows list
      window.location.href = "/shows";
    } catch (error) {
      console.error("Error creating show:", error);
      setErrors({ submit: "Błąd podczas tworzenia wystawy" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ShowCreatorData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => window.location.reload()}
        title="Błąd ładowania formularza"
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Nowa wystawa klubowa
          </h1>
          <p className="text-gray-600">
            Utwórz nową wystawę klubową hovawartów. Wystawy będą tworzone
            najwcześniej w dniu wystawy, zazwyczaj po niej, aby przechowywać te
            informacje w jednym miejscu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Show Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nazwa wystawy *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="np. Wystawa Klubowa Hovawartów 2024"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Show Date */}
          <div>
            <label
              htmlFor="showDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Data wystawy *
            </label>
            <input
              type="date"
              id="showDate"
              value={formData.showDate}
              onChange={(e) => handleInputChange("showDate", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.showDate ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.showDate && (
              <p className="text-red-600 text-sm mt-1">{errors.showDate}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Lokalizacja *
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.location ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="np. Warszawa, ul. Wystawowa 1"
            />
            {errors.location && (
              <p className="text-red-600 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {/* Judge Name */}
          <div>
            <label
              htmlFor="judgeName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Imię i nazwisko sędziego *
            </label>
            <input
              type="text"
              id="judgeName"
              value={formData.judgeName}
              onChange={(e) => handleInputChange("judgeName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.judgeName ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="np. dr Jan Sędzia"
            />
            {errors.judgeName && (
              <p className="text-red-600 text-sm mt-1">{errors.judgeName}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Opis wystawy
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Krótki opis wystawy, dodatkowe informacje..."
            />
          </div>

          {/* Error Messages */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => (window.location.href = "/shows")}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Tworzenie...</span>
                </div>
              ) : (
                "Utwórz wystawę"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShowCreator;
