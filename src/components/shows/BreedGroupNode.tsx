import React from "react";
import type { HierarchyNode, UserRole, ShowStatus } from "../../types";
import ClassGroupNode from "./ClassGroupNode.tsx";

interface BreedGroupNodeProps {
  node: HierarchyNode;
  onNodeToggle: (nodeId: string) => void;
  onDogAction: (action: string, dogId: string) => void;
  canEdit: boolean;
  canDelete: boolean;
  userRole: UserRole;
  showStatus: ShowStatus;
  onKeyDown: (event: React.KeyboardEvent, nodeId: string) => void;
  level: number;
  isAuthenticated: boolean;
}

const BreedGroupNode: React.FC<BreedGroupNodeProps> = ({
  node,
  onNodeToggle,
  onDogAction,
  canEdit,
  canDelete,
  userRole,
  showStatus,
  onKeyDown,
  level,
  isAuthenticated,
}) => {
  const handleToggle = () => {
    onNodeToggle(node.id);
  };

  const paddingLeft = `${level * 16}px`;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Breed Header */}
      <div
        className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors"
        style={{ paddingLeft: `calc(${paddingLeft} + 12px)` }}
        onClick={handleToggle}
        onKeyDown={(e) => onKeyDown(e, node.id)}
        tabIndex={0}
        role="button"
        aria-expanded={node.isExpanded}
        aria-label={`${node.name} - ${node.count} psów`}
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
            <h4 className="text-base font-medium text-gray-900">{node.name}</h4>
            <p className="text-sm text-gray-600">
              {node.count}{" "}
              {node.count === 1 ? "pies" : node.count < 5 ? "psy" : "psów"}
            </p>
          </div>
        </div>
      </div>

      {/* Children */}
      {node.isExpanded && node.children.length > 0 && (
        <div className="bg-gray-50">
          {node.children.map((childNode) => (
            <ClassGroupNode
              key={childNode.id}
              node={childNode}
              onNodeToggle={onNodeToggle}
              onDogAction={onDogAction}
              canEdit={canEdit}
              canDelete={canDelete}
              userRole={userRole}
              showStatus={showStatus}
              onKeyDown={onKeyDown}
              level={level + 1}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BreedGroupNode;
