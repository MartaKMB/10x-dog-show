import React, { useState, useEffect } from "react";
import type { CreateShowDto } from "../../types";
import { useShowCreator } from "../../hooks/useShowCreator";
import LoadingSpinner from "./LoadingSpinner";
import ErrorDisplay from "./ErrorDisplay";

type ShowCreatorProps = object;

interface ShowCreatorStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
}

interface ShowCreatorData {
  // Step 1: Basic Information
  name: string;
  showType: "national" | "international";
  showDate: string;
  registrationDeadline: string;
  language: "pl" | "en";

  // Step 2: Venue
  venueId: string;

  // Step 3: Registration Settings
  maxParticipants: number | null;
  entryFee: number | null;

  // Step 4: Description
  description: string;
}

const ShowCreator: React.FC<ShowCreatorProps> = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ShowCreatorData>({
    name: "",
    showType: "national",
    showDate: "",
    registrationDeadline: "",
    language: "pl",
    venueId: "",
    maxParticipants: null,
    entryFee: null,
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { venues, isLoading, error, loadVenues, createShow } = useShowCreator();

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  function isStepCompleted(step: number): boolean {
    switch (step) {
      case 1:
        return !!(
          formData.name &&
          formData.showType &&
          formData.showDate &&
          formData.registrationDeadline
        );
      case 2:
        return !!formData.venueId;
      case 3:
        return true; // Optional fields
      case 4:
        return true; // Optional field
      default:
        return false;
    }
  }

  const steps: ShowCreatorStep[] = [
    {
      id: 1,
      title: "Podstawowe informacje",
      description: "Nazwa, typ i daty wystawy",
      isCompleted: isStepCompleted(1),
    },
    {
      id: 2,
      title: "Lokalizacja",
      description: "Wybór obiektu",
      isCompleted: isStepCompleted(2),
    },
    {
      id: 3,
      title: "Ustawienia rejestracji",
      description: "Limity i opłaty",
      isCompleted: isStepCompleted(3),
    },
    {
      id: 4,
      title: "Opis",
      description: "Dodatkowe informacje",
      isCompleted: isStepCompleted(4),
    },
    {
      id: 5,
      title: "Podsumowanie",
      description: "Przegląd i publikacja",
      isCompleted: false,
    },
  ];

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = "Nazwa wystawy jest wymagana";
        }
        if (!formData.showDate) {
          newErrors.showDate = "Data wystawy jest wymagana";
        }
        if (!formData.registrationDeadline) {
          newErrors.registrationDeadline = "Termin rejestracji jest wymagany";
        }
        if (
          formData.registrationDeadline &&
          formData.showDate &&
          new Date(formData.registrationDeadline) >= new Date(formData.showDate)
        ) {
          newErrors.registrationDeadline =
            "Termin rejestracji musi być przed datą wystawy";
        }
        break;
      case 2:
        if (!formData.venueId) {
          newErrors.venueId = "Wybór obiektu jest wymagany";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      const showData: CreateShowDto = {
        name: formData.name,
        show_type: formData.showType,
        show_date: formData.showDate,
        registration_deadline: formData.registrationDeadline,
        venue_id: formData.venueId,
        max_participants: formData.maxParticipants || undefined,
        entry_fee: formData.entryFee || undefined,
        description: formData.description || undefined,
        language: formData.language,
      };

      const result = await createShow(showData);
      if (result.success) {
        // Redirect to show details
        window.location.href = `/shows/${result.showId}`;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error creating show:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof ShowCreatorData,
    value: string | number | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Ładowanie danych..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tworzenie nowej wystawy
        </h1>
        <p className="text-gray-600">
          Wypełnij poniższe kroki, aby utworzyć nową wystawę psów
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.id === currentStep
                    ? "border-blue-600 bg-blue-600 text-white"
                    : step.isCompleted
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {step.isCompleted ? "✓" : step.id}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-4 ${
                    step.isCompleted ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-6">
              Podstawowe informacje
            </h2>

            <div>
              <label
                htmlFor="show-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nazwa wystawy *
              </label>
              <input
                id="show-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="np. Narodowa Wystawa Psów Warszawa 2024"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="show-type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Typ wystawy *
                </label>
                <select
                  id="show-type"
                  value={formData.showType}
                  onChange={(e) =>
                    handleInputChange("showType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="national">Krajowa</option>
                  <option value="international">Międzynarodowa</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="show-language"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Język *
                </label>
                <select
                  id="show-language"
                  value={formData.language}
                  onChange={(e) =>
                    handleInputChange("language", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pl">Polski</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="show-date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Data wystawy *
                </label>
                <input
                  id="show-date"
                  type="date"
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

              <div>
                <label
                  htmlFor="registration-deadline"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Termin rejestracji *
                </label>
                <input
                  id="registration-deadline"
                  type="date"
                  value={formData.registrationDeadline}
                  onChange={(e) =>
                    handleInputChange("registrationDeadline", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.registrationDeadline
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.registrationDeadline && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.registrationDeadline}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-6">Wybór obiektu</h2>

            <div>
              <label
                htmlFor="venue-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Obiekt *
              </label>
              <select
                id="venue-select"
                value={formData.venueId}
                onChange={(e) => handleInputChange("venueId", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.venueId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Wybierz obiekt</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}, {venue.city}
                  </option>
                ))}
              </select>
              {errors.venueId && (
                <p className="mt-1 text-sm text-red-600">{errors.venueId}</p>
              )}
            </div>

            {formData.venueId && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-900 mb-2">
                  Szczegóły obiektu
                </h3>
                {(() => {
                  const venue = venues.find((v) => v.id === formData.venueId);
                  return venue ? (
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Adres:</strong> {venue.address}
                      </p>
                      <p>
                        <strong>Miasto:</strong> {venue.city}
                      </p>
                      <p>
                        <strong>Kod pocztowy:</strong>{" "}
                        {venue.postal_code || "Brak"}
                      </p>
                      <p>
                        <strong>Kraj:</strong> {venue.country}
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-6">
              Ustawienia rejestracji
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="max-participants"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Maksymalna liczba uczestników
                </label>
                <input
                  id="max-participants"
                  type="number"
                  value={formData.maxParticipants || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "maxParticipants",
                      e.target.value ? parseInt(e.target.value) : null,
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="np. 200"
                  min="1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Pozostaw puste, aby nie ustawiać limitu
                </p>
              </div>

              <div>
                <label
                  htmlFor="entry-fee"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Opłata wpisowa (PLN)
                </label>
                <input
                  id="entry-fee"
                  type="number"
                  step="0.01"
                  value={formData.entryFee || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "entryFee",
                      e.target.value ? parseFloat(e.target.value) : null,
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="np. 50.00"
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Pozostaw puste, aby nie ustawiać opłaty
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-6">Opis wystawy</h2>

            <div>
              <label
                htmlFor="show-description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Opis (opcjonalny)
              </label>
              <textarea
                id="show-description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dodatkowe informacje o wystawie, regulamin, szczegóły organizacyjne..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Możesz dodać opis później w ustawieniach wystawy
              </p>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-6">Podsumowanie</h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4">
                Szczegóły wystawy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Nazwa:</span> {formData.name}
                </div>
                <div>
                  <span className="font-medium">Typ:</span>{" "}
                  {formData.showType === "national"
                    ? "Krajowa"
                    : "Międzynarodowa"}
                </div>
                <div>
                  <span className="font-medium">Data wystawy:</span>{" "}
                  {new Date(formData.showDate).toLocaleDateString("pl-PL")}
                </div>
                <div>
                  <span className="font-medium">Termin rejestracji:</span>{" "}
                  {new Date(formData.registrationDeadline).toLocaleDateString(
                    "pl-PL",
                  )}
                </div>
                <div>
                  <span className="font-medium">Język:</span>{" "}
                  {formData.language === "pl" ? "Polski" : "English"}
                </div>
                <div>
                  <span className="font-medium">Obiekt:</span>{" "}
                  {(() => {
                    const venue = venues.find((v) => v.id === formData.venueId);
                    return venue ? `${venue.name}, ${venue.city}` : "";
                  })()}
                </div>
                {formData.maxParticipants && (
                  <div>
                    <span className="font-medium">Maks. uczestników:</span>{" "}
                    {formData.maxParticipants}
                  </div>
                )}
                {formData.entryFee && (
                  <div>
                    <span className="font-medium">Opłata wpisowa:</span>{" "}
                    {formData.entryFee} PLN
                  </div>
                )}
              </div>
              {formData.description && (
                <div className="mt-4">
                  <span className="font-medium">Opis:</span>
                  <p className="mt-1 text-gray-600">{formData.description}</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Informacja
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Po utworzeniu wystawa będzie miała status
                      &quot;Szkic&quot;. Możesz ją edytować i zmienić status na
                      &quot;Otwarta rejestracja&quot; w dowolnym momencie.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Wstecz
        </button>

        <div className="flex space-x-4">
          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Dalej
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Tworzenie..." : "Utwórz wystawę"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowCreator;
