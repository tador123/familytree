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
// @ts-ignore - Local component
import ScrapbookOverlay from './ScrapbookOverlay';
// @ts-ignore - CSS module
import 'reactflow/dist/style.css';

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  bio?: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  deathPlace?: string;
  isLiving: boolean;
  gender?: string;
  profilePhotoId?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
}

interface MemberWithPhoto extends FamilyMember {
  profilePhotoUrl?: string;
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
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const nodeTypes = useMemo(() => ({ bioCard: BioCardNode }), []);

  const handleCardClick = useCallback((id: string) => {
    console.log('Card clicked:', id);
    setSelectedMemberId(id);
    setIsOverlayOpen(true);
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setIsOverlayOpen(false);
    setSelectedMemberId(null);
  }, []);

  const buildFlowData = useCallback((members: MemberWithPhoto[]) => {
    const flowNodes: Node<BioCardNodeData>[] = [];
    const flowEdges: Edge[] = [];
    const addedNodes = new Set<string>();
    let colorIndex = 0;

    // Create nodes for all members
    members.forEach((member) => {
      if (addedNodes.has(member.id)) return;
      
      const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : undefined;
      const deathYear = member.deathDate ? new Date(member.deathDate).getFullYear() : undefined;
      
      flowNodes.push({
        id: member.id,
        type: 'bioCard',
        position: { x: 0, y: 0 }, // Will be set by dagre
        data: {
          id: member.id,
          name: `${member.firstName} ${member.lastName}`,
          bioSnippet: member.bio ? member.bio.substring(0, 100) : undefined,
          profilePhoto: member.profilePhotoUrl,
          personalityTags: [],
          birthYear,
          deathYear,
          isLiving: member.isLiving,
          backgroundColor: bgColors[colorIndex % bgColors.length],
          onCardClick: handleCardClick,
        },
      });
      addedNodes.add(member.id);
      colorIndex++;
    });

    // Create edges based on relationships
    members.forEach((member) => {
      // Parent-child relationship (father)
      if (member.fatherId && addedNodes.has(member.fatherId)) {
        const edgeId = `${member.fatherId}-${member.id}`;
        if (!flowEdges.find(e => e.id === edgeId)) {
          flowEdges.push({
            id: edgeId,
            source: member.fatherId,
            target: member.id,
            type: ConnectionLineType.SmoothStep,
            animated: false,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            label: 'Father',
            labelStyle: { fontSize: 10, fill: '#3b82f6' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#3b82f6',
            },
          });
        }
      }

      // Parent-child relationship (mother)
      if (member.motherId && addedNodes.has(member.motherId)) {
        const edgeId = `${member.motherId}-${member.id}`;
        if (!flowEdges.find(e => e.id === edgeId)) {
          flowEdges.push({
            id: edgeId,
            source: member.motherId,
            target: member.id,
            type: ConnectionLineType.SmoothStep,
            animated: false,
            style: { stroke: '#ec4899', strokeWidth: 2 },
            label: 'Mother',
            labelStyle: { fontSize: 10, fill: '#ec4899' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#ec4899',
            },
          });
        }
      }

      // Spouse relationship
      if (member.spouseId && addedNodes.has(member.spouseId)) {
        const edgeId1 = `${member.id}-${member.spouseId}`;
        const edgeId2 = `${member.spouseId}-${member.id}`;
        if (!flowEdges.find(e => e.id === edgeId1 || e.id === edgeId2)) {
          flowEdges.push({
            id: edgeId1,
            source: member.id,
            target: member.spouseId,
            type: 'straight',
            style: { stroke: '#f43f5e', strokeWidth: 3 },
            label: '💕',
            labelStyle: { fontSize: 16 },
            animated: false,
          });
        }
      }
    });

    return { flowNodes, flowEdges };
  }, [handleCardClick]);

  useEffect(() => {
    const fetchFamilyTree = async () => {
      try {
        setLoading(true);

        // Fetch all family members
        const membersResponse = await axios.get('http://localhost:3001/api/v1/members');
        const members: FamilyMember[] = membersResponse.data.data;

        if (members.length === 0) {
          setError('No family members found. Add members to see the tree.');
          setLoading(false);
          return;
        }

        // Fetch profile photos for members with profilePhotoId
        const membersWithPhotos: MemberWithPhoto[] = await Promise.all(
          members.map(async (member) => {
            if (member.profilePhotoId) {
              try {
                const photoResponse = await axios.get(
                  `http://localhost:3002/api/v1/media/member/${member.id}/profile-photo`,
                  { responseType: 'arraybuffer' }
                );
                const photoBlob = new Blob([photoResponse.data], { type: 'image/jpeg' });
                const photoUrl = URL.createObjectURL(photoBlob);
                return { ...member, profilePhotoUrl: photoUrl };
              } catch (photoError) {
                console.error(`Error fetching photo for ${member.id}:`, photoError);
                return member;
              }
            }
            return member;
          })
        );

        const { flowNodes, flowEdges } = buildFlowData(membersWithPhotos);
        
        if (flowNodes.length === 0) {
          setError('No family members to display');
          setLoading(false);
          return;
        }

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          flowNodes,
          flowEdges
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching family tree:', err);
        setError('Failed to load family tree. Please ensure API service is running.');
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
    <>
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
              🖱️ Drag to pan • 🔍 Scroll to zoom • 🎯 Click cards for scrapbook
            </p>
          </Panel>

          <Panel position="top-right" className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-3">
            <div className="flex flex-col gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                <span>Living</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💕</span>
                <span>Spouse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-3 h-0.5 bg-blue-500"></div>
                  <div className="w-0 h-0 border-l-4 border-t-2 border-b-2 border-l-blue-500 border-t-transparent border-b-transparent"></div>
                </div>
                <span>Father</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-3 h-0.5 bg-pink-500"></div>
                  <div className="w-0 h-0 border-l-4 border-t-2 border-b-2 border-l-pink-500 border-t-transparent border-b-transparent"></div>
                </div>
                <span>Mother</span>
              </div>
            </div>
          </Panel>

          <Panel position="bottom-right" className="bg-emerald-500 text-white rounded-2xl shadow-soft p-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{nodes.length}</div>
              <div className="text-xs">Family Members</div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Scrapbook Overlay */}
      {selectedMemberId && (
        <ScrapbookOverlay
          memberId={selectedMemberId}
          isOpen={isOverlayOpen}
          onClose={handleCloseOverlay}
        />
      )}
    </>
  );
}
