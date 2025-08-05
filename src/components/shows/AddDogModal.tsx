import React, { useState, useEffect } from "react";
import type {
  CreateRegistrationDto,
  BreedResponseDto,
  DogClass,
} from "../../types";

interface AddDogModalProps {
  showId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isProcessing: boolean;
  onAddDog: (data: CreateRegistrationDto) => Promise<void>;
}

interface DogFormData {
  name: string;
  breed_id: string;
  gender: "male" | "female";
  birth_date: string;
  microchip_number: string;
  kennel_club_number: string;
  kennel_name: string;
  father_name: string;
  mother_name: string;
  dog_class: string;
  registration_fee: string;
}

interface OwnerFormData {
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

const AddDogModal: React.FC<AddDogModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isProcessing,
  onAddDog,
}) => {
  const [breeds, setBreeds] = useState<BreedResponseDto[]>([]);
  const [dogData, setDogData] = useState<DogFormData>({
    name: "",
    breed_id: "",
    gender: "male",
    birth_date: "",
    microchip_number: "",
    kennel_club_number: "",
    kennel_name: "",
    father_name: "",
    mother_name: "",
    dog_class: "",
    registration_fee: "",
  });

  const [ownerData, setOwnerData] = useState<OwnerFormData>({
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
  const [isLoadingBreeds, setIsLoadingBreeds] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBreeds();
    }
  }, [isOpen]);

  const loadBreeds = async () => {
    try {
      setIsLoadingBreeds(true);
      const response = await fetch("/api/breeds?is_active=true");
      if (!response.ok) {
        throw new Error("Błąd ładowania ras");
      }
      const breedsData = await response.json();
      setBreeds(breedsData.data || breedsData);
    } catch (error) {
      console.error("Error loading breeds:", error);
      setErrors({ breeds: ["Nie udało się załadować listy ras"] });
    } finally {
      setIsLoadingBreeds(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Dog validation
    if (!dogData.name.trim()) {
      newErrors.name = ["Nazwa psa jest wymagana"];
    }

    if (!dogData.breed_id) {
      newErrors.breed_id = ["Rasa jest wymagana"];
    }

    if (!dogData.birth_date) {
      newErrors.birth_date = ["Data urodzenia jest wymagana"];
    } else {
      const birthDate = new Date(dogData.birth_date);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birth_date = ["Data urodzenia nie może być w przyszłości"];
      }
      if (today.getFullYear() - birthDate.getFullYear() > 20) {
        newErrors.birth_date = ["Pies nie może być starszy niż 20 lat"];
      }
    }

    if (!dogData.microchip_number.trim()) {
      newErrors.microchip_number = ["Numer microchip jest wymagany"];
    } else if (!/^\d{15}$/.test(dogData.microchip_number)) {
      newErrors.microchip_number = [
        "Numer microchip musi mieć dokładnie 15 cyfr",
      ];
    }

    if (!dogData.dog_class) {
      newErrors.dog_class = ["Klasa psa jest wymagana"];
    }

    // Owner validation
    if (!ownerData.first_name.trim()) {
      newErrors.owner_first_name = ["Imię właściciela jest wymagane"];
    }

    if (!ownerData.last_name.trim()) {
      newErrors.owner_last_name = ["Nazwisko właściciela jest wymagane"];
    }

    if (!ownerData.email.trim()) {
      newErrors.owner_email = ["Email jest wymagany"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerData.email)) {
      newErrors.owner_email = ["Nieprawidłowy format email"];
    }

    if (!ownerData.address.trim()) {
      newErrors.owner_address = ["Adres jest wymagany"];
    }

    if (!ownerData.city.trim()) {
      newErrors.owner_city = ["Miasto jest wymagane"];
    }

    if (!ownerData.gdpr_consent) {
      newErrors.owner_gdpr_consent = ["Zgoda RODO jest wymagana"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDogDataChange = (field: keyof DogFormData, value: string) => {
    setDogData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: [] }));
    }
  };

  const handleOwnerDataChange = (
    field: keyof OwnerFormData,
    value: string | boolean,
  ) => {
    setOwnerData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[`owner_${field}`]) {
      setErrors((prev) => ({ ...prev, [`owner_${field}`]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // First, create or find owner
      const ownerResponse = await fetch("/api/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: ownerData.first_name,
          last_name: ownerData.last_name,
          email: ownerData.email,
          phone: ownerData.phone || undefined,
          address: ownerData.address,
          city: ownerData.city,
          postal_code: ownerData.postal_code || undefined,
          country: ownerData.country,
          kennel_name: ownerData.kennel_name || undefined,
          language: "pl",
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

      // Then, create dog
      const dogResponse = await fetch("/api/dogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dogData.name,
          breed_id: dogData.breed_id,
          gender: dogData.gender,
          birth_date: dogData.birth_date,
          microchip_number: dogData.microchip_number,
          kennel_club_number: dogData.kennel_club_number || undefined,
          kennel_name: dogData.kennel_name || undefined,
          father_name: dogData.father_name || undefined,
          mother_name: dogData.mother_name || undefined,
          owners: [{ id: owner.id, is_primary: true }],
        }),
      });

      if (!dogResponse.ok) {
        const errorData = await dogResponse.json();
        throw new Error(errorData.error?.message || "Błąd tworzenia psa");
      }

      const dog = await dogResponse.json();

      // Finally, create registration
      const registrationData: CreateRegistrationDto = {
        dog_id: dog.id,
        dog_class: dogData.dog_class as DogClass,
        registration_fee: dogData.registration_fee
          ? parseFloat(dogData.registration_fee)
          : undefined,
      };

      await onAddDog(registrationData);
      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Error adding dog:", error);
      setErrors({
        submit: [error instanceof Error ? error.message : "Nieznany błąd"],
      });
    }
  };

  const resetForm = () => {
    setDogData({
      name: "",
      breed_id: "",
      gender: "male",
      birth_date: "",
      microchip_number: "",
      kennel_club_number: "",
      kennel_name: "",
      father_name: "",
      mother_name: "",
      dog_class: "",
      registration_fee: "",
    });
    setOwnerData({
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
    setErrors({});
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetForm();
      onClose();
    }
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Dodaj psa do wystawy
            </h2>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Dog Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dane psa
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="dogName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nazwa psa *
                  </label>
                  <input
                    id="dogName"
                    type="text"
                    value={dogData.name}
                    onChange={(e) =>
                      handleDogDataChange("name", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.name[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="breedSelect"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Rasa *
                  </label>
                  <select
                    id="breedSelect"
                    value={dogData.breed_id}
                    onChange={(e) =>
                      handleDogDataChange("breed_id", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.breed_id ? "border-red-300" : "border-gray-300"
                    }`}
                    disabled={isLoadingBreeds}
                  >
                    <option value="">Wybierz rasę</option>
                    {breeds.map((breed) => (
                      <option key={breed.id} value={breed.id}>
                        {breed.name_pl}
                      </option>
                    ))}
                  </select>
                  {errors.breed_id && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.breed_id[0]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="genderSelect"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Płeć *
                    </label>
                    <select
                      id="genderSelect"
                      value={dogData.gender}
                      onChange={(e) =>
                        handleDogDataChange("gender", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="male">Samiec</option>
                      <option value="female">Suka</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="birthDateInput"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Data urodzenia *
                    </label>
                    <input
                      id="birthDateInput"
                      type="date"
                      value={dogData.birth_date}
                      onChange={(e) =>
                        handleDogDataChange("birth_date", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.birth_date ? "border-red-300" : "border-gray-300"
                      }`}
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
                    htmlFor="microchipInput"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Numer microchip *
                  </label>
                  <input
                    id="microchipInput"
                    type="text"
                    value={dogData.microchip_number}
                    onChange={(e) =>
                      handleDogDataChange("microchip_number", e.target.value)
                    }
                    placeholder="15 cyfr"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.microchip_number
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.microchip_number && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.microchip_number[0]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="dogClassSelect"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Klasa psa *
                    </label>
                    <select
                      id="dogClassSelect"
                      value={dogData.dog_class}
                      onChange={(e) =>
                        handleDogDataChange("dog_class", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.dog_class ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Wybierz klasę</option>
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
                  <div>
                    <label
                      htmlFor="registrationFee"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Opłata wpisowa (PLN)
                    </label>
                    <input
                      id="registrationFee"
                      type="number"
                      value={dogData.registration_fee}
                      onChange={(e) =>
                        handleDogDataChange("registration_fee", e.target.value)
                      }
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="kennelName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nazwa hodowli
                    </label>
                    <input
                      id="kennelName"
                      type="text"
                      value={dogData.kennel_name}
                      onChange={(e) =>
                        handleDogDataChange("kennel_name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="kennelClubNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nr ZKwP
                    </label>
                    <input
                      id="kennelClubNumber"
                      type="text"
                      value={dogData.kennel_club_number}
                      onChange={(e) =>
                        handleDogDataChange(
                          "kennel_club_number",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="fatherName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Ojciec
                    </label>
                    <input
                      id="fatherName"
                      type="text"
                      value={dogData.father_name}
                      onChange={(e) =>
                        handleDogDataChange("father_name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="motherName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Matka
                    </label>
                    <input
                      id="motherName"
                      type="text"
                      value={dogData.mother_name}
                      onChange={(e) =>
                        handleDogDataChange("mother_name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      htmlFor="ownerFirstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Imię *
                    </label>
                    <input
                      id="ownerFirstName"
                      type="text"
                      value={ownerData.first_name}
                      onChange={(e) =>
                        handleOwnerDataChange("first_name", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.owner_first_name
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.owner_first_name && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.owner_first_name[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="ownerLastName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nazwisko *
                    </label>
                    <input
                      id="ownerLastName"
                      type="text"
                      value={ownerData.last_name}
                      onChange={(e) =>
                        handleOwnerDataChange("last_name", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.owner_last_name
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
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
                    htmlFor="ownerEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email *
                  </label>
                  <input
                    id="ownerEmail"
                    type="email"
                    value={ownerData.email}
                    onChange={(e) =>
                      handleOwnerDataChange("email", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.owner_email ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.owner_email && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.owner_email[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="ownerPhone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Telefon
                  </label>
                  <input
                    id="ownerPhone"
                    type="tel"
                    value={ownerData.phone}
                    onChange={(e) =>
                      handleOwnerDataChange("phone", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ownerAddress"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Adres *
                  </label>
                  <input
                    id="ownerAddress"
                    type="text"
                    value={ownerData.address}
                    onChange={(e) =>
                      handleOwnerDataChange("address", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.owner_address
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.owner_address && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.owner_address[0]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="ownerCity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Miasto *
                    </label>
                    <input
                      id="ownerCity"
                      type="text"
                      value={ownerData.city}
                      onChange={(e) =>
                        handleOwnerDataChange("city", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.owner_city ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.owner_city && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.owner_city[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="ownerPostalCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Kod pocztowy
                    </label>
                    <input
                      id="ownerPostalCode"
                      type="text"
                      value={ownerData.postal_code}
                      onChange={(e) =>
                        handleOwnerDataChange("postal_code", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="ownerCountry"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Kraj
                  </label>
                  <input
                    id="ownerCountry"
                    type="text"
                    value={ownerData.country}
                    onChange={(e) =>
                      handleOwnerDataChange("country", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="ownerKennelName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nazwa hodowli
                  </label>
                  <input
                    id="ownerKennelName"
                    type="text"
                    value={ownerData.kennel_name}
                    onChange={(e) =>
                      handleOwnerDataChange("kennel_name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="gdpr_consent"
                    checked={ownerData.gdpr_consent}
                    onChange={(e) =>
                      handleOwnerDataChange("gdpr_consent", e.target.checked)
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
                {errors.owner_gdpr_consent && (
                  <p className="text-red-600 text-sm">
                    {errors.owner_gdpr_consent[0]}
                  </p>
                )}
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
              {isProcessing ? "Dodawanie..." : "Dodaj psa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDogModal;
