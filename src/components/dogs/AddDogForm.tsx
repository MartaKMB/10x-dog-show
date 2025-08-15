import { useState, useRef, useEffect } from "react";
import type { DogGender } from "../../types";

interface AddDogFormProps {
  onSuccess?: () => void;
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
  address?: string; // Dodaję brakujące pole, opcjonalne
  city?: string; // Dodaję brakujące pole, opcjonalne
  postal_code?: string; // Dodaję brakujące pole
  kennel_name?: string;
  gdpr_consent: boolean;
}

type ValidationErrors = Record<string, string[]>;

const AddDogForm: React.FC<AddDogFormProps> = ({ onSuccess }) => {
  // Refs for form fields to sync with browser autofill
  const formRef = useRef<HTMLFormElement>(null);

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
    address: undefined, // Dodaję brakujące pole
    city: undefined, // Dodaję brakujące pole
    postal_code: "", // Dodaję brakujące pole
    kennel_name: "",
    gdpr_consent: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Sync React state with HTML form values on component mount
  useEffect(() => {
    if (formRef.current) {
      const form = formRef.current;

      // Sync dog data
      const dogNameInput = form.querySelector("#dog-name") as HTMLInputElement;
      const dogKennelInput = form.querySelector(
        "#kennel-name",
      ) as HTMLInputElement;
      const dogBirthInput = form.querySelector(
        "#birth-date",
      ) as HTMLInputElement;
      const dogGenderSelect = form.querySelector(
        "#dog-gender",
      ) as HTMLSelectElement;
      const dogCoatSelect = form.querySelector(
        "#dog-coat",
      ) as HTMLSelectElement;
      const dogMicrochipInput = form.querySelector(
        "#microchip-number",
      ) as HTMLInputElement;
      const dogFatherInput = form.querySelector(
        "#father-name",
      ) as HTMLInputElement;
      const dogMotherInput = form.querySelector(
        "#mother-name",
      ) as HTMLInputElement;

      // Sync owner data
      const ownerFirstNameInput = form.querySelector(
        "#owner-first-name",
      ) as HTMLInputElement;
      const ownerLastNameInput = form.querySelector(
        "#owner-last-name",
      ) as HTMLInputElement;
      const ownerEmailInput = form.querySelector(
        "#owner-email",
      ) as HTMLInputElement;
      const ownerPhoneInput = form.querySelector(
        "#owner-phone",
      ) as HTMLInputElement;
      const ownerAddressInput = form.querySelector(
        "#owner-address",
      ) as HTMLInputElement;
      const ownerCityInput = form.querySelector(
        "#owner-city",
      ) as HTMLInputElement;
      const ownerPostalCodeInput = form.querySelector(
        "#owner-postal-code",
      ) as HTMLInputElement;
      const ownerKennelInput = form.querySelector(
        "#owner-kennel-name",
      ) as HTMLInputElement;

      // Update React state if HTML has values (from autofill)
      if (dogNameInput?.value)
        setDogData((prev) => ({ ...prev, name: dogNameInput.value }));
      if (dogKennelInput?.value)
        setDogData((prev) => ({ ...prev, kennel_name: dogKennelInput.value }));
      if (dogBirthInput?.value)
        setDogData((prev) => ({ ...prev, birth_date: dogBirthInput.value }));
      if (dogGenderSelect?.value)
        setDogData((prev) => ({
          ...prev,
          gender: dogGenderSelect.value as DogGender,
        }));
      if (dogCoatSelect?.value)
        setDogData((prev) => ({
          ...prev,
          coat: dogCoatSelect.value as "czarny" | "czarny_podpalany" | "blond",
        }));
      if (dogMicrochipInput?.value)
        setDogData((prev) => ({
          ...prev,
          microchip_number: dogMicrochipInput.value,
        }));
      if (dogFatherInput?.value)
        setDogData((prev) => ({ ...prev, father_name: dogFatherInput.value }));
      if (dogMotherInput?.value)
        setDogData((prev) => ({ ...prev, mother_name: dogMotherInput.value }));

      if (ownerFirstNameInput?.value)
        setOwnerData((prev) => ({
          ...prev,
          first_name: ownerFirstNameInput.value,
        }));
      if (ownerLastNameInput?.value)
        setOwnerData((prev) => ({
          ...prev,
          last_name: ownerLastNameInput.value,
        }));
      if (ownerEmailInput?.value)
        setOwnerData((prev) => ({ ...prev, email: ownerEmailInput.value }));
      if (ownerPhoneInput?.value)
        setOwnerData((prev) => ({ ...prev, phone: ownerPhoneInput.value }));
      if (ownerAddressInput?.value)
        setOwnerData((prev) => ({ ...prev, address: ownerAddressInput.value }));
      if (ownerCityInput?.value)
        setOwnerData((prev) => ({ ...prev, city: ownerCityInput.value }));
      if (ownerPostalCodeInput?.value)
        setOwnerData((prev) => ({
          ...prev,
          postal_code: ownerPostalCodeInput.value,
        }));
      if (ownerKennelInput?.value)
        setOwnerData((prev) => ({
          ...prev,
          kennel_name: ownerKennelInput.value,
        }));
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!dogData.name.trim()) newErrors.name = ["Nazwa psa jest wymagana"];
    if (!dogData.kennel_name || !dogData.kennel_name.trim()) {
      newErrors.kennel_name = ["Nazwa hodowli jest wymagana"];
    }
    if (!dogData.birth_date)
      newErrors.birth_date = ["Data urodzenia jest wymagana"];

    if (dogData.microchip_number) {
      const chipOk = /^[0-9]{15}$/.test(dogData.microchip_number);
      if (!chipOk)
        newErrors.microchip_number = ["Numer chipa musi mieć 15 cyfr"];
    }

    if (!ownerData.first_name.trim())
      newErrors.owner_first_name = ["Imię właściciela jest wymagane"];
    if (!ownerData.last_name.trim())
      newErrors.owner_last_name = ["Nazwisko właściciela jest wymagane"];
    if (!ownerData.email.trim()) {
      newErrors.owner_email = ["Email właściciela jest wymagany"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerData.email)) {
      newErrors.owner_email = ["Nieprawidłowy format email"];
    }
    if (!ownerData.gdpr_consent)
      newErrors.owner_gdpr_consent = ["Zgoda RODO jest wymagana"];

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDogChange = (field: keyof DogFormData, value: string) => {
    setDogData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: [] }));
  };

  const handleOwnerChange = (field: keyof OwnerFormData, value: string) => {
    // Konwertuj puste stringi na undefined dla pól opcjonalnych
    const processedValue =
      field === "address" || field === "city"
        ? value.trim() || undefined
        : value;

    setOwnerData((prev) => ({ ...prev, [field]: processedValue }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: [] }));
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
      address: undefined,
      city: undefined,
      postal_code: "",
      kennel_name: "",
      gdpr_consent: false,
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      // 1) Sprawdź czy właściciel już istnieje
      let ownerId: string | undefined;
      const existingOwnerResponse = await fetch(
        `/api/owners?email=${ownerData.email}`,
      );
      if (existingOwnerResponse.ok) {
        const existingOwners = await existingOwnerResponse.json();
        if (existingOwners.data && existingOwners.data.length > 0) {
          ownerId = existingOwners.data[0].id; // Użyj istniejącego właściciela
        }
      }

      // 2) Jeśli właściciel nie istnieje, utwórz nowego
      if (!ownerId) {
        const ownerRes = await fetch("/api/owners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        if (!ownerRes.ok) {
          const err = await ownerRes.json();
          throw new Error(err?.error?.message || "Błąd tworzenia właściciela");
        }
        const owner = await ownerRes.json();
        ownerId = owner.id;
      }

      // 3) Create dog
      const dogRes = await fetch("/api/dogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dogData.name,
          gender: dogData.gender,
          birth_date: dogData.birth_date,
          coat: dogData.coat,
          microchip_number: dogData.microchip_number || null,
          kennel_name: dogData.kennel_name || null,
          father_name: dogData.father_name || null,
          mother_name: dogData.mother_name || null,
          owners: [{ id: ownerId, is_primary: true }],
        }),
      });
      if (!dogRes.ok) {
        const err = await dogRes.json();
        throw new Error(err?.error?.message || "Błąd tworzenia psa");
      }

      setSuccessMessage(`Pies "${dogData.name}" został pomyślnie dodany!`);
      onSuccess?.();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);

      // Reset form
      resetForm();
    } catch (error) {
      setErrors({
        submit: [error instanceof Error ? error.message : "Błąd dodawania psa"],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Dodaj psa</h1>
      <p className="text-gray-600 mb-6">
        Utwórz psa bez przypisania do wystawy.
      </p>
      <form
        onSubmit={handleSubmit}
        className="space-y-8"
        ref={formRef}
        data-testid="add-dog-form"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Dane psa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="dog-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nazwa *
              </label>
              <input
                id="dog-name"
                type="text"
                value={dogData.name}
                onChange={(e) => handleDogChange("name", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nazwa psa"
                data-testid="dog-name-input"
              />
              {errors.name && (
                <p
                  className="text-red-600 text-sm mt-1"
                  data-testid="dog-name-error"
                >
                  {errors.name[0]}
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
                id="kennel-name"
                type="text"
                value={dogData.kennel_name || ""}
                onChange={(e) => handleDogChange("kennel_name", e.target.value)}
                placeholder="Nazwa hodowli"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="kennel-name-input"
              />
              {errors.kennel_name && (
                <p
                  className="text-red-600 text-sm mt-1"
                  data-testid="kennel-name-error"
                >
                  {errors.kennel_name[0]}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="birth-date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Data urodzenia *
              </label>
              <input
                id="birth-date"
                type="date"
                value={dogData.birth_date}
                onChange={(e) => handleDogChange("birth_date", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="birth-date-input"
              />
              {errors.birth_date && (
                <p
                  className="text-red-600 text-sm mt-1"
                  data-testid="birth-date-error"
                >
                  {errors.birth_date[0]}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="microchip-number"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Numer chipa
              </label>
              <input
                id="microchip-number"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{15}"
                value={dogData.microchip_number || ""}
                onChange={(e) =>
                  handleDogChange("microchip_number", e.target.value)
                }
                placeholder="15 cyfr"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.microchip_number && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.microchip_number[0]}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="dog-gender"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Płeć *
              </label>
              <select
                id="dog-gender"
                value={dogData.gender}
                onChange={(e) =>
                  handleDogChange("gender", e.target.value as DogGender)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="dog-gender-select"
              >
                <option value="male">Samiec</option>
                <option value="female">Suka</option>
              </select>
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
                  handleDogChange(
                    "coat",
                    e.target.value as "czarny" | "czarny_podpalany" | "blond",
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="dog-coat-select"
              >
                <option value="czarny">Czarny</option>
                <option value="czarny_podpalany">Czarny podpalany</option>
                <option value="blond">Blond</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="father-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ojciec
              </label>
              <input
                id="father-name"
                type="text"
                value={dogData.father_name || ""}
                onChange={(e) => handleDogChange("father_name", e.target.value)}
                placeholder="Imię ojca"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                id="mother-name"
                type="text"
                value={dogData.mother_name || ""}
                onChange={(e) => handleDogChange("mother_name", e.target.value)}
                placeholder="Imię matki"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Dane właściciela
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="owner-first-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Imię *
              </label>
              <input
                id="owner-first-name"
                type="text"
                value={ownerData.first_name}
                onChange={(e) =>
                  handleOwnerChange("first_name", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Imię"
              />
              {errors.owner_first_name && (
                <p
                  className="text-red-600 text-sm mt-1"
                  data-testid="owner-first-name-error"
                >
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
                id="owner-last-name"
                type="text"
                value={ownerData.last_name}
                onChange={(e) => handleOwnerChange("last_name", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nazwisko"
              />
              {errors.owner_last_name && (
                <p
                  className="text-red-600 text-sm mt-1"
                  data-testid="owner-last-name-error"
                >
                  {errors.owner_last_name[0]}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="owner-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email *
              </label>
              <input
                id="owner-email"
                type="email"
                value={ownerData.email}
                onChange={(e) => handleOwnerChange("email", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
              {errors.owner_email && (
                <p
                  className="text-red-600 text-sm mt-1"
                  data-testid="owner-email-error"
                >
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
                id="owner-phone"
                type="tel"
                value={ownerData.phone || ""}
                onChange={(e) => handleOwnerChange("phone", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+48 123 456 789"
              />
            </div>
            <div>
              <label
                htmlFor="owner-kennel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Hodowla
              </label>
              <input
                id="owner-kennel"
                type="text"
                value={ownerData.kennel_name || ""}
                onChange={(e) =>
                  handleOwnerChange("kennel_name", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nazwa hodowli"
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
                id="owner-address"
                type="text"
                value={ownerData.address || ""}
                onChange={(e) => handleOwnerChange("address", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ulica i numer domu"
              />
            </div>
            <div>
              <label
                htmlFor="owner-city"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Miasto
              </label>
              <input
                id="owner-city"
                type="text"
                value={ownerData.city || ""}
                onChange={(e) => handleOwnerChange("city", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Miasto"
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
                id="owner-postal-code"
                type="text"
                value={ownerData.postal_code || ""}
                onChange={(e) =>
                  handleOwnerChange("postal_code", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12-345"
              />
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={ownerData.gdpr_consent}
                onChange={(e) =>
                  setOwnerData((prev) => ({
                    ...prev,
                    gdpr_consent: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                data-testid="gdpr-consent-checkbox"
              />
              <span className="text-sm text-gray-700">
                Właściciel udzielił zgody RODO *
              </span>
            </div>
            {errors.owner_gdpr_consent && (
              <p
                className="text-red-600 text-sm mt-1 md:col-span-2"
                data-testid="gdpr-consent-error"
              >
                {errors.owner_gdpr_consent[0]}
              </p>
            )}
          </div>
        </div>

        {errors.submit && (
          <div
            className="p-4 bg-red-50 border border-red-200 rounded-md"
            data-testid="submit-error"
          >
            <p className="text-red-600 text-sm">{errors.submit[0]}</p>
          </div>
        )}

        {successMessage && (
          <div
            className="p-4 bg-green-50 border border-green-200 rounded-md"
            data-testid="success-message"
          >
            <p className="text-green-600 text-sm">{successMessage}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <a
            href="/"
            className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            Anuluj
          </a>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-amber-500 text-gray-900 rounded-md hover:bg-amber-400 disabled:opacity-50 transition-colors"
            data-testid="submit-button"
          >
            {isSubmitting ? "Zapisywanie..." : "Dodaj psa"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDogForm;
