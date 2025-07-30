import React, { useState } from "react";

export interface RichTextEditorValue {
  content_pl: string;
  content_en: string;
}

interface RichTextEditorProps {
  value: RichTextEditorValue;
  onChange: (value: RichTextEditorValue) => void;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  disabled,
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"pl" | "en">("pl");

  const handleContentChange = (lang: "pl" | "en", content: string) => {
    onChange({ ...value, [`content_${lang}`]: content });
  };

  return (
    <div>
      {/* Zakładki językowe */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          type="button"
          className={`px-4 py-2 font-medium ${activeTab === "pl" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("pl")}
          disabled={disabled}
        >
          Polski
        </button>
        <button
          type="button"
          className={`px-4 py-2 font-medium ${activeTab === "en" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("en")}
          disabled={disabled}
        >
          English
        </button>
      </div>

      {/* Pole edycji */}
      {activeTab === "pl" && (
        <textarea
          value={value.content_pl}
          onChange={(e) => handleContentChange("pl", e.target.value)}
          placeholder="Wprowadź opis psa w języku polskim..."
          className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        />
      )}
      {activeTab === "en" && (
        <textarea
          value={value.content_en}
          onChange={(e) => handleContentChange("en", e.target.value)}
          placeholder="Enter dog description in English..."
          className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        />
      )}
    </div>
  );
}
