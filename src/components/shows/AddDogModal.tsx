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
      setErrors({ breeds: ["Błąd ładowania ras"] });
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
    }
    if (!dogData.microchip_number.trim()) {
      newErrors.microchip_number = ["Numer chipa jest wymagany"];
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
      newErrors.owner_email = ["Email właściciela jest wymagany"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerData.email)) {
      newErrors.owner_email = ["Nieprawidłowy format email"];
    }
    if (!ownerData.address.trim()) {
      newErrors.owner_address = ["Adres właściciela jest wymagany"];
    }
    if (!ownerData.city.trim()) {
      newErrors.owner_city = ["Miasto właściciela jest wymagane"];
    }
    if (!ownerData.gdpr_consent) {
      newErrors.owner_gdpr_consent = ["Zgoda GDPR jest wymagana"];
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

    try {
      const registrationData: CreateRegistrationDto = {
        dog: {
          name: dogData.name,
          breed_id: dogData.breed_id,
          gender: dogData.gender,
          birth_date: dogData.birth_date,
          microchip_number: dogData.microchip_number,
          kennel_club_number: dogData.kennel_club_number || null,
          kennel_name: dogData.kennel_name || null,
          father_name: dogData.father_name || null,
          mother_name: dogData.mother_name || null,
        },
        owner: {
          first_name: ownerData.first_name,
          last_name: ownerData.last_name,
          email: ownerData.email,
          phone: ownerData.phone || null,
          address: ownerData.address,
          city: ownerData.city,
          postal_code: ownerData.postal_code || null,
          country: ownerData.country,
          kennel_name: ownerData.kennel_name || null,
          gdpr_consent: ownerData.gdpr_consent,
        },
        registration: {
          dog_class: dogData.dog_class as DogClass,
        },
      };

      await onAddDog(registrationData);
      onSuccess();
    } catch (error) {
      console.error("Error adding dog:", error);
      setErrors({ submit: ["Błąd podczas dodawania psa"] });
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
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
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

                <div>
                  <label
                    htmlFor="breed"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Rasa *
                  </label>
                  <select
                    id="breed"
                    value={dogData.breed_id}
                    onChange={(e) =>
                      handleDogDataChange("breed_id", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Płeć *
                    </label>
                    <select
                      id="gender"
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
                    htmlFor="microchip"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Numer chipa *
                  </label>
                  <input
                    type="text"
                    id="microchip"
                    value={dogData.microchip_number}
                    onChange={(e) =>
                      handleDogDataChange("microchip_number", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="15-cyfrowy numer chipa"
                  />
                  {errors.microchip_number && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.microchip_number[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="dog-class"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Klasa psa *
                  </label>
                  <select
                    id="dog-class"
                    value={dogData.dog_class}
                    onChange={(e) =>
                      handleDogDataChange("dog_class", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Wybierz klasę</option>
                    <option value="baby">Baby</option>
                    <option value="puppy">Szczenię</option>
                    <option value="junior">Junior</option>
                    <option value="intermediate">Młodzież</option>
                    <option value="open">Otwarta</option>
                    <option value="working">Pracująca</option>
                    <option value="champion">Champion</option>
                    <option value="veteran">Weteran</option>
                  </select>
                  {errors.dog_class && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.dog_class[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="kennel-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nazwa hodowli
                  </label>
                  <input
                    type="text"
                    id="kennel-name"
                    value={dogData.kennel_name}
                    onChange={(e) =>
                      handleDogDataChange("kennel_name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nazwa hodowli"
                  />
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
                      value={dogData.father_name}
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
                      value={dogData.mother_name}
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
                    value={ownerData.phone}
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
                    Adres *
                  </label>
                  <input
                    type="text"
                    id="owner-address"
                    value={ownerData.address}
                    onChange={(e) =>
                      handleOwnerDataChange("address", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ul. Przykładowa 1"
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
                      htmlFor="owner-city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Miasto *
                    </label>
                    <input
                      type="text"
                      id="owner-city"
                      value={ownerData.city}
                      onChange={(e) =>
                        handleOwnerDataChange("city", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Warszawa"
                    />
                    {errors.owner_city && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.owner_city[0]}
                      </p>
                    )}
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
                      value={ownerData.postal_code}
                      onChange={(e) =>
                        handleOwnerDataChange("postal_code", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="00-000"
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
                    value={ownerData.kennel_name}
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
                    Wyrażam zgodę na przetwarzanie danych osobowych zgodnie z
                    RODO *
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
              disabled={isProcessing}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
