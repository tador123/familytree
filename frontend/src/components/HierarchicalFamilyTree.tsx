// @ts-nocheck - React types are in Docker container
'use client';

// @ts-ignore - react is installed in Docker container
import { useState, useEffect, useMemo } from 'react';
// @ts-ignore - next is installed in Docker container
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  deathDate?: string;
  isLiving?: boolean;
  profilePhotoId?: string;
  profilePhoto?: {
    id: string;
    filePath: string;
    thumbnailPath?: string;
  };
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
}

interface TreeNode extends FamilyMember {
  children: TreeNode[];
  spouse?: FamilyMember;
}

/**
 * Build a hierarchical tree structure from a flat list of family members
 * 
 * Algorithm:
 * 1. Find all root members (those whose parents are not in the member list)
 * 2. For each root member, recursively find their children
 * 3. Children are identified by matching their fatherId or motherId to member.id
 * 4. Prevent circular references (a person cannot be their own ancestor)
 * 
 * @param members - Flat array of all family members
 * @returns Array of root-level TreeNode objects with nested children
 */
const buildFamilyTree = (members: FamilyMember[]): TreeNode[] => {
  if (!members || members.length === 0) return [];

  // Create a lookup map for quick access
  const memberMap = new Map<string, FamilyMember>();
  members.forEach(member => {
    memberMap.set(member.id, member);
  });

  // Helper function to get all children of a given member
  const getChildren = (parentId: string, visited: Set<string> = new Set()): TreeNode[] => {
    // Prevent circular references
    if (visited.has(parentId)) {
      console.warn(`Circular reference detected for member ${parentId}`);
      return [];
    }

    visited.add(parentId);

    // Find all members who have this person as a parent
    const children = members.filter(member => 
      (member.fatherId === parentId || member.motherId === parentId)
    );

    // Recursively build tree nodes for children
    return children.map(child => ({
      ...child,
      children: getChildren(child.id, new Set(visited)),
      spouse: child.spouseId ? memberMap.get(child.spouseId) : undefined
    }));
  };

  // Find root members: those whose parents are not in the member list
  // OR those who have no parent IDs set
  const rootMembers = members.filter(member => {
    const hasFather = member.fatherId && memberMap.has(member.fatherId);
    const hasMother = member.motherId && memberMap.has(member.motherId);
    
    // Root if no parents specified OR parents not in the system
    return !hasFather && !hasMother;
  });

  // Remove duplicate spouses from root members
  // If both spouses are roots, only include one of them
  const processedRootIds = new Set<string>();
  const deduplicatedRoots = rootMembers.filter(member => {
    if (processedRootIds.has(member.id)) {
      return false; // Skip if already processed
    }
    
    processedRootIds.add(member.id);
    
    // If this member has a spouse who is also a root, mark spouse as processed
    if (member.spouseId && memberMap.has(member.spouseId)) {
      const spouse = memberMap.get(member.spouseId);
      const spouseIsRoot = spouse && !spouse.fatherId && !spouse.motherId;
      if (spouseIsRoot) {
        processedRootIds.add(member.spouseId);
      }
    }
    
    return true;
  });

  // Build tree for each root member
  const trees = deduplicatedRoots.map(root => ({
    ...root,
    children: getChildren(root.id),
    spouse: root.spouseId ? memberMap.get(root.spouseId) : undefined
  }));

  return trees;
};

/**
 * MemberCard Component
 * Displays a single family member as a card
 */
