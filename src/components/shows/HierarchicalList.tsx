import React from "react";
import type { HierarchyNode, UserRole, ShowStatus } from "../../types";
import FciGroupNode from "./FciGroupNode.tsx";

interface HierarchicalListProps {
  nodes: HierarchyNode[];
  onNodeToggle: (nodeId: string) => void;
  onDogAction: (action: string, dogId: string) => void;
  canEdit: boolean;
  canDelete: boolean;
  userRole: UserRole;
  showStatus: ShowStatus;
  isAuthenticated: boolean;
}

const HierarchicalList: React.FC<HierarchicalListProps> = ({
  nodes,
  onNodeToggle,
  onDogAction,
  canEdit,
  canDelete,
  userRole,
  showStatus,
  isAuthenticated,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent, nodeId: string) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        onNodeToggle(nodeId);
        break;
      case "ArrowRight":
        event.preventDefault();
        // Expand node
        break;
      case "ArrowLeft":
        event.preventDefault();
        // Collapse node
        break;
      case "ArrowDown":
        event.preventDefault();
        // Navigate to next node
        break;
      case "ArrowUp":
        event.preventDefault();
        // Navigate to previous node
        break;
      case "Escape":
        event.preventDefault();
        // Clear selection
        break;
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Brak psów do wyświetlenia</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {nodes.map((node) => (
        <FciGroupNode
          key={node.id}
          node={node}
          onNodeToggle={onNodeToggle}
          onDogAction={onDogAction}
          canEdit={canEdit}
          canDelete={canDelete}
          userRole={userRole}
          showStatus={showStatus}
          onKeyDown={handleKeyDown}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
};

export default HierarchicalList;
