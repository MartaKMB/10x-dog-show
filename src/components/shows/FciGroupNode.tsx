import React from "react";
import type { HierarchyNode, UserRole, ShowStatus } from "../../types";
import BreedGroupNode from "./BreedGroupNode.tsx";

interface FciGroupNodeProps {
  node: HierarchyNode;
  onNodeToggle: (nodeId: string) => void;
  onDogAction: (action: string, dogId: string) => void;
  canEdit: boolean;
  canDelete: boolean;
  userRole: UserRole;
  showStatus: ShowStatus;
  onKeyDown: (event: React.KeyboardEvent, nodeId: string) => void;
  isAuthenticated: boolean;
}

const FciGroupNode: React.FC<FciGroupNodeProps> = ({
  node,
  onNodeToggle,
  onDogAction,
  canEdit,
  canDelete,
  userRole,
  showStatus,
  onKeyDown,
  isAuthenticated,
}) => {
  const handleToggle = () => {
    onNodeToggle(node.id);
  };

  const getFciGroupLabel = (fciGroup: string): string => {
    const groupLabels: Record<string, string> = {
      G1: "Grupa 1 - Owczarki i psy pasterskie",
      G2: "Grupa 2 - Pinczery, sznaucery, molosy i szwajcarskie psy górskie",
      G3: "Grupa 3 - Teriery",
      G4: "Grupa 4 - Jamniki",
      G5: "Grupa 5 - Szpice i psy w typie pierwotnym",
      G6: "Grupa 6 - Psy gończe i rasy pokrewne",
      G7: "Grupa 7 - Psy wystawowe",
      G8: "Grupa 8 - Aportery, płochacze i psy wodne",
      G9: "Grupa 9 - Psy ozdobne i do towarzystwa",
      G10: "Grupa 10 - Charty",
    };
    return groupLabels[fciGroup] || fciGroup;
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* FCI Group Header */}
      <div
        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
        onClick={handleToggle}
        onKeyDown={(e) => onKeyDown(e, node.id)}
        tabIndex={0}
        role="button"
        aria-expanded={node.isExpanded}
        aria-label={`${getFciGroupLabel(node.name)} - ${node.count} psów`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-6 h-6">
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${
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
            <h3 className="text-lg font-semibold text-gray-900">
              {getFciGroupLabel(node.name)}
            </h3>
            <p className="text-sm text-gray-600">
              {node.count}{" "}
              {node.count === 1 ? "pies" : node.count < 5 ? "psy" : "psów"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full border">
            {node.name}
          </span>
        </div>
      </div>

      {/* Children */}
      {node.isExpanded && node.children.length > 0 && (
        <div className="bg-white">
          {node.children.map((childNode) => (
            <BreedGroupNode
              key={childNode.id}
              node={childNode}
              onNodeToggle={onNodeToggle}
              onDogAction={onDogAction}
              canEdit={canEdit}
              canDelete={canDelete}
              userRole={userRole}
              showStatus={showStatus}
              onKeyDown={onKeyDown}
              level={1}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FciGroupNode;
