import React, { useState, useEffect } from "react";
import type { ShowResponse, UpdateShowDto } from "../../types";
import LoadingSpinner from "./LoadingSpinner";
import ErrorDisplay from "./ErrorDisplay";

interface EditShowModalProps {
  show: ShowResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdateShowDto) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

interface EditShowData {
  name: string;
  showDate: string;
  location: string;
  judgeName: string;
  description: string;
}

const EditShowModal: React.FC<EditShowModalProps> = ({
  show,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState<EditShowData>({
    name: "",
    showDate: "",
    location: "",
    judgeName: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when show changes
  useEffect(() => {
    if (show) {
      setFormData({
        name: show.name,
        showDate: show.show_date,
        location: show.location,
        judgeName: show.judge_name,
        description: show.description || "",
      });
      setErrors({});
    }
  }, [show]);

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
      today.setHours(0, 0, 0, 0);

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
      const updateData: UpdateShowDto = {
        name: formData.name,
        show_date: formData.showDate,
        location: formData.location,
        judge_name: formData.judgeName,
        description: formData.description || undefined,
      };

      await onSave(updateData);
      onClose();
    } catch (error) {
      console.error("Error updating show:", error);
      setErrors({ submit: "Błąd podczas aktualizacji wystawy" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof EditShowData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen || !show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edytuj wystawę</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && <ErrorDisplay error={error} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Podstawowe informacje
              </h3>

              {/* Show Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nazwa wystawy *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="np. Wystawa Klubowa Hovawartów 2024"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Show Date */}
              <div>
                <label
                  htmlFor="showDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Data wystawy *
                </label>
                <input
                  type="date"
                  id="showDate"
                  value={formData.showDate}
                  onChange={(e) =>
                    handleInputChange("showDate", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.showDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.showDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.showDate}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Lokalizacja *
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.location ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="np. Warszawa, ul. Przykładowa 1"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              {/* Judge Name */}
              <div>
                <label
                  htmlFor="judgeName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Imię i nazwisko sędziego *
                </label>
                <input
                  type="text"
                  id="judgeName"
                  value={formData.judgeName}
                  onChange={(e) =>
                    handleInputChange("judgeName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.judgeName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="np. Jan Kowalski"
                />
                {errors.judgeName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.judgeName}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Opis (opcjonalny)
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dodatkowe informacje o wystawie..."
                />
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="text-red-600 text-sm">{errors.submit}</div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="px-4 py-2 bg-amber-500 text-gray-900 rounded-md hover:bg-amber-400 disabled:opacity-50 transition-colors"
              >
                {isSubmitting || isLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Zapisywanie...
                  </div>
                ) : (
                  "Zapisz zmiany"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditShowModal;
