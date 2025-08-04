import React from "react";
import { Button } from "../ui/button.tsx";

interface HierarchyControlsProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onSearch: (query: string) => void;
  totalNodes: number;
  visibleNodes: number;
  className?: string;
}

const HierarchyControls: React.FC<HierarchyControlsProps> = ({
  onExpandAll,
  onCollapseAll,
  onSearch,
  totalNodes,
  visibleNodes,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 border-b border-gray-200 ${className}`}
    >
      {/* Hierarchy Info */}
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span>
          Pokazano {visibleNodes} z {totalNodes} elementów
        </span>
        {visibleNodes < totalNodes && (
          <span className="text-blue-600">
            (zwinięte: {totalNodes - visibleNodes})
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-2">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj w hierarchii..."
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="px-3 py-1"
          >
            Szukaj
          </Button>
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="px-2 py-1 text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          )}
        </form>

        {/* Expand/Collapse Controls */}
        <div className="flex items-center space-x-1">
          <Button
            onClick={onExpandAll}
            variant="outline"
            size="sm"
            className="px-3 py-1"
            title="Rozwiń wszystkie"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>
          <Button
            onClick={onCollapseAll}
            variant="outline"
            size="sm"
            className="px-3 py-1"
            title="Zwiń wszystkie"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HierarchyControls;
