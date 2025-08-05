import React, { useState, useEffect } from "react";
import type {
  OwnerResponseDto,
  CreateOwnerDto,
  UpdateOwnerDto,
} from "../../types";
import { Button } from "../ui/button";

interface OwnerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOwnerDto | UpdateOwnerDto) => Promise<void> | void;
  owner?: OwnerResponseDto | null;
  isLoading: boolean;
  error: string | null;
  isEdit: boolean;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  kennel_name: string;
  gdpr_consent: boolean;
}

type ValidationErrors = Record<string, string[]>;

const OwnerForm: React.FC<OwnerFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  owner,
  isLoading,
  error,
  isEdit,
}) => {
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    country: "Polska",
    kennel_name: "",
    gdpr_consent: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  // Reset form when modal opens/closes or owner changes
  useEffect(() => {
    if (isOpen) {
      if (isEdit && owner) {
        setFormData({
          first_name: owner.first_name,
          last_name: owner.last_name,
          email: owner.email,
          phone: owner.phone || "",
          address: owner.address,
          city: owner.city,
          postal_code: owner.postal_code || "",
          country: owner.country,
          kennel_name: owner.kennel_name || "",
          gdpr_consent: owner.gdpr_consent,
        });
      } else {
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          postal_code: "",
          country: "Polska",
          kennel_name: "",
          gdpr_consent: false,
        });
      }
      setErrors({});
    }
  }, [isOpen, isEdit, owner]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = ["Imię jest wymagane"];
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = ["Imię musi mieć co najmniej 2 znaki"];
    } else if (formData.first_name.trim().length > 50) {
      newErrors.first_name = ["Imię nie może przekraczać 50 znaków"];
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = ["Nazwisko jest wymagane"];
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = ["Nazwisko musi mieć co najmniej 2 znaki"];
    } else if (formData.last_name.trim().length > 50) {
      newErrors.last_name = ["Nazwisko nie może przekraczać 50 znaków"];
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = ["Email jest wymagany"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = ["Nieprawidłowy format email"];
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = ["Adres jest wymagany"];
    } else if (formData.address.trim().length < 5) {
      newErrors.address = ["Adres musi mieć co najmniej 5 znaków"];
    } else if (formData.address.trim().length > 200) {
      newErrors.address = ["Adres nie może przekraczać 200 znaków"];
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = ["Miasto jest wymagane"];
    } else if (formData.city.trim().length < 2) {
      newErrors.city = ["Miasto musi mieć co najmniej 2 znaki"];
    } else if (formData.city.trim().length > 50) {
      newErrors.city = ["Miasto nie może przekraczać 50 znaków"];
    }

    // Country validation
    if (!formData.country.trim()) {
      newErrors.country = ["Kraj jest wymagany"];
    }

    // GDPR consent validation (only for new owners)
    if (!isEdit && !formData.gdpr_consent) {
      newErrors.gdpr_consent = ["Zgoda RODO jest wymagana"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (
    field: keyof FormData,
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

    const submitData = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      address: formData.address.trim(),
      city: formData.city.trim(),
      postal_code: formData.postal_code.trim() || undefined,
      country: formData.country.trim(),
      kennel_name: formData.kennel_name.trim() || undefined,
      language: "pl" as const,
      gdpr_consent: formData.gdpr_consent,
    };

    await onSubmit(submitData);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Edytuj właściciela" : "Dodaj właściciela"}
            </h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Imię *
              </label>
              <input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  handleFieldChange("first_name", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.first_name ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.first_name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.first_name[0]}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nazwisko *
              </label>
              <input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => handleFieldChange("last_name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.last_name ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.last_name && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.last_name[0]}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email[0]}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Telefon
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Kennel Name */}
            <div>
              <label
                htmlFor="kennel_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nazwa hodowli
              </label>
              <input
                id="kennel_name"
                type="text"
                value={formData.kennel_name}
                onChange={(e) =>
                  handleFieldChange("kennel_name", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Adres *
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">{errors.address[0]}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Miasto *
              </label>
              <input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => handleFieldChange("city", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.city ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.city && (
                <p className="text-red-600 text-sm mt-1">{errors.city[0]}</p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label
                htmlFor="postal_code"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kod pocztowy
              </label>
              <input
                id="postal_code"
                type="text"
                value={formData.postal_code}
                onChange={(e) =>
                  handleFieldChange("postal_code", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Country */}
            <div className="md:col-span-2">
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kraj *
              </label>
              <input
                id="country"
                type="text"
                value={formData.country}
                onChange={(e) => handleFieldChange("country", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.country ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.country && (
                <p className="text-red-600 text-sm mt-1">{errors.country[0]}</p>
              )}
            </div>

            {/* GDPR Consent */}
            {!isEdit && (
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="gdpr_consent"
                    checked={formData.gdpr_consent}
                    onChange={(e) =>
                      handleFieldChange("gdpr_consent", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="gdpr_consent"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Wyrażam zgodę na przetwarzanie danych osobowych zgodnie z
                    RODO *
                  </label>
                </div>
                {errors.gdpr_consent && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.gdpr_consent[0]}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              variant="outline"
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Zapisywanie..."
                : isEdit
                  ? "Zapisz zmiany"
                  : "Dodaj właściciela"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerForm;
