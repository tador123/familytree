// @ts-nocheck - React types are in Docker container
'use client'

// @ts-ignore - framer-motion is installed in Docker container
import { motion } from 'framer-motion'
// @ts-ignore - react is installed in Docker container
import { useState } from 'react'
// @ts-ignore - clsx is installed in Docker container
import clsx from 'clsx'

export interface FamilyMemberBioCardProps {
  id: string
  name: string
  bioSnippet: string
  profilePhoto?: string
  memoryGallery?: string[]
  backgroundColor?: 'pink' | 'peach' | 'lavender' | 'mint' | 'sky' | 'cream' | 'rose' | 'sage'
  onViewFullStory?: (id: string) => void
  className?: string
}

export default function FamilyMemberBioCard({
  id,
  name,
  bioSnippet,
  profilePhoto = '/placeholder-avatar.png',
  memoryGallery = [],
  backgroundColor = 'peach',
  onViewFullStory,
  className,
}: FamilyMemberBioCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Fill gallery with placeholders if needed
  const galleryImages = [...memoryGallery, ...Array(3 - memoryGallery.length).fill('/placeholder-memory.png')].slice(0, 3)

  // Pastel background colors
  const bgColors = {
    pink: 'bg-pastel-pink',
    peach: 'bg-pastel-peach',
    lavender: 'bg-pastel-lavender',
    mint: 'bg-pastel-mint',
    sky: 'bg-pastel-sky',
    cream: 'bg-pastel-cream',
    rose: 'bg-pastel-rose',
    sage: 'bg-pastel-sage',
  }

  const handleViewFullStory = () => {
    if (onViewFullStory) {
      onViewFullStory(id)
    }
  }

  return (
    <motion.div
      className={clsx(
        'relative overflow-hidden rounded-4xl shadow-soft transition-shadow duration-300',
        bgColors[backgroundColor],
        'cursor-pointer',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.03,
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}
      transition={{ 
        duration: 0.3,
        ease: 'easeOut'
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* SVG Filter for hand-drawn effect */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="hand-drawn-border">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>
      </svg>

      <div className="p-6 sm:p-8">
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            className="relative"
            animate={{ 
              rotate: isHovered ? [0, -1, 1, -1, 0] : 0 
            }}
            transition={{ 
              duration: 0.5,
              ease: 'easeInOut'
            }}
          >
            {/* Hand-drawn border effect */}
            <div className="absolute inset-0 rounded-full border-2 border-black/10 transform rotate-1"></div>
            <div className="absolute inset-0 rounded-full border-2 border-black/10 transform -rotate-1"></div>
            
            {/* Profile Photo */}
            <motion.div
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-white shadow-md ring-4 ring-white"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={profilePhoto}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="40"%3E👤%3C/text%3E%3C/svg%3E'
                }}
              />
            </motion.div>
          </motion.div>

          {/* Name */}
          <motion.h3
            className="mt-4 text-2xl sm:text-3xl font-bold text-gray-800 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {name}
          </motion.h3>
        </div>

        {/* Bio Snippet */}
        <motion.p
          className="text-gray-700 text-center text-sm sm:text-base leading-relaxed mb-6 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {bioSnippet}
        </motion.p>

        {/* Memory Gallery */}
        <div className="mb-6">
          <h4 className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-3 text-center">
            Memory Gallery
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                className="aspect-square rounded-2xl overflow-hidden bg-white shadow-sm ring-2 ring-white"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.1,
                  zIndex: 10,
                  transition: { duration: 0.2 }
                }}
              >
                <img
                  src={image}
                  alt={`Memory ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext fill="%23ccc" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="40"%3E📷%3C/text%3E%3C/svg%3E'
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* View Full Story Button (appears on hover) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10
          }}
          transition={{ duration: 0.3 }}
          className="flex justify-center"
        >
          <motion.button
            onClick={handleViewFullStory}
            className="px-6 py-3 bg-white text-gray-800 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-2">
              <span>View Full Story</span>
              <motion.span
                animate={{ x: isHovered ? [0, 3, 0] : 0 }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                →
              </motion.span>
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* Decorative corner accent */}
      <motion.div
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      />
      <motion.div
        className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-white/30"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
      />
    </motion.div>
  )
}
