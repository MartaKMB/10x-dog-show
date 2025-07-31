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
    <div className="w-full">
      {/* Zakładki językowe - responsywne */}
      <div className="flex flex-col sm:flex-row border-b border-gray-200 mb-4">
        <button
          type="button"
          className={`flex-1 px-3 py-2 sm:px-4 text-sm sm:text-base font-medium transition-colors duration-200 ${
            activeTab === "pl"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 sm:bg-transparent"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 sm:hover:bg-transparent"
          }`}
          onClick={() => setActiveTab("pl")}
          disabled={disabled}
        >
          <span className="hidden sm:inline">Polski</span>
          <span className="sm:hidden">PL</span>
        </button>
        <button
          type="button"
          className={`flex-1 px-3 py-2 sm:px-4 text-sm sm:text-base font-medium transition-colors duration-200 ${
            activeTab === "en"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 sm:bg-transparent"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 sm:hover:bg-transparent"
          }`}
          onClick={() => setActiveTab("en")}
          disabled={disabled}
        >
          <span className="hidden sm:inline">English</span>
          <span className="sm:hidden">EN</span>
        </button>
      </div>

      {/* Pole edycji - responsywne */}
      <div className="relative">
        {activeTab === "pl" && (
          <textarea
            value={value.content_pl}
            onChange={(e) => handleContentChange("pl", e.target.value)}
            placeholder="Wprowadź opis psa w języku polskim..."
            className="w-full h-32 sm:h-48 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
            disabled={disabled}
          />
        )}
        {activeTab === "en" && (
          <textarea
            value={value.content_en}
            onChange={(e) => handleContentChange("en", e.target.value)}
            placeholder="Enter dog description in English..."
            className="w-full h-32 sm:h-48 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
            disabled={disabled}
          />
        )}

        {/* Wskaźnik długości tekstu */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 pointer-events-none">
          {activeTab === "pl"
            ? value.content_pl.length
            : value.content_en.length}{" "}
          znaków
        </div>
      </div>
    </div>
  );
}
