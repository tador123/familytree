// @ts-nocheck - React types are in Docker container
'use client'

// @ts-ignore - next is installed in Docker container
import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR issues with ReactFlow
const FamilyTreeFlow = dynamic(() => import('@/components/FamilyTreeFlow'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-xl text-gray-700">Loading Family Tree...</p>
      </div>
    </div>
  ),
});

export default function TreePage() {
  return <FamilyTreeFlow />;
}
