import { useState, useCallback, useEffect } from "react";
import type { HierarchyNode } from "../types";

const useHierarchy = (initialNodes: HierarchyNode[] = []) => {
  const [nodes, setNodes] = useState<HierarchyNode[]>(initialNodes);

  // Update nodes when initialNodes change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  const updateNodes = useCallback((newNodes: HierarchyNode[]) => {
    setNodes(newNodes);
  }, []);

  const toggleNode = useCallback((nodeId: string) => {
    setNodes((prevNodes) => {
      const updateNodeRecursive = (
        nodeList: HierarchyNode[],
      ): HierarchyNode[] => {
        return nodeList.map((node) => {
          if (node.id === nodeId) {
            return { ...node, isExpanded: !node.isExpanded };
          }
          if (node.children.length > 0) {
            return {
              ...node,
              children: updateNodeRecursive(node.children),
            };
          }
          return node;
        });
      };

      return updateNodeRecursive(prevNodes);
    });
  }, []);

  const expandNode = useCallback((nodeId: string) => {
    setNodes((prevNodes) => {
      const updateNodeRecursive = (
        nodeList: HierarchyNode[],
      ): HierarchyNode[] => {
        return nodeList.map((node) => {
          if (node.id === nodeId) {
            return { ...node, isExpanded: true };
          }
          if (node.children.length > 0) {
            return {
              ...node,
              children: updateNodeRecursive(node.children),
            };
          }
          return node;
        });
      };

      return updateNodeRecursive(prevNodes);
    });
  }, []);

  const collapseNode = useCallback((nodeId: string) => {
    setNodes((prevNodes) => {
      const updateNodeRecursive = (
        nodeList: HierarchyNode[],
      ): HierarchyNode[] => {
        return nodeList.map((node) => {
          if (node.id === nodeId) {
            return { ...node, isExpanded: false };
          }
          if (node.children.length > 0) {
            return {
              ...node,
              children: updateNodeRecursive(node.children),
            };
          }
          return node;
        });
      };

      return updateNodeRecursive(prevNodes);
    });
  }, []);

  const expandAll = useCallback(() => {
    setNodes((prevNodes) => {
      const expandNodeRecursive = (
        nodeList: HierarchyNode[],
      ): HierarchyNode[] => {
        return nodeList.map((node) => ({
          ...node,
          isExpanded: true,
          children:
            node.children.length > 0 ? expandNodeRecursive(node.children) : [],
        }));
      };

      return expandNodeRecursive(prevNodes);
    });
  }, []);

  const collapseAll = useCallback(() => {
    setNodes((prevNodes) => {
      const collapseNodeRecursive = (
        nodeList: HierarchyNode[],
      ): HierarchyNode[] => {
        return nodeList.map((node) => ({
          ...node,
          isExpanded: false,
          children:
            node.children.length > 0
              ? collapseNodeRecursive(node.children)
              : [],
        }));
      };

      return collapseNodeRecursive(prevNodes);
    });
  }, []);

  const findNode = useCallback(
    (nodeId: string): HierarchyNode | null => {
      const findNodeRecursive = (
        nodeList: HierarchyNode[],
      ): HierarchyNode | null => {
        for (const node of nodeList) {
          if (node.id === nodeId) {
            return node;
          }
          if (node.children.length > 0) {
            const found = findNodeRecursive(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      return findNodeRecursive(nodes);
    },
    [nodes],
  );

  const getNodePath = useCallback(
    (nodeId: string): HierarchyNode[] => {
      const findPathRecursive = (
        nodeList: HierarchyNode[],
        targetId: string,
        currentPath: HierarchyNode[] = [],
      ): HierarchyNode[] | null => {
        for (const node of nodeList) {
          const newPath = [...currentPath, node];

          if (node.id === targetId) {
            return newPath;
          }

          if (node.children.length > 0) {
            const found = findPathRecursive(node.children, targetId, newPath);
            if (found) return found;
          }
        }
        return null;
      };

      return findPathRecursive(nodes, nodeId) || [];
    },
    [nodes],
  );

  const expandToNode = useCallback(
    (nodeId: string) => {
      const path = getNodePath(nodeId);
      if (path.length > 0) {
        setNodes((prevNodes) => {
          const expandPathRecursive = (
            nodeList: HierarchyNode[],
          ): HierarchyNode[] => {
            return nodeList.map((node) => {
              const isInPath = path.some((pathNode) => pathNode.id === node.id);
              return {
                ...node,
                isExpanded: isInPath,
                children:
                  node.children.length > 0
                    ? expandPathRecursive(node.children)
                    : [],
              };
            });
          };

          return expandPathRecursive(prevNodes);
        });
      }
    },
    [getNodePath],
  );

  const getVisibleNodes = useCallback((): HierarchyNode[] => {
    const getVisibleRecursive = (
      nodeList: HierarchyNode[],
    ): HierarchyNode[] => {
      const visible: HierarchyNode[] = [];

      for (const node of nodeList) {
        visible.push(node);
        if (node.isExpanded && node.children.length > 0) {
          visible.push(...getVisibleRecursive(node.children));
        }
      }

      return visible;
    };

    return getVisibleRecursive(nodes);
  }, [nodes]);

  const getNodeCount = useCallback(
    (nodeId?: string): number => {
      if (!nodeId) {
        return nodes.reduce((total, node) => total + node.count, 0);
      }

      const node = findNode(nodeId);
      return node ? node.count : 0;
    },
    [nodes, findNode],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((prevNodes) => {
      const updateNodeRecursive = (
        nodeList: HierarchyNode[],
      ): HierarchyNode[] => {
        return nodeList.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data };
          }
          if (node.children.length > 0) {
            return {
              ...node,
              children: updateNodeRecursive(node.children),
            };
          }
          return node;
        });
      };

      return updateNodeRecursive(prevNodes);
    });
  }, []);

  return {
    nodes,
    updateNodes,
    toggleNode,
    expandNode,
    collapseNode,
    expandAll,
    collapseAll,
    findNode,
    getNodePath,
    expandToNode,
    getVisibleNodes,
    getNodeCount,
    updateNodeData,
  };
};

export default useHierarchy;