const MemberCard = ({ member, onClick }: { member: FamilyMember; onClick: () => void }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  const getLifespan = () => {
    const birth = formatDate(member.birthDate);
    const death = member.isLiving ? 'Present' : formatDate(member.deathDate);
    return birth && death ? `${birth} - ${death}` : birth || death || '';
  };

  const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL || '';
  const profileImageUrl = member.profilePhoto?.filePath 
    ? `${MEDIA_BASE_URL}${member.profilePhoto.filePath}` 
    : null;

  return (
    <div
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 w-48 sm:w-56 md:w-64"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          {profileImageUrl ? (
            <img 
              src={profileImageUrl} 
              alt={`${member.firstName} ${member.lastName}`}
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-bold ${profileImageUrl ? 'hidden' : ''}`}>
            {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
          </div>
          {member.isLiving && (
            <span className="flex items-center text-green-600 text-xs font-semibold">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
              Living
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-gray-800 mb-1 line-clamp-2">
          {member.firstName} {member.middleName && `${member.middleName} `}
          {member.lastName}
        </h3>

        {getLifespan() && (
          <p className="text-sm text-gray-600">{getLifespan()}</p>
        )}

        <div className="border-t border-gray-200 pt-2 mt-2 text-xs text-gray-500">
          Tap to view details
        </div>
      </div>
    </div>
  );
};

/**
 * TreeNodeComponent
 * Recursively renders a tree node and its children with visual connections
 * 
 * Visual Structure:
 * - Parent card(s) at top
 * - Vertical line down from parent(s)
 * - Horizontal line connecting siblings
 * - Vertical lines down to each child
 * - Children arranged horizontally
 */
const TreeNodeComponent = ({ 
  node, 
  onMemberClick,
  isRoot = false 
}: { 
  node: TreeNode; 
  onMemberClick: (member: FamilyMember) => void;
  isRoot?: boolean;
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const hasSpouse = node.spouse !== undefined;

  return (
    <div className="flex flex-col items-center">
      {/* Parent Level - Show member and spouse side by side if exists */}
      <div className="flex items-start gap-2 sm:gap-4 mb-4 sm:mb-6">
        <MemberCard member={node} onClick={() => onMemberClick(node)} />
        
        {hasSpouse && (
          <>
            <div className="flex items-center">
              <div className="h-0.5 w-4 sm:w-8 bg-rose-300"></div>
              <div className="text-rose-500 text-lg sm:text-xl mx-1 sm:mx-2">♥</div>
              <div className="h-0.5 w-4 sm:w-8 bg-rose-300"></div>
            </div>
            <MemberCard member={node.spouse} onClick={() => onMemberClick(node.spouse!)} />
          </>
        )}
      </div>

      {/* Connection line down from parent(s) to children */}
      {hasChildren && (
        <div className="flex flex-col items-center">
          {/* Vertical line from parent(s) */}
          <div className="w-0.5 h-4 sm:h-8 bg-emerald-300"></div>
          
          {/* Horizontal line connecting all children */}
          {node.children.length > 1 && (
            <div className="relative">
              <div className="h-0.5 bg-emerald-300" style={{ width: `${(node.children.length - 1) * (window.innerWidth < 640 ? 200 : window.innerWidth < 768 ? 240 : 320)}px` }}></div>
              {/* Vertical lines down to each child */}
              <div className="absolute top-0 left-0 right-0 flex justify-around">
                {node.children.map((_, index) => (
                  <div key={index} className="w-0.5 h-4 sm:h-8 bg-emerald-300"></div>
                ))}
              </div>
            </div>
          )}
          
          {/* Single vertical line for single child */}
          {node.children.length === 1 && (
            <div className="w-0.5 h-4 sm:h-8 bg-emerald-300"></div>
          )}
        </div>
      )}

      {/* Children Level - Rendered recursively */}
      {hasChildren && (
        <div className="flex gap-4 sm:gap-6 md:gap-8 mt-0">
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              onMemberClick={onMemberClick}
              isRoot={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Main HierarchicalFamilyTree Component
 * 
 * Features:
 * - Fetches family members from API
 * - Builds hierarchical tree structure
 * - Renders tree with visual parent-child connections
 * - Auto-updates when new members are added
 * - Displays member details in modal
 */
export default function HierarchicalFamilyTree() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const { isLoading: authLoading } = useAuth();

  const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL || '';

  // Helper function to get member name by ID
  const getMemberNameById = (memberId: string | undefined): string => {
    if (!memberId) return 'Unknown';
    const member = members.find(m => m.id === memberId);
    if (!member) return 'Unknown';
    return `${member.firstName}${member.middleName ? ' ' + member.middleName : ''} ${member.lastName}`;
  };

  // Lightbox navigation functions
  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : galleryPhotos.length - 1));
  };

  const goToNextPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev < galleryPhotos.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevPhoto();
      if (e.key === 'ArrowRight') goToNextPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, galleryPhotos.length]);

  // Fetch members from API
  useEffect(() => {
    if (!authLoading) {
      fetchMembers();
    }
  }, [authLoading]);

  // Fetch gallery photos when selected member changes
  useEffect(() => {
    if (selectedMember) {
      fetchGalleryPhotos(selectedMember.id);
    } else {
      setGalleryPhotos([]);
    }
  }, [selectedMember]);

  const fetchMembers = async () => {
    try {
      console.log('[HierarchicalFamilyTree] Fetching from:', `${API_BASE_URL}/family-members`);
      const response = await axios.get(`${API_BASE_URL}/family-members`);
      console.log('[HierarchicalFamilyTree] Response:', response.data);
      setMembers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryPhotos = async (memberId: string) => {
    setLoadingGallery(true);
    try {
      console.log('[HierarchicalFamilyTree] Fetching gallery for member:', memberId);
      const response = await axios.get(`${MEDIA_BASE_URL}/api/v1/media/member/${memberId}/gallery`);
      console.log('[HierarchicalFamilyTree] Gallery response:', response.data);
      setGalleryPhotos(response.data.data || []);
    } catch (error) {
      console.error('Error fetching gallery photos:', error);
      setGalleryPhotos([]);
    } finally {
      setLoadingGallery(false);
    }
  };

  // Build tree structure whenever members change
  // This ensures the tree updates when new members are added
  const familyTrees = useMemo(() => {
    return buildFamilyTree(members);
  }, [members]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mb-4"></div>
          <p className="text-xl text-gray-700">Loading Family Tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-2 sm:p-4 md:p-8">
      <div className="max-w-[98vw] sm:max-w-[95vw] mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">Family Tree</h1>
          <p className="text-sm sm:text-base text-gray-600">Hierarchical view showing parent-child relationships</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            {members.length} member{members.length !== 1 ? 's' : ''} • {familyTrees.length} famil{familyTrees.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>

        {/* Show helpful message if all members are roots (no relationships) */}
        {familyTrees.length > 3 && familyTrees.every(tree => tree.children.length === 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 mb-1">No Family Relationships Found</h4>
                <p className="text-sm text-amber-800 mb-2">
                  All {familyTrees.length} members are shown as separate individuals because no parent-child relationships have been set.
                </p>
                <p className="text-sm text-amber-800 mb-2">
                  <strong>To create a family tree structure:</strong>
                </p>
                <ol className="text-sm text-amber-800 space-y-1 ml-4 list-decimal">
                  <li>Click on a member card below and select <strong>"Edit"</strong></li>
                  <li>In the edit form, select their <strong>Father</strong> and/or <strong>Mother</strong> from existing members</li>
                  <li>Save the changes - the member will automatically link to their parents</li>
                  <li>Repeat for other family members to build your tree</li>
                </ol>
                <p className="text-xs text-amber-700 mt-2">
                  💡 Tip: Start by connecting children to parents, then grandchildren to their parents, etc.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tree Visualization */}
        {familyTrees.length > 0 ? (
          <div className="overflow-x-auto pb-4 sm:pb-8">
            {/* Show as grid if many unconnected roots */}
            {familyTrees.length > 6 && familyTrees.every(tree => tree.children.length === 0) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {familyTrees.map((tree) => (
                  <div key={tree.id} className="flex justify-center">
                    <MemberCard member={tree} onClick={() => setSelectedMember(tree)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="inline-flex flex-col gap-8 sm:gap-12 md:gap-16 min-w-full justify-center">
                {familyTrees.map((tree) => (
                  <div key={tree.id} className="flex justify-center">
                    <TreeNodeComponent 
                      node={tree} 
                      onMemberClick={setSelectedMember}
                      isRoot={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Family Members Yet</h3>
            <p className="text-base text-gray-500 mb-6">Start building your family tree by adding members</p>
            <a
              href="/add-member"
              className="inline-block px-8 py-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 active:bg-emerald-700 font-semibold"
            >
              Add First Member
            </a>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 sm:mt-12 bg-white rounded-xl shadow-md p-4 sm:p-6 max-w-3xl mx-auto">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
            {familyTrees.every(tree => tree.children.length === 0) 
              ? "How to Build Your Family Tree" 
              : "How the Tree Works"}
          </h3>
          
          {familyTrees.every(tree => tree.children.length === 0) ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                You have {members.length} family member{members.length !== 1 ? 's' : ''} but no relationships set up yet. Here's how to connect them:
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-semibold text-emerald-900 mb-2 text-sm">Step-by-Step Guide:</h4>
                <ol className="space-y-2 text-sm text-gray-700 ml-4 list-decimal">
                  <li>
                    <strong>Add Parents First:</strong> If you don't have parent members yet, add them via{' '}
                    <a href="/add-member" className="text-emerald-600 hover:text-emerald-700 underline">Add Member</a>
                  </li>
                  <li>
                    <strong>Link Children to Parents:</strong> Click any member card → "Edit" → Select their father/mother from the dropdown menus
                  </li>
                  <li>
                    <strong>Set Spouses (Optional):</strong> In the edit form, you can also link spouses together
                  </li>
                  <li>
                    <strong>Watch the Tree Build:</strong> As you save relationships, the tree structure will automatically appear!
                  </li>
                </ol>
              </div>
              <p className="text-xs text-gray-600 italic">
                Example: If "John Smith" and "Mary Smith" are parents of "Robert Smith", edit Robert's profile and select John as father and Mary as mother. Robert will then appear under John and Mary in the tree view.
              </p>
            </div>
          ) : (
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">•</span>
                <span><strong>Root members</strong> appear at the top (those without parents in the system)</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">•</span>
                <span><strong>Children</strong> are shown below their parents with connecting lines</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">•</span>
                <span><strong>Spouses</strong> are displayed side-by-side with a heart symbol</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">•</span>
                <span><strong>Add relationships</strong> by editing a member and selecting their parents</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-2">•</span>
                <span><strong>Click any card</strong> to view detailed information</span>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 pr-4">
                {selectedMember.firstName} {selectedMember.middleName && `${selectedMember.middleName} `}
                {selectedMember.lastName}
              </h2>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-500 hover:text-gray-700 p-2 -mr-2 flex-shrink-0"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex items-center">
                {selectedMember.isLiving ? (
                  <span className="flex items-center text-green-600 font-semibold text-sm sm:text-base">
                    <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Living
                  </span>
                ) : (
                  <span className="text-gray-500 text-sm sm:text-base">Deceased</span>
                )}
              </div>

              {selectedMember.birthDate && (
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-500">Birth Date: </span>
                  <span className="text-gray-800">{new Date(selectedMember.birthDate).toLocaleDateString()}</span>
                </div>
              )}

              {!selectedMember.isLiving && selectedMember.deathDate && (
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-500">Death Date: </span>
                  <span className="text-gray-800">{new Date(selectedMember.deathDate).toLocaleDateString()}</span>
                </div>
              )}

              {/* Relationship Status */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm">Family Relationships:</h3>
                
                {!selectedMember.fatherId && !selectedMember.motherId && !selectedMember.spouseId ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800 mb-2">
                      ⚠️ <strong>No relationships set</strong>
                    </p>
                    <p className="text-xs text-amber-700">
                      Click "Edit" below to link this person to their parents, or add a spouse.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    {selectedMember.fatherId && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span className="text-gray-600">Father:</span>
                        <span className="text-gray-800 font-medium">{getMemberNameById(selectedMember.fatherId)}</span>
                      </div>
                    )}
                    
                    {selectedMember.motherId && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span className="text-gray-600">Mother:</span>
                        <span className="text-gray-800 font-medium">{getMemberNameById(selectedMember.motherId)}</span>
                      </div>
                    )}
                    
                    {selectedMember.spouseId && (
                      <div className="flex items-center gap-2">
                        <span className="text-rose-500">♥</span>
                        <span className="text-gray-600">Spouse:</span>
                        <span className="text-gray-800 font-medium">{getMemberNameById(selectedMember.spouseId)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Memory Gallery Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm">Memory Gallery:</h3>
                
                {loadingGallery ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-emerald-500"></div>
                  </div>
                ) : galleryPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {galleryPhotos.map((photo: any, index: number) => {
                      const imageUrl = photo.thumbnailPath 
                        ? `${MEDIA_BASE_URL}${photo.thumbnailPath}`
                        : `${MEDIA_BASE_URL}${photo.filePath}`;
                      
                      return (
                        <div key={photo.id} className="relative group">
                          <img
                            src={imageUrl}
                            alt={photo.title || photo.filename}
                            className="w-full h-24 sm:h-32 object-cover rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => openLightbox(index)}
                          />
                          {photo.title && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              {photo.title}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">No gallery photos yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              {!selectedMember.fatherId && !selectedMember.motherId ? (
                <a
                  href={`/members/${selectedMember.id}/edit`}
                  className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 active:bg-emerald-700 text-center font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Relationships
                </a>
              ) : (
                <>
                  <a
                    href={`/members/${selectedMember.id}`}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center font-semibold text-sm sm:text-base"
                  >
                    View Profile
                  </a>
                  <a
                    href={`/members/${selectedMember.id}/edit`}
                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 active:bg-emerald-700 text-center font-semibold text-sm sm:text-base"
                  >
                    Edit
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Gallery Photos */}
      {lightboxOpen && galleryPhotos.length > 0 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60]"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-300 z-10"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          <button
            onClick={(e) => { e.stopPropagation(); goToPrevPhoto(); }}
            className="absolute left-2 sm:left-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2 sm:p-3 hover:bg-opacity-75 transition-all"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Image */}
          <div className="max-w-7xl max-h-[90vh] mx-auto px-12 sm:px-16" onClick={(e) => e.stopPropagation()}>
            <img
              src={`${MEDIA_BASE_URL}${galleryPhotos[selectedPhotoIndex].filePath}`}
              alt={galleryPhotos[selectedPhotoIndex].title || galleryPhotos[selectedPhotoIndex].filename}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            {galleryPhotos[selectedPhotoIndex].title && (
              <div className="text-center mt-2 sm:mt-4 text-white text-base sm:text-lg">
                {galleryPhotos[selectedPhotoIndex].title}
              </div>
            )}
            <div className="text-center mt-1 sm:mt-2 text-gray-400 text-xs sm:text-sm">
              {selectedPhotoIndex + 1} / {galleryPhotos.length}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => { e.stopPropagation(); goToNextPhoto(); }}
            className="absolute right-2 sm:right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2 sm:p-3 hover:bg-opacity-75 transition-all"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
