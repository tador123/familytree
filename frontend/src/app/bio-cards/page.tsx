// @ts-nocheck - React types are in Docker container
'use client'

// @ts-ignore - Local component
import FamilyMemberBioCard from '@/components/FamilyMemberBioCard'
// @ts-ignore - framer-motion is installed in Docker container
import { motion } from 'framer-motion'
// @ts-ignore - react is installed in Docker container
import { useState, useEffect } from 'react'
// @ts-ignore - axios is installed in Docker container
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:3002';

const BACKGROUND_COLORS = ['pink', 'peach', 'lavender', 'mint', 'sky', 'cream', 'rose', 'sage'] as const;

export default function BioCardsDemo() {
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFamilyMembersWithGallery();
  }, []);

  const fetchFamilyMembersWithGallery = async () => {
    try {
      // Fetch all family members
      const membersResponse = await axios.get(`${API_BASE_URL}/family-members`);
      const members = membersResponse.data.data || [];

      // Fetch gallery photos for each member
      const membersWithGallery = await Promise.all(
        members.map(async (member: any, index: number) => {
          let galleryPhotos: string[] = [];
          
          try {
            const galleryResponse = await axios.get(
              `${MEDIA_BASE_URL}/api/v1/media/member/${member.id}/gallery`
            );
            const photos = galleryResponse.data.data || [];
            galleryPhotos = photos.map((photo: any) => 
              `${MEDIA_BASE_URL}${photo.thumbnailPath || photo.filePath}`
            ).slice(0, 3); // Take only first 3 photos
          } catch (error) {
            console.log(`No gallery photos for ${member.firstName}`);
          }

          // Build full name
          const fullName = `${member.firstName}${member.middleName ? ' ' + member.middleName : ''} ${member.lastName}`;
          
          // Get profile photo
          const profilePhoto = member.profilePhoto?.filePath
            ? `${MEDIA_BASE_URL}${member.profilePhoto.filePath}`
            : undefined;

          // Create a bio snippet from available data
          const bioSnippet = member.biography || createBioSnippet(member);

          return {
            id: member.id,
            name: fullName,
            bioSnippet,
            profilePhoto,
            memoryGallery: galleryPhotos,
            backgroundColor: BACKGROUND_COLORS[index % BACKGROUND_COLORS.length],
          };
        })
      );

      setFamilyMembers(membersWithGallery);
    } catch (error) {
      console.error('Error fetching family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBioSnippet = (member: any): string => {
    const parts: string[] = [];
    
    if (member.birthDate) {
      const birthYear = new Date(member.birthDate).getFullYear();
      parts.push(`Born in ${birthYear}`);
    }
    
    if (member.isLiving) {
      parts.push('A cherished member of our family');
    } else if (member.deathDate) {
      const deathYear = new Date(member.deathDate).getFullYear();
      parts.push(`Lived until ${deathYear}`);
    }

    return parts.length > 0 
      ? parts.join('. ') + '. Their legacy continues to inspire us every day.'
      : 'A beloved member of our family whose memory lives on in our hearts.';
  };

  const handleViewFullStory = (id: string) => {
    // Navigate to member detail page
    window.location.href = `/members/${id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading family stories...</p>
        </div>
      </div>
    );
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

        {/* Bio Cards Grid or Empty State */}
        {familyMembers.length > 0 ? (
          <>
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
                  Showcasing {familyMembers.length} family {familyMembers.length === 1 ? 'member' : 'members'}
                </p>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-2xl mx-auto">
              <div className="text-6xl mb-6">📖</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">No Family Stories Yet</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Start building your family legacy by adding your first family member and their story.
              </p>
              <a
                href="/add-member"
                className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Add Your First Member
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
