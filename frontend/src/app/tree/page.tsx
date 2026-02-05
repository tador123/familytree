// @ts-nocheck - React types are in Docker container
'use client'

// @ts-ignore - next is installed in Docker container
import SimpleFamilyTree from '@/components/SimpleFamilyTree';

export default function TreePage() {
  return <SimpleFamilyTree />;
}
