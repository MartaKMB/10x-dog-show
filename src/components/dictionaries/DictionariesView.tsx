import React, { useState } from "react";
import BreedsDictionary from "./BreedsDictionary.tsx";
import BranchesDictionary from "./BranchesDictionary.tsx";

type TabType = "breeds" | "branches";

const DictionariesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("breeds");

  const tabs = [
    { id: "breeds" as TabType, label: "Rasy psów" },
    { id: "branches" as TabType, label: "Oddziały ZKwP" },
  ];

  return (
    <div>
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "breeds" && <BreedsDictionary />}
        {activeTab === "branches" && <BranchesDictionary />}
      </div>
    </div>
  );
};

export default DictionariesView;
