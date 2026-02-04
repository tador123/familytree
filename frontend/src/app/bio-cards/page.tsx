// @ts-nocheck - React types are in Docker container
'use client'

// @ts-ignore - Local component
import FamilyMemberBioCard from '@/components/FamilyMemberBioCard'
// @ts-ignore - framer-motion is installed in Docker container
import { motion } from 'framer-motion'

export default function BioCardsDemo() {
  const familyMembers = [
    {
      id: '1',
      name: 'John Smith',
      bioSnippet: 'A passionate storyteller and gardener who loves sharing tales from the past. His wisdom and gentle nature touched everyone he met.',
      profilePhoto: 'https://i.pravatar.cc/200?img=12',
      memoryGallery: [
        'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop',
      ],
      backgroundColor: 'mint' as const,
    },
    {
      id: '2',
      name: 'Mary Smith',
      bioSnippet: 'A talented musician and devoted teacher who filled our home with music and laughter. Her piano lessons were legendary in the neighborhood.',
      profilePhoto: 'https://i.pravatar.cc/200?img=47',
      memoryGallery: [
        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop',
      ],
      backgroundColor: 'lavender' as const,
    },
    {
      id: '3',
      name: 'Robert Smith',
      bioSnippet: 'An innovative engineer and tech enthusiast with a love for adventure. Always ready with a joke and a helping hand for family.',
      profilePhoto: 'https://i.pravatar.cc/200?img=33',
      memoryGallery: [
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=300&h=300&fit=crop',
      ],
      backgroundColor: 'sky' as const,
    },
    {
      id: '4',
      name: 'Sarah Smith',
      bioSnippet: 'A dedicated educator and community volunteer with a heart for helping others. Her creativity and kindness inspire everyone around her.',
      profilePhoto: 'https://i.pravatar.cc/200?img=44',
      memoryGallery: [
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=300&h=300&fit=crop',
      ],
      backgroundColor: 'rose' as const,
    },
    {
      id: '5',
      name: 'Emma Johnson',
      bioSnippet: 'A creative writer and world traveler whose stories captivate audiences. Her adventurous spirit and warmth make her unforgettable.',
      profilePhoto: 'https://i.pravatar.cc/200?img=26',
      memoryGallery: [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
      ],
      backgroundColor: 'peach' as const,
    },
    {
      id: '6',
      name: 'Thomas Brown',
      bioSnippet: 'A master chef and family recipe keeper who brings everyone together around the table. His culinary skills are legendary.',
      profilePhoto: 'https://i.pravatar.cc/200?img=14',
      memoryGallery: [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=300&h=300&fit=crop',
      ],
      backgroundColor: 'cream' as const,
    },
  ]

  const handleViewFullStory = (id: string) => {
    alert(`Viewing full story for family member ${id}`)
    // In a real app, navigate to detailed profile page
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Our Family Stories
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the unique personalities and cherished memories of our family members. 
            Hover over each card to explore their stories.
          </p>
        </motion.div>

        {/* Bio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {familyMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1,
                ease: 'easeOut'
              }}
            >
              <FamilyMemberBioCard
                {...member}
                onViewFullStory={handleViewFullStory}
              />
            </motion.div>
          ))}
        </div>

        {/* Footer Info */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="inline-block bg-white rounded-3xl shadow-soft px-8 py-6">
            <p className="text-gray-700 mb-2">
              💡 <strong>Tip:</strong> Hover over any card to see the "View Full Story" button
            </p>
            <p className="text-sm text-gray-500">
              Built with React, Next.js, Tailwind CSS, and Framer Motion
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
