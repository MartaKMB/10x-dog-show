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
  language?: "pl" | "en";
  disabled?: boolean;
  errors?: string[];
}

const getGradeOptions = (
  language: "pl" | "en" = "pl",
): Record<DogClass, { label: string; value: EvaluationGrade | "" }[]> => {
  const labels =
    language === "pl"
      ? {
          excellent: "Doskonały",
          very_good: "Bardzo dobry",
          good: "Dobry",
          satisfactory: "Zadowalający",
          disqualified: "Dyskwalifikacja",
          absent: "Nieobecny",
        }
      : {
          excellent: "Excellent",
          very_good: "Very Good",
          good: "Good",
          satisfactory: "Satisfactory",
          disqualified: "Disqualified",
          absent: "Absent",
        };

  return {
    baby: [],
    puppy: [],
    junior: [
      { label: labels.excellent, value: "excellent" },
      { label: labels.very_good, value: "very_good" },
      { label: labels.good, value: "good" },
      { label: labels.satisfactory, value: "satisfactory" },
      { label: labels.disqualified, value: "disqualified" },
      { label: labels.absent, value: "absent" },
    ],
    intermediate: [
      { label: labels.excellent, value: "excellent" },
      { label: labels.very_good, value: "very_good" },
      { label: labels.good, value: "good" },
      { label: labels.satisfactory, value: "satisfactory" },
      { label: labels.disqualified, value: "disqualified" },
      { label: labels.absent, value: "absent" },
    ],
    open: [
      { label: labels.excellent, value: "excellent" },
      { label: labels.very_good, value: "very_good" },
      { label: labels.good, value: "good" },
      { label: labels.satisfactory, value: "satisfactory" },
      { label: labels.disqualified, value: "disqualified" },
      { label: labels.absent, value: "absent" },
    ],
    working: [
      { label: labels.excellent, value: "excellent" },
      { label: labels.very_good, value: "very_good" },
      { label: labels.good, value: "good" },
      { label: labels.satisfactory, value: "satisfactory" },
      { label: labels.disqualified, value: "disqualified" },
      { label: labels.absent, value: "absent" },
    ],
    champion: [
      { label: labels.excellent, value: "excellent" },
      { label: labels.very_good, value: "very_good" },
      { label: labels.good, value: "good" },
      { label: labels.satisfactory, value: "satisfactory" },
      { label: labels.disqualified, value: "disqualified" },
      { label: labels.absent, value: "absent" },
    ],
    veteran: [
      { label: labels.excellent, value: "excellent" },
      { label: labels.very_good, value: "very_good" },
      { label: labels.good, value: "good" },
      { label: labels.satisfactory, value: "satisfactory" },
      { label: labels.disqualified, value: "disqualified" },
      { label: labels.absent, value: "absent" },
    ],
  };
};

const getBabyPuppyGradeOptions = (
  language: "pl" | "en" = "pl",
): { label: string; value: BabyPuppyGrade }[] => {
  if (language === "pl") {
    return [
      { label: "Bardzo obiecujący", value: "very_promising" },
      { label: "Obiiecujący", value: "promising" },
      { label: "Dość obiecujący", value: "quite_promising" },
    ];
  } else {
    return [
      { label: "Very Promising", value: "very_promising" },
      { label: "Promising", value: "promising" },
      { label: "Quite Promising", value: "quite_promising" },
    ];
  }
};

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
  language = "pl",
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
            {getBabyPuppyGradeOptions(language).map((opt) => (
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
            {getGradeOptions(language)[dogClass].map((opt) => (
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
