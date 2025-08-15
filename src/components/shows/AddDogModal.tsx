import React, { useState, useEffect } from "react";
import type { DogGender } from "../../types";

interface AddDogModalProps {
  showId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (dogId: string, dogName: string) => void; // Zwracamy ID psa do następnego kroku
  isProcessing: boolean;
}

interface DogFormData {
  name: string;
  gender: DogGender;
  birth_date: string;
  coat: "czarny" | "czarny_podpalany" | "blond";
  microchip_number?: string;
  kennel_name?: string;
  father_name?: string;
  mother_name?: string;
}

interface OwnerFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  kennel_name?: string;
  gdpr_consent: boolean;
}

interface ExistingDog {
  id: string;
  name: string;
  gender: DogGender;
  birth_date: string;
  coat: string;
  kennel_name: string | null;
  owners?: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    kennel_name: string | null;
    is_primary: boolean;
  }>;
}

interface DogOwner {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  kennel_name: string | null;
  is_primary: boolean;
}

type ValidationErrors = Record<string, string[]>;

const AddDogModal: React.FC<AddDogModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [existingDogs, setExistingDogs] = useState<ExistingDog[]>([]);
  const [selectedDogId, setSelectedDogId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [dogData, setDogData] = useState<DogFormData>({
    name: "",
    gender: "male",
    birth_date: "",
    coat: "czarny",
    microchip_number: "",
    kennel_name: "",
    father_name: "",
    mother_name: "",
  });

  const [ownerData, setOwnerData] = useState<OwnerFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    kennel_name: "",
    gdpr_consent: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      if (mode === "existing") {
        loadExistingDogs();
      }
    }
  }, [isOpen, mode]);

  // Dodatkowy useEffect który reaguje na zmianę trybu
  useEffect(() => {
    if (isOpen && mode === "existing") {
      loadExistingDogs();
    }
  }, [mode, isOpen]);

  const loadExistingDogs = async () => {
    try {
      const response = await fetch("/api/dogs");
      if (response.ok) {
        const data = await response.json();
        setExistingDogs(data.data || []);
      } else {
        console.error("API error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Błąd ładowania psów:", error);
    }
  };

  const loadDogDetails = async (dogId: string) => {
    try {
      const response = await fetch(`/api/dogs/${dogId}`);
      if (response.ok) {
        const dog = await response.json();
        return dog;
      } else {
        console.error("API error:", response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error("Błąd ładowania szczegółów psa:", error);
      return null;
    }
  };

  const handleDogSelection = async (dogId: string) => {
    setSelectedDogId(dogId);

    // Pobierz szczegóły psa z właścicielami
    const dogDetails = await loadDogDetails(dogId);
    if (dogDetails && dogDetails.owners && dogDetails.owners.length > 0) {
      // Znajdź głównego właściciela (is_primary: true) lub pierwszego
      const primaryOwner =
        dogDetails.owners.find((owner: DogOwner) => owner.is_primary) ||
        dogDetails.owners[0];

      // Wypełnij dane właściciela
      if (primaryOwner) {
        // Rozdziel imię i nazwisko z pola name
        const nameParts = primaryOwner.name.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        setOwnerData({
          first_name: firstName,
          last_name: lastName,
          email: primaryOwner.email || "",
          phone: primaryOwner.phone || "",
          address: "", // Nie mamy tego w API
          city: "", // Nie mamy tego w API
          postal_code: "", // Nie mamy tego w API
          kennel_name: primaryOwner.kennel_name || "",
          gdpr_consent: true, // Zakładamy że skoro pies już istnieje
        });
      }
    }
  };

  const resetForm = () => {
    setDogData({
      name: "",
      gender: "male",
      birth_date: "",
      coat: "czarny",
      microchip_number: "",
      kennel_name: "",
      father_name: "",
      mother_name: "",
    });
    setOwnerData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postal_code: "",
      kennel_name: "",
      gdpr_consent: false,
    });
    setErrors({});
    setSuccessMessage("");
    setSelectedDogId("");
    setSearchQuery("");
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (mode === "new") {
      // Dog validation
      if (!dogData.name.trim()) {
        newErrors.name = ["Nazwa psa jest wymagana"];
      }
      if (!dogData.birth_date) {
        newErrors.birth_date = ["Data urodzenia jest wymagana"];
      }
      if (!dogData.kennel_name?.trim()) {
        newErrors.kennel_name = ["Nazwa hodowli jest wymagana"];
      }

      // Microchip validation (if provided)
      if (
        dogData.microchip_number &&
        !/^[0-9]{15}$/.test(dogData.microchip_number)
      ) {
        newErrors.microchip_number = [
          "Numer chipa musi mieć dokładnie 15 cyfr",
        ];
      }
    } else {
      // Existing dog validation
      if (!selectedDogId) {
        newErrors.existing_dog = ["Wybierz psa z listy"];
      }
    }

    // Owner validation (always required)
    if (!ownerData.first_name.trim()) {
      newErrors.owner_first_name = ["Imię właściciela jest wymagane"];
    }
    if (!ownerData.last_name.trim()) {
      newErrors.owner_last_name = ["Nazwisko właściciela jest wymagane"];
    }
    if (!ownerData.email.trim()) {
      newErrors.owner_email = ["Email właściciela jest wymagany"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerData.email)) {
      newErrors.owner_email = ["Nieprawidłowy format email"];
    }
    if (!ownerData.gdpr_consent) {
      newErrors.owner_gdpr_consent = ["Zgoda RODO jest wymagana"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDogDataChange = (field: keyof DogFormData, value: string) => {
    setDogData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: [] }));
    }
  };

  const handleOwnerDataChange = (
    field: keyof OwnerFormData,
    value: string | boolean,
  ) => {
    setOwnerData((prev) => ({ ...prev, [field]: value }));
    const errorKey = `owner_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let dogId: string;

      if (mode === "new") {
        // 1) Sprawdź czy właściciel już istnieje
        let ownerId: string | undefined;
        const existingOwnerResponse = await fetch(
          `/api/owners?email=${encodeURIComponent(ownerData.email)}`,
        );

        if (existingOwnerResponse.ok) {
          const existingOwners = await existingOwnerResponse.json();
          if (existingOwners.data && existingOwners.data.length > 0) {
            ownerId = existingOwners.data[0].id;
          }
        }

        // 2) Jeśli właściciel nie istnieje, utwórz nowego
        if (!ownerId) {
          const ownerResponse = await fetch("/api/owners", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              first_name: ownerData.first_name,
              last_name: ownerData.last_name,
              email: ownerData.email,
              phone: ownerData.phone?.trim() || null,
              address: ownerData.address?.trim() || null,
              city: ownerData.city?.trim() || null,
              postal_code: ownerData.postal_code?.trim() || null,
              kennel_name: ownerData.kennel_name?.trim() || null,
              gdpr_consent: ownerData.gdpr_consent,
            }),
          });

          if (!ownerResponse.ok) {
            const errorData = await ownerResponse.json();
            throw new Error(
              errorData.error?.message || "Błąd tworzenia właściciela",
            );
          }

          const owner = await ownerResponse.json();
          ownerId = owner.id;
        }

        // 3) Utwórz psa
        const dogResponse = await fetch("/api/dogs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: dogData.name,
            gender: dogData.gender,
            birth_date: dogData.birth_date,
            coat: dogData.coat,
            microchip_number: dogData.microchip_number?.trim() || null,
            kennel_name: dogData.kennel_name?.trim() || null,
            father_name: dogData.father_name?.trim() || null,
            mother_name: dogData.mother_name?.trim() || null,
            owners: [
              {
                id: ownerId,
                is_primary: true,
              },
            ],
          }),
        });

        if (!dogResponse.ok) {
          const errorData = await dogResponse.json();
          throw new Error(errorData.error?.message || "Błąd tworzenia psa");
        }

        const dog = await dogResponse.json();
        dogId = dog.id;
      } else {
        // Używamy istniejącego psa
        dogId = selectedDogId;
      }

      // Sukces - zwracamy ID psa do następnego kroku
      setSuccessMessage(
        mode === "new"
          ? `Pies "${dogData.name}" został pomyślnie utworzony!`
          : "Pies został wybrany!",
      );

      setTimeout(() => {
        // Przekaż ID psa i nazwę do następnego kroku
        const dogName =
          mode === "new"
            ? dogData.name
            : existingDogs.find((d) => d.id === selectedDogId)?.name || "Pies";
        onSuccess(dogId, dogName);
        resetForm();
      }, 1500);
    } catch (error) {
      setErrors({
        submit: [error instanceof Error ? error.message : "Błąd dodawania psa"],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const filteredDogs = existingDogs.filter(
    (dog) =>
      dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dog.kennel_name &&
        dog.kennel_name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Dodaj psa do systemu
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
            Utwórz nowego psa lub wybierz istniejącego. Następnie dodaj
            właściciela.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Mode Selection */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setMode("new")}
                className={`px-4 py-2 rounded-md transition-colors ${
                  mode === "new"
                    ? "bg-amber-500 text-gray-900"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Utwórz nowego psa
              </button>
              <button
                type="button"
                onClick={() => setMode("existing")}
                className={`px-4 py-2 rounded-md transition-colors ${
                  mode === "existing"
                    ? "bg-amber-500 text-gray-900"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Wybierz istniejącego psa
              </button>
            </div>
          </div>

          {mode === "new" ? (
            /* New Dog Form */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Dog Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Dane psa
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="dog-name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nazwa psa *
                    </label>
                    <input
                      type="text"
                      id="dog-name"
                      value={dogData.name}
                      onChange={(e) =>
                        handleDogDataChange("name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nazwa psa"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.name[0]}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="gender"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Płeć *
                      </label>
                      <select
                        id="gender"
                        value={dogData.gender}
                        onChange={(e) =>
                          handleDogDataChange(
                            "gender",
                            e.target.value as DogGender,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="male">Samiec</option>
                        <option value="female">Suka</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="birth-date"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Data urodzenia *
                      </label>
                      <input
                        type="date"
                        id="birth-date"
                        value={dogData.birth_date}
                        onChange={(e) =>
                          handleDogDataChange("birth_date", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.birth_date && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.birth_date[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="dog-coat"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Maść *
                    </label>
                    <select
                      id="dog-coat"
                      value={dogData.coat}
                      onChange={(e) =>
                        handleDogDataChange(
                          "coat",
                          e.target.value as
                            | "czarny"
                            | "czarny_podpalany"
                            | "blond",
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="czarny">Czarny</option>
                      <option value="czarny_podpalany">Czarny podpalany</option>
                      <option value="blond">Blond</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="microchip-number"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Numer chipa
                    </label>
                    <input
                      type="text"
                      id="microchip-number"
                      inputMode="numeric"
                      pattern="[0-9]{15}"
                      value={dogData.microchip_number || ""}
                      onChange={(e) =>
                        handleDogDataChange("microchip_number", e.target.value)
                      }
                      placeholder="15 cyfr (opcjonalnie)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.microchip_number && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.microchip_number[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="kennel-name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nazwa hodowli *
                    </label>
                    <input
                      type="text"
                      id="kennel-name"
                      value={dogData.kennel_name || ""}
                      onChange={(e) =>
                        handleDogDataChange("kennel_name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nazwa hodowli"
                    />
                    {errors.kennel_name && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.kennel_name[0]}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="father-name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Ojciec
                      </label>
                      <input
                        type="text"
                        id="father-name"
                        value={dogData.father_name || ""}
                        onChange={(e) =>
                          handleDogDataChange("father_name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Imię ojca"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="mother-name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Matka
                      </label>
                      <input
                        type="text"
                        id="mother-name"
                        value={dogData.mother_name || ""}
                        onChange={(e) =>
                          handleDogDataChange("mother_name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Imię matki"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Dane właściciela
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="owner-first-name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Imię *
                      </label>
                      <input
                        type="text"
                        id="owner-first-name"
                        value={ownerData.first_name}
                        onChange={(e) =>
                          handleOwnerDataChange("first_name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Imię"
                      />
                      {errors.owner_first_name && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.owner_first_name[0]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="owner-last-name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nazwisko *
                      </label>
                      <input
                        type="text"
                        id="owner-last-name"
                        value={ownerData.last_name}
                        onChange={(e) =>
                          handleOwnerDataChange("last_name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nazwisko"
                      />
                      {errors.owner_last_name && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.owner_last_name[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="owner-email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="owner-email"
                      value={ownerData.email}
                      onChange={(e) =>
                        handleOwnerDataChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email@example.com"
                    />
                    {errors.owner_email && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.owner_email[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="owner-phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="owner-phone"
                      value={ownerData.phone || ""}
                      onChange={(e) =>
                        handleOwnerDataChange("phone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+48 123 456 789"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="owner-address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Adres
                    </label>
                    <input
                      type="text"
                      id="owner-address"
                      value={ownerData.address || ""}
                      onChange={(e) =>
                        handleOwnerDataChange("address", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ul. Przykładowa 123"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="owner-city"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Miasto
                      </label>
                      <input
                        type="text"
                        id="owner-city"
                        value={ownerData.city || ""}
                        onChange={(e) =>
                          handleOwnerDataChange("city", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Warszawa"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="owner-postal-code"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Kod pocztowy
                      </label>
                      <input
                        type="text"
                        id="owner-postal-code"
                        value={ownerData.postal_code || ""}
                        onChange={(e) =>
                          handleOwnerDataChange("postal_code", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="00-001"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="owner-kennel-name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nazwa hodowli
                    </label>
                    <input
                      type="text"
                      id="owner-kennel-name"
                      value={ownerData.kennel_name || ""}
                      onChange={(e) =>
                        handleOwnerDataChange("kennel_name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nazwa hodowli"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="gdpr-consent"
                      checked={ownerData.gdpr_consent}
                      onChange={(e) =>
                        handleOwnerDataChange("gdpr_consent", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="gdpr-consent"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Właściciel udzielił zgody RODO *
                    </label>
                  </div>
                  {errors.owner_gdpr_consent && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.owner_gdpr_consent[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Existing Dog Selection */
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Wybierz istniejącego psa
              </h3>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Wyszukaj psa po nazwie lub hodowli..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                {filteredDogs.length === 0 ? (
                  <p className="p-4 text-gray-500 text-center">
                    {searchQuery
                      ? "Nie znaleziono psów"
                      : "Brak psów w systemie"}
                  </p>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredDogs.map((dog) => (
                      <button
                        key={dog.id}
                        className={`w-full text-left p-3 cursor-pointer hover:bg-gray-50 ${
                          selectedDogId === dog.id
                            ? "bg-amber-50 border-l-4 border-amber-500"
                            : ""
                        }`}
                        onClick={() => handleDogSelection(dog.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleDogSelection(dog.id);
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900">
                              {dog.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {dog.kennel_name} •{" "}
                              {dog.gender === "male" ? "Samiec" : "Suka"} •{" "}
                              {dog.coat}
                            </div>
                          </div>
                          {selectedDogId === dog.id && (
                            <div className="text-amber-600">✓</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {errors.existing_dog && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.existing_dog[0]}
                </p>
              )}

              {/* Owner Information for existing dog */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Dane właściciela
                </h3>

                {selectedDogId && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-blue-700 text-sm">
                      💡 Dane właściciela zostały automatycznie wypełnione na
                      podstawie wybranego psa. Możesz je edytować jeśli
                      potrzebujesz.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="owner-first-name-existing"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Imię *
                      </label>
                      <input
                        type="text"
                        id="owner-first-name-existing"
                        value={ownerData.first_name}
                        onChange={(e) =>
                          handleOwnerDataChange("first_name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Imię"
                      />
                      {errors.owner_first_name && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.owner_first_name[0]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="owner-last-name-existing"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nazwisko *
                      </label>
                      <input
                        type="text"
                        id="owner-last-name-existing"
                        value={ownerData.last_name}
                        onChange={(e) =>
                          handleOwnerDataChange("last_name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nazwisko"
                      />
                      {errors.owner_last_name && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.owner_last_name[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="owner-email-existing"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="owner-email-existing"
                      value={ownerData.email}
                      onChange={(e) =>
                        handleOwnerDataChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="email@example.com"
                    />
                    {errors.owner_email && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.owner_email[0]}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="gdpr-consent-existing"
                      checked={ownerData.gdpr_consent}
                      onChange={(e) =>
                        handleOwnerDataChange("gdpr_consent", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="gdpr-consent-existing"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Właściciel udzielił zgody RODO *
                    </label>
                  </div>
                  {errors.owner_gdpr_consent && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.owner_gdpr_consent[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

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
              {isSubmitting ? "Przetwarzanie..." : "Dalej"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDogModal;
