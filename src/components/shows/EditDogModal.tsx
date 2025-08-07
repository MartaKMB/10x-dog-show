import React, { useState, useEffect } from "react";
import type {
  DogClass,
  RegistrationResponseDto,
  UpdateRegistrationDto,
} from "../../types";

interface EditDogModalProps {
  registration: RegistrationResponseDto;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isProcessing: boolean;
  onEditDog: (
    registrationId: string,
    data: UpdateRegistrationDto,
  ) => Promise<void>;
}

interface EditFormData {
  dog_class: string;
  name: string;
  kennel_name: string;
  father_name: string;
  mother_name: string;
}

type ValidationErrors = Record<string, string[]>;

const EditDogModal: React.FC<EditDogModalProps> = ({
  registration,
  isOpen,
  onClose,
  onSuccess,
  isProcessing,
  onEditDog,
}) => {
  const [formData, setFormData] = useState<EditFormData>({
    dog_class: registration.dog_class,
    name: registration.dog.name,
    kennel_name: registration.dog.kennel_name || "",
    father_name: registration.dog.father_name || "",
    mother_name: registration.dog.mother_name || "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

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
    }
  }, [isOpen, registration]);

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
      const updateData: UpdateRegistrationDto = {
        dog_class: formData.dog_class as DogClass,
      };

      await onEditDog(registration.id, updateData);
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
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
              <div>
                <span className="font-medium text-gray-700">
                  Nr katalogowy:
                </span>
                <p className="text-gray-900">
                  {registration.catalog_number || "Nie przypisano"}
                </p>
              </div>
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
