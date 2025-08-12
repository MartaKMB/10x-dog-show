import React from "react";
import type {
  CreateEvaluationDto,
  DogClass,
  EvaluationGrade,
  BabyPuppyGrade,
  Placement,
} from "../../types";

interface EvaluationFormProps {
  value: CreateEvaluationDto;
  onChange: (value: CreateEvaluationDto) => void;
  dogClass: DogClass;
  disabled?: boolean;
  errors?: string[];
}

const gradeOptionsByClass: Record<
  DogClass,
  { label: string; value: EvaluationGrade | "" }[]
> = {
  baby: [],
  puppy: [],
  junior: [
    { label: "Doskonała", value: "doskonała" },
    { label: "Bardzo dobra", value: "bardzo_dobra" },
    { label: "Dobra", value: "dobra" },
    { label: "Zadowalająca", value: "zadowalająca" },
    { label: "Zdyskwalifikowana", value: "zdyskwalifikowana" },
    { label: "Nieobecna", value: "nieobecna" },
  ],
  intermediate: [
    { label: "Doskonała", value: "doskonała" },
    { label: "Bardzo dobra", value: "bardzo_dobra" },
    { label: "Dobra", value: "dobra" },
    { label: "Zadowalająca", value: "zadowalająca" },
    { label: "Zdyskwalifikowana", value: "zdyskwalifikowana" },
    { label: "Nieobecna", value: "nieobecna" },
  ],
  open: [
    { label: "Doskonała", value: "doskonała" },
    { label: "Bardzo dobra", value: "bardzo_dobra" },
    { label: "Dobra", value: "dobra" },
    { label: "Zadowalająca", value: "zadowalająca" },
    { label: "Zdyskwalifikowana", value: "zdyskwalifikowana" },
    { label: "Nieobecna", value: "nieobecna" },
  ],
  working: [
    { label: "Doskonała", value: "doskonała" },
    { label: "Bardzo dobra", value: "bardzo_dobra" },
    { label: "Dobra", value: "dobra" },
    { label: "Zadowalająca", value: "zadowalająca" },
    { label: "Zdyskwalifikowana", value: "zdyskwalifikowana" },
    { label: "Nieobecna", value: "nieobecna" },
  ],
  champion: [
    { label: "Doskonała", value: "doskonała" },
    { label: "Bardzo dobra", value: "bardzo_dobra" },
    { label: "Dobra", value: "dobra" },
    { label: "Zadowalająca", value: "zadowalająca" },
    { label: "Zdyskwalifikowana", value: "zdyskwalifikowana" },
    { label: "Nieobecna", value: "nieobecna" },
  ],
  veteran: [
    { label: "Doskonała", value: "doskonała" },
    { label: "Bardzo dobra", value: "bardzo_dobra" },
    { label: "Dobra", value: "dobra" },
    { label: "Zadowalająca", value: "zadowalająca" },
    { label: "Zdyskwalifikowana", value: "zdyskwalifikowana" },
    { label: "Nieobecna", value: "nieobecna" },
  ],
};

const babyPuppyGradeOptions: { label: string; value: BabyPuppyGrade }[] = [
  { label: "Bardzo obiecujący", value: "bardzo_obiecujący" },
  { label: "Obiecujący", value: "obiecujący" },
  { label: "Dość obiecujący", value: "dość_obiecujący" },
];

const placementOptions: { label: string; value: Placement }[] = [
  { label: "1st", value: "1st" },
  { label: "2nd", value: "2nd" },
  { label: "3rd", value: "3rd" },
  { label: "4th", value: "4th" },
];

export function EvaluationForm({
  value,
  onChange,
  dogClass,
  disabled,
  errors,
}: EvaluationFormProps) {
  const handleChange = (
    field: keyof CreateEvaluationDto,
    val: string | number | boolean | undefined,
  ) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="space-y-4">
      {/* Ocena lub baby_puppy_grade */}
      {dogClass === "baby" || dogClass === "puppy" ? (
        <div>
          <label
            htmlFor="baby-puppy-grade"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ocena (baby/puppy)
          </label>
          <select
            id="baby-puppy-grade"
            value={value.baby_puppy_grade || ""}
            onChange={(e) =>
              handleChange("baby_puppy_grade", e.target.value || undefined)
            }
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <option value="">Wybierz ocenę</option>
            {babyPuppyGradeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label
            htmlFor="grade"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ocena
          </label>
          <select
            id="grade"
            value={value.grade || ""}
            onChange={(e) => handleChange("grade", e.target.value || undefined)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <option value="">Wybierz ocenę</option>
            {gradeOptionsByClass[dogClass].map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Lokata */}
      <div>
        <label
          htmlFor="placement"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Lokata
        </label>
        <select
          id="placement"
          value={value.placement || ""}
          onChange={(e) =>
            handleChange("placement", e.target.value || undefined)
          }
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        >
          <option value="">Brak</option>
          {placementOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Błędy */}
      {errors && errors.length > 0 && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((err, idx) => (
              <li key={idx}>• {err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
