// @ts-nocheck - React types are in Docker container
'use client'

// @ts-ignore - next is installed in Docker container
import HierarchicalFamilyTree from '@/components/HierarchicalFamilyTree';

export default function TreePage() {
  return <HierarchicalFamilyTree />;
}
