// @ts-nocheck - React types are in Docker container
'use client'

// @ts-ignore - react is installed in Docker container
import { memo } from 'react';
// @ts-ignore - reactflow is installed in Docker container
import { Handle, Position, NodeProps } from 'reactflow';
// @ts-ignore - framer-motion is installed in Docker container
import { motion } from 'framer-motion';
// @ts-ignore - clsx is installed in Docker container
import clsx from 'clsx';

export interface BioCardNodeData {
  id: string;
  name: string;
  bioSnippet?: string;
  profilePhoto?: string;
  personalityTags: string[];
  birthYear?: number;
  deathYear?: number;
  isLiving: boolean;
  backgroundColor?: 'pink' | 'peach' | 'lavender' | 'mint' | 'sky' | 'cream' | 'rose' | 'sage';
  onCardClick?: (id: string) => void;
}

function BioCardNode({ data, selected }: NodeProps<BioCardNodeData>) {
  const bgColors = {
    pink: 'bg-pastel-pink',
    peach: 'bg-pastel-peach',
    lavender: 'bg-pastel-lavender',
    mint: 'bg-pastel-mint',
    sky: 'bg-pastel-sky',
    cream: 'bg-pastel-cream',
    rose: 'bg-pastel-rose',
    sage: 'bg-pastel-sage',
  };

  const bgColor = bgColors[data.backgroundColor || 'peach'];
  const displayedTags = data.personalityTags.slice(0, 2);
  const lifeYears = data.birthYear 
    ? `${data.birthYear}${data.isLiving ? ' - Present' : data.deathYear ? ` - ${data.deathYear}` : ''}` 
    : '';

  return (
    <>
      {/* Input Handle (for parent connections) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#9ca3af',
          width: 10,
          height: 10,
          border: '2px solid white'
        }}
      />

      <motion.div
        className={clsx(
          'w-64 rounded-4xl shadow-soft overflow-hidden cursor-pointer transition-all',
          bgColor,
          selected && 'ring-4 ring-blue-400'
        )}
        whileHover={{ scale: 1.05 }}
        onClick={() => data.onCardClick?.(data.id)}
      >
        {/* Card Header with Photo */}
        <div className="p-4 flex items-center gap-3">
          <div className="relative w-16 h-16 flex-shrink-0">
            <div className="absolute inset-0 bg-white rounded-full shadow-md" />
            <img
              src={data.profilePhoto || '/placeholder-avatar.png'}
              alt={data.name}
              className="relative w-full h-full rounded-full object-cover z-10"
            />
            {data.isLiving && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white z-20" 
                   title="Living" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">
              {data.name}
            </h3>
            {lifeYears && (
              <p className="text-xs text-gray-600 mt-0.5">{lifeYears}</p>
            )}
          </div>
        </div>

        {/* Bio Snippet */}
        {data.bioSnippet && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
              {data.bioSnippet}
            </p>
          </div>
        )}

        {/* Personality Tags */}
        {displayedTags.length > 0 && (
          <div className="px-4 pb-4 flex gap-1.5 flex-wrap">
            {displayedTags.map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-0.5 bg-white/60 rounded-full text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
            {data.personalityTags.length > 2 && (
              <span className="inline-block px-2 py-0.5 bg-white/60 rounded-full text-xs text-gray-500">
                +{data.personalityTags.length - 2}
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Output Handle (for children connections) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#9ca3af',
          width: 10,
          height: 10,
          border: '2px solid white'
        }}
      />
    </>
  );
}

export default memo(BioCardNode);
