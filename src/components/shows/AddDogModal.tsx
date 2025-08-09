import React, { useState, useEffect } from "react";
import type { DogClass } from "../../types";

interface AddDogModalProps {
  showId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isProcessing: boolean;
}

interface DogFormData {
  name: string;
  gender: "male" | "female";
  birth_date: string;
  kennel_name: string;
  father_name: string;
  mother_name: string;
  dog_class: string;
  grade?: string;
  baby_puppy_grade?: string;
  club_title?: string;
  placement?: string;
}

interface OwnerFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  kennel_name: string;
  gdpr_consent: boolean;
}

type ValidationErrors = Record<string, string[]>;

const AddDogModal: React.FC<AddDogModalProps> = ({
  showId,
  isOpen,
  onClose,
  onSuccess,
  isProcessing,
}) => {
  const [dogData, setDogData] = useState<DogFormData>({
    name: "",
    gender: "male",
    birth_date: "",
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
    kennel_name: "",
    gdpr_consent: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      resetForm();
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Dog validation
    if (!dogData.name.trim()) {
      newErrors.name = ["Nazwa psa jest wymagana"];
    }
    if (!dogData.birth_date) {
      newErrors.birth_date = ["Data urodzenia jest wymagana"];
    }
    if (!dogData.kennel_name.trim()) {
      newErrors.kennel_name = ["Nazwa hodowli jest wymagana"];
    }
    if (!dogData.dog_class) {
      newErrors.dog_class = ["Klasa psa jest wymagana"];
    }

    // Evaluation validation depending on class
    if (dogData.dog_class === "baby" || dogData.dog_class === "puppy") {
      if (!dogData.baby_puppy_grade) {
        newErrors.baby_puppy_grade = [
          "Dla klas baby/puppy wymagana jest ocena baby/puppy",
        ];
      }
      if (dogData.grade) {
        newErrors.grade = [
          "Klasy baby/puppy nie używają pola 'ocena' tylko 'ocena baby/puppy'",
        ];
      }
    } else if (dogData.dog_class) {
      if (!dogData.grade) {
        newErrors.grade = ["Ocena jest wymagana dla wybranej klasy"];
      }
      if (dogData.baby_puppy_grade) {
        newErrors.baby_puppy_grade = [
          "Dla klas innych niż baby/puppy nie używa się 'ocena baby/puppy'",
        ];
      }
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
    if (!ownerData.gdpr_consent) {
      newErrors.owner_gdpr_consent = ["Zgoda GDPR jest wymagana"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDogDataChange = (
    field: keyof DogFormData,
    value: string | number,
  ) => {
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
      // Create owner first
      const ownerResponse = await fetch("/api/owners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: ownerData.first_name,
          last_name: ownerData.last_name,
          email: ownerData.email,
          phone: ownerData.phone || null,
          address: "Brak adresu", // Required field but not used for Hovawart Club
          city: "Brak miasta", // Required field but not used for Hovawart Club
          kennel_name: ownerData.kennel_name || null,
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

      // Create dog
      const dogResponse = await fetch("/api/dogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: dogData.name,
          gender: dogData.gender,
          birth_date: dogData.birth_date,
          kennel_name: dogData.kennel_name || null,
          father_name: dogData.father_name || null,
          mother_name: dogData.mother_name || null,
          owners: [
            {
              id: owner.id,
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

      // Create registration directly
      const regResponse = await fetch(`/api/shows/${showId}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dog_id: dog.id,
          dog_class: dogData.dog_class as DogClass,
        }),
      });
      if (!regResponse.ok) {
        const errorData = await regResponse.json();
        throw new Error(
          errorData.error?.message || "Błąd tworzenia rejestracji",
        );
      }

      // Optionally create evaluation
      const hasEval =
        !!dogData.grade ||
        !!dogData.baby_puppy_grade ||
        !!dogData.club_title ||
        !!dogData.placement;
      if (hasEval) {
        const evalPayload: Record<string, unknown> = {
          dog_id: dog.id,
          dog_class: dogData.dog_class as DogClass,
          club_title: dogData.club_title || undefined,
          placement: dogData.placement || undefined,
        };
        if (dogData.dog_class === "baby" || dogData.dog_class === "puppy") {
          evalPayload["baby_puppy_grade"] = dogData.baby_puppy_grade;
        } else {
          evalPayload["grade"] = dogData.grade;
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
      }

      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Error adding dog:", error);
      setErrors({
        submit: [error instanceof Error ? error.message : "Błąd dodawania psa"],
      });
    }
  };

  const resetForm = () => {
    setDogData({
      name: "",
      gender: "male",
      birth_date: "",
      kennel_name: "",
      father_name: "",
      mother_name: "",
      dog_class: "",
      grade: undefined,
      baby_puppy_grade: undefined,
      club_title: undefined,
      placement: undefined,
    });
    setOwnerData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
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

                {/* Microchip removed for now */}

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
                    Nazwa hodowli *
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

          {/* Per-show fields: catalog number and evaluation */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Wyniki wystawy
              </h3>
              <div className="space-y-4">
                {(dogData.dog_class === "baby" ||
                  dogData.dog_class === "puppy") && (
                  <div>
                    <label
                      htmlFor="baby-puppy-grade"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Ocena (baby/puppy) *
                    </label>
                    <select
                      id="baby-puppy-grade"
                      value={dogData.baby_puppy_grade || ""}
                      onChange={(e) =>
                        handleDogDataChange("baby_puppy_grade", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Wybierz ocenę</option>
                      <option value="bardzo_obiecujący">
                        Bardzo obiecujący
                      </option>
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

                {dogData.dog_class &&
                  dogData.dog_class !== "baby" &&
                  dogData.dog_class !== "puppy" && (
                    <div>
                      <label
                        htmlFor="grade"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Ocena *
                      </label>
                      <select
                        id="grade"
                        value={dogData.grade || ""}
                        onChange={(e) =>
                          handleDogDataChange("grade", e.target.value)
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="club_title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tytuł klubowy
                    </label>
                    <select
                      id="club_title"
                      value={dogData.club_title || ""}
                      onChange={(e) =>
                        handleDogDataChange("club_title", e.target.value)
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
                      <option value="najlepsza_hodowla">
                        Najlepsza Hodowla
                      </option>
                      <option value="zwycięzca_rasy">Zwycięzca Rasy</option>
                      <option value="zwycięzca_płci_przeciwnej">
                        Zwycięzca Płci Przeciwnej
                      </option>
                      <option value="najlepszy_junior">Najlepszy Junior</option>
                      <option value="najlepszy_weteran">
                        Najlepszy Weteran
                      </option>
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
                      value={dogData.placement || ""}
                      onChange={(e) =>
                        handleDogDataChange("placement", e.target.value)
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
