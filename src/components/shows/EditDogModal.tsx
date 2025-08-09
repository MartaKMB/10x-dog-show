import React, { useState, useEffect } from "react";
import type {
  DogClass,
  RegistrationResponseDto,
  UpdateRegistrationDto,
} from "../../types";

interface EditDogModalProps {
  showId: string;
  registration: RegistrationResponseDto;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isProcessing: boolean;
}

interface EditFormData {
  dog_class: string;
  name: string;
  kennel_name: string;
  father_name: string;
  mother_name: string;
  grade?: string;
  baby_puppy_grade?: string;
  club_title?: string;
  placement?: string;
}

type ValidationErrors = Record<string, string[]>;

const EditDogModal: React.FC<EditDogModalProps> = ({
  showId,
  registration,
  isOpen,
  onClose,
  onSuccess,
  isProcessing,
}) => {
  const [formData, setFormData] = useState<EditFormData>({
    dog_class: registration.dog_class,
    name: registration.dog.name,
    kennel_name: registration.dog.kennel_name || "",
    father_name: registration.dog.father_name || "",
    mother_name: registration.dog.mother_name || "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [evaluationId, setEvaluationId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        dog_class: registration.dog_class,
        name: registration.dog.name,
        kennel_name: registration.dog.kennel_name || "",
        father_name: registration.dog.father_name || "",
        mother_name: registration.dog.mother_name || "",
      });
      setErrors({});

      // Load existing evaluation for this dog at this show
      (async () => {
        try {
          const res = await fetch(
            `/api/shows/${showId}/evaluations?limit=1000&page=1`,
          );
          if (res.ok) {
            const data = await res.json();
            const list: Array<{
              id: string;
              dog?: { id?: string };
              grade?: string;
              baby_puppy_grade?: string;
              club_title?: string;
              placement?: string;
            }> = (data.data || data.evaluations || []) as Array<{
              id: string;
              dog?: { id?: string };
              grade?: string;
              baby_puppy_grade?: string;
              club_title?: string;
              placement?: string;
            }>;
            const evalItem = list.find(
              (e) => e.dog?.id === registration.dog.id,
            );
            if (evalItem) {
              setEvaluationId(evalItem.id);
              setFormData((prev) => ({
                ...prev,
                grade: evalItem.grade || undefined,
                baby_puppy_grade: evalItem.baby_puppy_grade || undefined,
                club_title: evalItem.club_title || undefined,
                placement: evalItem.placement || undefined,
              }));
            } else {
              setEvaluationId(null);
              setFormData((prev) => ({
                ...prev,
                grade: undefined,
                baby_puppy_grade: undefined,
                club_title: undefined,
                placement: undefined,
              }));
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) {
          // ignore
        }
      })();
    }
  }, [isOpen, registration, showId]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.dog_class) {
      newErrors.dog_class = ["Klasa psa jest wymagana"];
    }

    if (!formData.name.trim()) {
      newErrors.name = ["Nazwa psa jest wymagana"];
    }

    if (!formData.kennel_name.trim()) {
      newErrors.kennel_name = ["Nazwa hodowli jest wymagana"];
    }

    // Validation for kennel name
    if (!formData.kennel_name.trim()) {
      newErrors.kennel_name = ["Nazwa hodowli jest wymagana"];
    }

    // Evaluation fields validation
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
    } else {
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

  const handleFieldChange = (
    field: keyof EditFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // 1) Update dog base data
      const dogUpdatePayload: Record<string, unknown> = {
        name: formData.name,
        kennel_name: formData.kennel_name,
        father_name: formData.father_name || undefined,
        mother_name: formData.mother_name || undefined,
      };
      await fetch(`/api/dogs/${registration.dog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dogUpdatePayload),
      });

      // 2) Update registration (class)
      const regUpdatePayload: UpdateRegistrationDto = {
        dog_class: formData.dog_class as DogClass,
      };
      await fetch(`/api/shows/${showId}/registrations/${registration.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regUpdatePayload),
      });

      // 3) Create or update evaluation
      const evalPayload: Record<string, unknown> = {
        dog_class: formData.dog_class,
        club_title: formData.club_title || undefined,
        placement: formData.placement || undefined,
      };
      if (formData.dog_class === "baby" || formData.dog_class === "puppy") {
        evalPayload["baby_puppy_grade"] = formData.baby_puppy_grade;
      } else {
        evalPayload["grade"] = formData.grade;
      }

      if (evaluationId) {
        await fetch(`/api/shows/${showId}/evaluations/${evaluationId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(evalPayload),
        });
      } else {
        await fetch(`/api/shows/${showId}/evaluations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dog_id: registration.dog.id,
            ...evalPayload,
          }),
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error updating registration:", error);
      setErrors({ submit: ["Błąd podczas aktualizacji psa"] });
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const getGenderIcon = (gender: string): string => {
    return gender === "male" ? "♂️" : "♀️";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pl-PL");
  };

  const dogClasses = [
    { value: "baby", label: "Baby" },
    { value: "puppy", label: "Szczenię" },
    { value: "junior", label: "Junior" },
    { value: "intermediate", label: "Młodzież" },
    { value: "open", label: "Otwarta" },
    { value: "working", label: "Pracująca" },
    { value: "champion", label: "Champion" },
    { value: "veteran", label: "Weteran" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Edytuj psa</h2>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{errors.submit[0]}</p>
            </div>
          )}

          {/* Dog Information Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Dane psa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nazwa:</span>
                <p className="text-gray-900">
                  {registration.dog.name}{" "}
                  {getGenderIcon(registration.dog.gender)}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Płeć:</span>
                <p className="text-gray-900">
                  {registration.dog.gender === "male" ? "Samiec" : "Suka"}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Data urodzenia:
                </span>
                <p className="text-gray-900">
                  {formatDate(registration.dog.birth_date)}
                </p>
              </div>
              {/* Numer katalogowy usunięty z widoku */}
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="dog_class"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Klasa psa *
              </label>
              <select
                id="dog_class"
                value={formData.dog_class}
                onChange={(e) => handleFieldChange("dog_class", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dog_class ? "border-red-300" : "border-gray-300"
                }`}
              >
                {dogClasses.map((dogClass) => (
                  <option key={dogClass.value} value={dogClass.value}>
                    {dogClass.label}
                  </option>
                ))}
              </select>
              {errors.dog_class && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.dog_class[0]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nazwa psa *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name[0]}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="kennel_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nazwa hodowli *
                </label>
                <input
                  id="kennel_name"
                  type="text"
                  value={formData.kennel_name}
                  onChange={(e) =>
                    handleFieldChange("kennel_name", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.kennel_name ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.kennel_name && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.kennel_name[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="father_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Imię ojca
                </label>
                <input
                  id="father_name"
                  type="text"
                  value={formData.father_name}
                  onChange={(e) =>
                    handleFieldChange("father_name", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              </div>

              <div>
                <label
                  htmlFor="mother_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Imię matki
                </label>
                <input
                  id="mother_name"
                  type="text"
                  value={formData.mother_name}
                  onChange={(e) =>
                    handleFieldChange("mother_name", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              </div>
            </div>

            {/* Numer katalogowy usunięty z formularza */}

            {/* Evaluation fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(formData.dog_class === "baby" ||
                formData.dog_class === "puppy") && (
                <div>
                  <label
                    htmlFor="baby_puppy_grade"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Ocena (baby/puppy) *
                  </label>
                  <select
                    id="baby_puppy_grade"
                    value={formData.baby_puppy_grade || ""}
                    onChange={(e) =>
                      handleFieldChange("baby_puppy_grade", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.baby_puppy_grade
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
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

              {formData.dog_class !== "baby" &&
                formData.dog_class !== "puppy" && (
                  <div>
                    <label
                      htmlFor="grade"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Ocena *
                    </label>
                    <select
                      id="grade"
                      value={formData.grade || ""}
                      onChange={(e) =>
                        handleFieldChange("grade", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.grade ? "border-red-300" : "border-gray-300"
                      }`}
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

              <div>
                <label
                  htmlFor="club_title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tytuł klubowy
                </label>
                <select
                  id="club_title"
                  value={formData.club_title || ""}
                  onChange={(e) =>
                    handleFieldChange("club_title", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
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
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Lokata
                </label>
                <select
                  id="placement"
                  value={formData.placement || ""}
                  onChange={(e) =>
                    handleFieldChange("placement", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
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

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? "Zapisywanie..." : "Zapisz zmiany"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDogModal;
