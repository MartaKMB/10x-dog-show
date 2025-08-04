import React from "react";
import type {
  CreateEvaluationDto,
  DogClass,
  EvaluationGrade,
  BabyPuppyGrade,
  TitleType,
  Placement,
} from "../../types";

interface EvaluationFormProps {
  value: CreateEvaluationDto;
  onChange: (value: CreateEvaluationDto) => void;
  dogClass: DogClass;
  disabled?: boolean;
  errors?: string[];
}

const gradeOptions: Record<
  DogClass,
  { label: string; value: EvaluationGrade | "" }[]
> = {
  baby: [],
  puppy: [],
  junior: [
    { label: "Excellent", value: "excellent" },
    { label: "Very Good", value: "very_good" },
    { label: "Good", value: "good" },
    { label: "Satisfactory", value: "satisfactory" },
    { label: "Disqualified", value: "disqualified" },
    { label: "Absent", value: "absent" },
  ],
  intermediate: [
    { label: "Excellent", value: "excellent" },
    { label: "Very Good", value: "very_good" },
    { label: "Good", value: "good" },
    { label: "Satisfactory", value: "satisfactory" },
    { label: "Disqualified", value: "disqualified" },
    { label: "Absent", value: "absent" },
  ],
  open: [
    { label: "Excellent", value: "excellent" },
    { label: "Very Good", value: "very_good" },
    { label: "Good", value: "good" },
    { label: "Satisfactory", value: "satisfactory" },
    { label: "Disqualified", value: "disqualified" },
    { label: "Absent", value: "absent" },
  ],
  working: [
    { label: "Excellent", value: "excellent" },
    { label: "Very Good", value: "very_good" },
    { label: "Good", value: "good" },
    { label: "Satisfactory", value: "satisfactory" },
    { label: "Disqualified", value: "disqualified" },
    { label: "Absent", value: "absent" },
  ],
  champion: [
    { label: "Excellent", value: "excellent" },
    { label: "Very Good", value: "very_good" },
    { label: "Good", value: "good" },
    { label: "Satisfactory", value: "satisfactory" },
    { label: "Disqualified", value: "disqualified" },
    { label: "Absent", value: "absent" },
  ],
  veteran: [
    { label: "Excellent", value: "excellent" },
    { label: "Very Good", value: "very_good" },
    { label: "Good", value: "good" },
    { label: "Satisfactory", value: "satisfactory" },
    { label: "Disqualified", value: "disqualified" },
    { label: "Absent", value: "absent" },
  ],
};

const babyPuppyGradeOptions: { label: string; value: BabyPuppyGrade }[] = [
  { label: "Very Promising", value: "very_promising" },
  { label: "Promising", value: "promising" },
  { label: "Quite Promising", value: "quite_promising" },
];

const titleOptions: { label: string; value: TitleType }[] = [
  { label: "CWC", value: "CWC" },
  { label: "CACIB", value: "CACIB" },
  { label: "res. CWC", value: "res_CWC" },
  { label: "res. CACIB", value: "res_CACIB" },
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
            {gradeOptions[dogClass].map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tytuł */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Tytuł
        </label>
        <select
          id="title"
          value={value.title || ""}
          onChange={(e) => handleChange("title", e.target.value || undefined)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        >
          <option value="">Brak</option>
          {titleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

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

      {/* Punkty */}
      <div>
        <label
          htmlFor="points"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Punkty
        </label>
        <input
          id="points"
          type="number"
          value={value.points ?? ""}
          onChange={(e) =>
            handleChange(
              "points",
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          min={0}
          max={4}
          disabled={disabled}
        />
      </div>

      {/* Best in group/show */}
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!value.is_best_in_group}
            onChange={(e) => handleChange("is_best_in_group", e.target.checked)}
            disabled={disabled}
          />
          Best in Group
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!value.is_best_in_show}
            onChange={(e) => handleChange("is_best_in_show", e.target.checked)}
            disabled={disabled}
          />
          Best in Show
        </label>
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
