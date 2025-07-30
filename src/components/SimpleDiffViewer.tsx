import React from "react";

interface Change {
  field: string;
  oldValue: string;
  newValue: string;
  author: string;
  timestamp: string;
}

interface SimpleDiffViewerProps {
  changes: Change[];
}

export function SimpleDiffViewer({ changes }: SimpleDiffViewerProps) {
  if (!changes.length)
    return <div className="text-gray-500 text-sm">Brak zmian</div>;
  return (
    <div className="space-y-2">
      {changes.map((change, idx) => (
        <div
          key={idx}
          className="p-3 border border-gray-200 rounded-lg bg-gray-50"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium">{change.field}</span>
            <span className="text-xs text-gray-500">
              {new Date(change.timestamp).toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-gray-600 mb-1">
            Autor: {change.author}
          </div>
          <div className="text-xs">
            <span className="text-red-700 line-through">{change.oldValue}</span>
            <span className="mx-2">→</span>
            <span className="text-green-700">{change.newValue}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
