import React, { useState, useEffect } from "react";
import type { DogClass } from "../../types";

interface RegisterDogModalProps {
  showId: string;
  dogId: string;
  dogName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RegistrationFormData {
  dog_class: DogClass;
  grade?: string;
  baby_puppy_grade?: string;
  club_title?: string;
  placement?: string;
}

type ValidationErrors = Record<string, string[]>;

const RegisterDogModal: React.FC<RegisterDogModalProps> = ({
  showId,
  dogId,
  dogName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    dog_class: "open",
    grade: undefined,
    baby_puppy_grade: undefined,
    club_title: undefined,
    placement: undefined,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      dog_class: "open",
      grade: undefined,
      baby_puppy_grade: undefined,
      club_title: undefined,
      placement: undefined,
    });
    setErrors({});
    setSuccessMessage("");
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.dog_class) {
      newErrors.dog_class = ["Klasa psa jest wymagana"];
    }

    // Evaluation validation depending on class
    if (formData.dog_class === "baby" || formData.dog_class === "puppy") {
      if (!formData.baby_puppy_grade) {
        newErrors.baby_puppy_grade = [
          "Dla klas baby/puppy wymagana jest ocena baby/puppy",
        ];
      }
      if (formData.grade) {
        newErrors.grade = [
          "Klasy baby/puppy nie używają pola 'ocena' tylko 'ocena baby/puppy'",
        ];
      }
    } else if (formData.dog_class) {
      if (!formData.grade) {
        newErrors.grade = ["Ocena jest wymagana dla wybranej klasy"];
      }
      if (formData.baby_puppy_grade) {
        newErrors.baby_puppy_grade = [
          "Dla klas innych niż baby/puppy nie używa się 'ocena baby/puppy'",
        ];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (
    field: keyof RegistrationFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1) Zarejestruj psa na wystawę
      const regResponse = await fetch(`/api/shows/${showId}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dog_id: dogId,
          dog_class: formData.dog_class,
        }),
      });

      if (!regResponse.ok) {
        const errorData = await regResponse.json();
        throw new Error(
          errorData.error?.message || "Błąd tworzenia rejestracji",
        );
      }

      // 2) Utwórz ocenę
      const evalPayload: Record<string, unknown> = {
        dog_id: dogId,
        dog_class: formData.dog_class,
        club_title: formData.club_title || undefined,
        placement: formData.placement || undefined,
      };

      if (formData.dog_class === "baby" || formData.dog_class === "puppy") {
        evalPayload["baby_puppy_grade"] = formData.baby_puppy_grade;
      } else {
        evalPayload["grade"] = formData.grade;
      }

      const evalResponse = await fetch(`/api/shows/${showId}/evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evalPayload),
      });

      if (!evalResponse.ok) {
        const errorData = await evalResponse.json();
        throw new Error(errorData.error?.message || "Błąd zapisu oceny psa");
      }

      // Sukces
      setSuccessMessage(
        `Pies "${dogName}" został pomyślnie zarejestrowany na wystawę w klasie ${formData.dog_class}!`,
      );

      setTimeout(() => {
        onSuccess();
        resetForm();
      }, 2000);
    } catch (error) {
      setErrors({
        submit: [
          error instanceof Error ? error.message : "Błąd rejestracji psa",
        ],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Zarejestruj psa na wystawę
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Zarejestruj psa &quot;{dogName}&quot; na wystawę i wprowadź ocenę.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Dog Class Selection */}
            <div>
              <label
                htmlFor="dog-class"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Klasa psa *
              </label>
              <select
                id="dog-class"
                value={formData.dog_class}
                onChange={(e) =>
                  handleFormChange("dog_class", e.target.value as DogClass)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="baby">Baby (4-6 miesięcy)</option>
                <option value="puppy">Szczenię (6-9 miesięcy)</option>
                <option value="junior">Junior (9-18 miesięcy)</option>
                <option value="intermediate">Młodzież (15-24 miesięcy)</option>
                <option value="open">Otwarta (15+ miesięcy)</option>
                <option value="working">Pracująca (15+ miesięcy)</option>
                <option value="champion">Champion (15+ miesięcy)</option>
                <option value="veteran">Weteran (8+ lat)</option>
              </select>
              {errors.dog_class && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.dog_class[0]}
                </p>
              )}
            </div>

            {/* Evaluation Fields */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ocena i wyniki
              </h3>

              {/* Baby/Puppy Grade */}
              {(formData.dog_class === "baby" ||
                formData.dog_class === "puppy") && (
                <div className="mb-4">
                  <label
                    htmlFor="baby-puppy-grade"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ocena (baby/puppy) *
                  </label>
                  <select
                    id="baby-puppy-grade"
                    value={formData.baby_puppy_grade || ""}
                    onChange={(e) =>
                      handleFormChange("baby_puppy_grade", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Wybierz ocenę</option>
                    <option value="bardzo_obiecujący">Bardzo obiecujący</option>
                    <option value="obiecujący">Obiecujący</option>
                    <option value="dość_obiecujący">Dość obiecujący</option>
                  </select>
                  {errors.baby_puppy_grade && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.baby_puppy_grade[0]}
                    </p>
                  )}
                </div>
              )}

              {/* Regular Grade */}
              {formData.dog_class &&
                formData.dog_class !== "baby" &&
                formData.dog_class !== "puppy" && (
                  <div className="mb-4">
                    <label
                      htmlFor="grade"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Ocena *
                    </label>
                    <select
                      id="grade"
                      value={formData.grade || ""}
                      onChange={(e) =>
                        handleFormChange("grade", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Wybierz ocenę</option>
                      <option value="doskonała">Doskonała</option>
                      <option value="bardzo_dobra">Bardzo dobra</option>
                      <option value="dobra">Dobra</option>
                      <option value="zadowalająca">Zadowalająca</option>
                      <option value="zdyskwalifikowana">
                        Zdyskwalifikowana
                      </option>
                      <option value="nieobecna">Nieobecna</option>
                    </select>
                    {errors.grade && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.grade[0]}
                      </p>
                    )}
                  </div>
                )}

              {/* Club Title and Placement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="club-title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tytuł klubowy
                  </label>
                  <select
                    id="club-title"
                    value={formData.club_title || ""}
                    onChange={(e) =>
                      handleFormChange("club_title", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Brak</option>
                    <option value="młodzieżowy_zwycięzca_klubu">
                      Młodzieżowy Zwycięzca Klubu
                    </option>
                    <option value="zwycięzca_klubu">Zwycięzca Klubu</option>
                    <option value="zwycięzca_klubu_weteranów">
                      Zwycięzca Klubu Weteranów
                    </option>
                    <option value="najlepszy_reproduktor">
                      Najlepszy Reproduktor
                    </option>
                    <option value="najlepsza_suka_hodowlana">
                      Najlepsza Suka Hodowlana
                    </option>
                    <option value="najlepsza_para">Najlepsza Para</option>
                    <option value="najlepsza_hodowla">Najlepsza Hodowla</option>
                    <option value="zwycięzca_rasy">Zwycięzca Rasy</option>
                    <option value="zwycięzca_płci_przeciwnej">
                      Zwycięzca Płci Przeciwnej
                    </option>
                    <option value="najlepszy_junior">Najlepszy Junior</option>
                    <option value="najlepszy_weteran">Najlepszy Weteran</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="placement"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Lokata
                  </label>
                  <select
                    id="placement"
                    value={formData.placement || ""}
                    onChange={(e) =>
                      handleFormChange("placement", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Brak</option>
                    <option value="1st">1</option>
                    <option value="2nd">2</option>
                    <option value="3rd">3</option>
                    <option value="4th">4</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Error Messages */}
          {errors.submit && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{errors.submit[0]}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-500 text-gray-900 rounded-md hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Rejestracja..." : "Zarejestruj psa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterDogModal;
