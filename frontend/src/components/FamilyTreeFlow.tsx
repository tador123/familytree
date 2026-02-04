// @ts-nocheck - React types are in Docker container
'use client'

// @ts-ignore - react is installed in Docker container
import { useCallback, useEffect, useState, useMemo } from 'react';
// @ts-ignore - reactflow is installed in Docker container
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  MarkerType,
  Panel,
} from 'reactflow';
// @ts-ignore - dagre is installed in Docker container
import dagre from 'dagre';
// @ts-ignore - axios is installed in Docker container
import axios from 'axios';
// @ts-ignore - Local component
import BioCardNode, { BioCardNodeData } from './BioCardNode';
// @ts-ignore - CSS module
import 'reactflow/dist/style.css';

interface TreeNode {
  id: string;
  personId: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  profilePhoto?: string | null;
  bioSnippet?: string | null;
  personalityTags: string[];
  birthDate?: string | null;
  deathDate?: string | null;
  isLiving: boolean;
  children: TreeNode[];
  spouses: SpouseNode[];
}

interface SpouseNode {
  id: string;
  personId: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  profilePhoto?: string | null;
  bioSnippet?: string | null;
  personalityTags: string[];
  birthDate?: string | null;
  deathDate?: string | null;
  isLiving: boolean;
}

const nodeWidth = 280;
const nodeHeight = 200;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: 'TB', 
    nodesep: 80, 
    ranksep: 120,
    marginx: 50,
    marginy: 50
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const bgColors = ['pink', 'peach', 'lavender', 'mint', 'sky', 'cream', 'rose', 'sage'] as const;

export default function FamilyTreeFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const nodeTypes = useMemo(() => ({ bioCard: BioCardNode }), []);

  const handleCardClick = useCallback((id: string) => {
    console.log('Card clicked:', id);
    // Navigate to detail page or open modal
    // router.push(`/members/${id}`);
  }, []);

  const buildFlowData = useCallback((treeData: TreeNode[]) => {
    const flowNodes: Node<BioCardNodeData>[] = [];
    const flowEdges: Edge[] = [];
    let colorIndex = 0;

    const processNode = (node: TreeNode, generation: number = 0) => {
      const birthYear = node.birthDate ? new Date(node.birthDate).getFullYear() : undefined;
      const deathYear = node.deathDate ? new Date(node.deathDate).getFullYear() : undefined;
      
      // Add main person node
      flowNodes.push({
        id: node.id,
        type: 'bioCard',
        position: { x: 0, y: 0 }, // Will be set by dagre
        data: {
          id: node.id,
          name: node.preferredName || `${node.firstName} ${node.lastName}`,
          bioSnippet: node.bioSnippet || undefined,
          profilePhoto: node.profilePhoto || undefined,
          personalityTags: node.personalityTags,
          birthYear,
          deathYear,
          isLiving: node.isLiving,
          backgroundColor: bgColors[colorIndex % bgColors.length],
          onCardClick: handleCardClick,
        },
      });
      colorIndex++;

      // Add spouse nodes
      node.spouses.forEach((spouse, spouseIndex) => {
        const spouseId = `${node.id}-spouse-${spouseIndex}`;
        const spouseBirthYear = spouse.birthDate ? new Date(spouse.birthDate).getFullYear() : undefined;
        const spouseDeathYear = spouse.deathDate ? new Date(spouse.deathDate).getFullYear() : undefined;

        flowNodes.push({
          id: spouseId,
          type: 'bioCard',
          position: { x: 0, y: 0 },
          data: {
            id: spouse.id,
            name: spouse.preferredName || `${spouse.firstName} ${spouse.lastName}`,
            bioSnippet: spouse.bioSnippet || undefined,
            profilePhoto: spouse.profilePhoto || undefined,
            personalityTags: spouse.personalityTags,
            birthYear: spouseBirthYear,
            deathYear: spouseDeathYear,
            isLiving: spouse.isLiving,
            backgroundColor: bgColors[colorIndex % bgColors.length],
            onCardClick: handleCardClick,
          },
        });
        colorIndex++;

        // Add edge between person and spouse
        flowEdges.push({
          id: `${node.id}-${spouseId}`,
          source: node.id,
          target: spouseId,
          type: 'straight',
          style: { stroke: '#ec4899', strokeWidth: 3 },
          label: '💕',
          labelStyle: { fontSize: 16 },
          animated: false,
        });
      });

      // Process children
      node.children.forEach((child) => {
        // Add edge from parent to child
        flowEdges.push({
          id: `${node.id}-${child.id}`,
          source: node.id,
          target: child.id,
          type: ConnectionLineType.SmoothStep,
          animated: false,
          style: { stroke: '#6b7280', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#6b7280',
          },
        });

        // Recursively process child
        processNode(child, generation + 1);
      });
    };

    treeData.forEach(rootNode => processNode(rootNode));
    return { flowNodes, flowEdges };
  }, [handleCardClick]);

  useEffect(() => {
    const fetchFamilyTree = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/v1/family-tree');
        const treeData: TreeNode[] = response.data.data;

        if (treeData.length === 0) {
          setError('No family tree data available');
          setLoading(false);
          return;
        }

        const { flowNodes, flowEdges } = buildFlowData(treeData);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          flowNodes,
          flowEdges
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching family tree:', err);
        setError('Failed to load family tree. Please try again.');
        setLoading(false);
      }
    };

    fetchFamilyTree();
  }, [buildFlowData, setNodes, setEdges]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-xl text-gray-700">Loading Family Tree...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center bg-white rounded-3xl shadow-soft p-8 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        connectionLineType={ConnectionLineType.SmoothStep}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
        <Controls />
        
        <Panel position="top-left" className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Family Tree</h2>
          <p className="text-sm text-gray-600">
            🖱️ Drag to pan • 🔍 Scroll to zoom • 🎯 Click cards for details
          </p>
        </Panel>

        <Panel position="top-right" className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              Living
            </span>
            <span className="mx-1">•</span>
            <span className="flex items-center gap-1">
              <span className="inline-block">💕</span>
              Married
            </span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
