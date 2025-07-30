import React from "react";
import type { DescriptionVersionDto } from "../types";

interface ChangeHistoryProps {
  versions: DescriptionVersionDto[];
  onSelect: (version: DescriptionVersionDto) => void;
  selectedVersion?: DescriptionVersionDto | null;
}

export function ChangeHistory({
  versions,
  onSelect,
  selectedVersion,
}: ChangeHistoryProps) {
  return (
    <div className="space-y-2">
      {versions.map((version) => (
        <button
          key={version.id}
          onClick={() => onSelect(version)}
          className={`w-full text-left p-3 border rounded-lg hover:bg-gray-50 ${selectedVersion?.id === version.id ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">Wersja {version.version}</span>
            <span className="text-sm text-gray-500">
              {new Date(version.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {version.changed_by.first_name} {version.changed_by.last_name}
          </div>
        </button>
      ))}
    </div>
  );
}
