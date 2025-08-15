import React from "react";
import type { HierarchyNode, UserRole, ShowStatus } from "../../types";
import DogCard from "./DogCard";

interface ClassGroupNodeProps {
  node: HierarchyNode;
  onNodeToggle: (nodeId: string) => void;
  onDogAction: (action: string, dogId: string) => void;
  canEdit: boolean;
  canDelete: boolean;
  userRole: UserRole;
  showStatus: ShowStatus;
  onKeyDown: (event: React.KeyboardEvent, nodeId: string) => void;
  level: number;
}

const ClassGroupNode: React.FC<ClassGroupNodeProps> = ({
  node,
  onNodeToggle,
  onDogAction,
  canEdit,
  canDelete,
  showStatus,
  onKeyDown,
  level,
}) => {
  const handleToggle = () => {
    onNodeToggle(node.id);
  };

  const getClassLabel = (dogClass: string): string => {
    const classLabels: Record<string, string> = {
      baby: "Baby",
      puppy: "Szczenię",
      junior: "Junior",
      intermediate: "Młodzież",
      open: "Otwarta",
      working: "Pracująca",
      champion: "Champion",
      veteran: "Weteran",
    };
    return classLabels[dogClass] || dogClass;
  };

  const paddingLeft = `${level * 16}px`;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Class Header */}
      <div
        className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer transition-colors"
        style={{ paddingLeft: `calc(${paddingLeft} + 12px)` }}
        onClick={handleToggle}
        onKeyDown={(e) => onKeyDown(e, node.id)}
        tabIndex={0}
        role="button"
        aria-expanded={node.isExpanded}
        aria-label={`${getClassLabel(node.name)} - ${node.count} psów`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-5 h-5">
            <svg
              className={`w-3 h-3 text-gray-500 transition-transform ${
                node.isExpanded ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <div>
            <h5 className="text-sm font-medium text-gray-900">
              {getClassLabel(node.name)}
            </h5>
            <p className="text-xs text-gray-600">
              {node.count}{" "}
              {node.count === 1 ? "pies" : node.count < 5 ? "psy" : "psów"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
            {node.name}
          </span>
        </div>
      </div>

      {/* Dogs List */}
      {node.isExpanded && node.children.length > 0 && (
        <div className="bg-white">
          {node.children.map((childNode) => {
            if (childNode.type === "dog" && childNode.data) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const dogData = childNode.data as any; // DogResponseDto
              return (
                <div
                  key={childNode.id}
                  style={{ paddingLeft: `calc(${paddingLeft} + 24px)` }}
                >
                  <DogCard
                    dog={{
                      registration: dogData.registration || {},
                      canEdit,
                      canDelete,
                      isExpanded: false,
                      isProcessing: false,
                    }}
                    onAction={(action) => onDogAction(action, childNode.id)}
                    showStatus={showStatus}
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default ClassGroupNode;
