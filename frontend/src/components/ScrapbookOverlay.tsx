// @ts-nocheck - React types are in Docker container
'use client'

// @ts-ignore - react is installed in Docker container
import { useEffect, useState } from 'react';
// @ts-ignore - framer-motion is installed in Docker container
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore - axios is installed in Docker container
import axios from 'axios';

export interface ScrapbookOverlayProps {
  memberId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface MemberDetails {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  bio?: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  deathPlace?: string;
  isLiving: boolean;
  gender?: string;
  profilePhotoId?: string;
}

interface MediaItem {
  id: string;
  filename: string;
  filePath: string;
  thumbnailPath?: string;
  title?: string;
  description?: string;
  isFeatured: boolean;
}

export default function ScrapbookOverlay({ memberId, isOpen, onClose }: ScrapbookOverlayProps) {
  const [member, setMember] = useState<MemberDetails | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [memoryGallery, setMemoryGallery] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (isOpen && memberId) {
      fetchMemberData();
    }
  }, [isOpen, memberId]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);

      // Fetch member details
      const memberResponse = await axios.get(`http://localhost:3001/api/v1/members/${memberId}`);
      const memberData = memberResponse.data.data;
      setMember(memberData);

      // Fetch profile photo if exists
      if (memberData.profilePhotoId) {
        try {
          const photoResponse = await axios.get(
            `http://localhost:3002/api/v1/media/member/${memberId}/profile-photo`,
            { responseType: 'arraybuffer' }
          );
          const photoBlob = new Blob([photoResponse.data], { type: 'image/jpeg' });
          const photoUrl = URL.createObjectURL(photoBlob);
          setProfilePhoto(photoUrl);
        } catch (photoError) {
          console.error('Error fetching profile photo:', photoError);
        }
      }

      // Fetch memory gallery
      try {
        const galleryResponse = await axios.get(
          `http://localhost:3002/api/v1/media/member/${memberId}/gallery`
        );
        setMemoryGallery(galleryResponse.data.data || []);
      } catch (galleryError) {
        console.error('Error fetching gallery:', galleryError);
        setMemoryGallery([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching member data:', error);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    onClose();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getLifeYears = () => {
    if (!member) return '';
    const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : '?';
    if (member.isLiving) return `${birthYear} - Present`;
    const deathYear = member.deathDate ? new Date(member.deathDate).getFullYear() : '?';
    return `${birthYear} - ${deathYear}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Scrapbook Modal */}
          <motion.div
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="w-full h-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">📖</div>
                  <div>
                    <h2 className="text-2xl font-bold">Family Scrapbook</h2>
                    <p className="text-emerald-100 text-sm">Memories & Stories</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500 mb-4"></div>
                      <p className="text-gray-600">Loading memories...</p>
                    </div>
                  </div>
                ) : member ? (
                  <div className="max-w-5xl mx-auto">
                    {/* Profile Section */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 md:p-8 mb-8 shadow-soft">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Profile Photo */}
                        <div className="flex-shrink-0">
                          <div className="relative w-32 h-32 md:w-40 md:h-40">
                            <div className="absolute inset-0 bg-white rounded-2xl shadow-lg" />
                            <img
                              src={profilePhoto || 'https://i.pravatar.cc/300?img=1'}
                              alt={`${member.firstName} ${member.lastName}`}
                              className="relative w-full h-full rounded-2xl object-cover z-10"
                            />
                            {member.isLiving && (
                              <div className="absolute -top-2 -right-2 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-lg z-20">
                                Living
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="text-3xl font-bold text-gray-900 mb-2">
                            {member.preferredName || `${member.firstName} ${member.lastName}`}
                          </h3>
                          {member.preferredName && (
                            <p className="text-lg text-gray-600 mb-2">
                              {member.firstName} {member.middleName && `${member.middleName} `}{member.lastName}
                            </p>
                          )}
                          <p className="text-emerald-700 font-semibold mb-4">{getLifeYears()}</p>
                          
                          {/* Birth/Death Details */}
                          <div className="space-y-2 text-sm text-gray-700">
                            {member.birthDate && (
                              <div className="flex items-start gap-2">
                                <span className="text-emerald-500">🎂</span>
                                <div>
                                  <span className="font-medium">Born:</span> {formatDate(member.birthDate)}
                                  {member.birthPlace && <span className="text-gray-500"> in {member.birthPlace}</span>}
                                </div>
                              </div>
                            )}
                            {!member.isLiving && member.deathDate && (
                              <div className="flex items-start gap-2">
                                <span className="text-gray-400">🕊️</span>
                                <div>
                                  <span className="font-medium">Passed:</span> {formatDate(member.deathDate)}
                                  {member.deathPlace && <span className="text-gray-500"> in {member.deathPlace}</span>}
                                </div>
                              </div>
                            )}
                            {member.gender && (
                              <div className="flex items-start gap-2">
                                <span>{member.gender === 'Male' ? '👨' : member.gender === 'Female' ? '👩' : '🧑'}</span>
                                <div>
                                  <span className="font-medium">Gender:</span> {member.gender}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Biography */}
                      {member.bio && (
                        <div className="mt-6 pt-6 border-t border-emerald-200">
                          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span>📝</span>
                            Life Story
                          </h4>
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {member.bio}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Memory Gallery */}
                    <div className="mb-8">
                      <h4 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>📸</span>
                        Memory Gallery
                      </h4>
                      
                      {memoryGallery.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {memoryGallery.map((image) => (
                            <motion.div
                              key={image.id}
                              className="relative aspect-square rounded-xl overflow-hidden shadow-md cursor-pointer group"
                              whileHover={{ scale: 1.05 }}
                              onClick={() => setSelectedImage(image)}
                            >
                              <img
                                src={`http://localhost:3002${image.thumbnailPath || image.filePath}`}
                                alt={image.title || 'Memory'}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                <p className="text-white text-sm font-medium line-clamp-2">
                                  {image.title || 'Click to view'}
                                </p>
                              </div>
                              {image.isFeatured && (
                                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                                  ⭐
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl">
                          <div className="text-6xl mb-4">📷</div>
                          <p className="text-gray-500">No photos in gallery yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4">⚠️</div>
                      <p className="text-gray-600">Failed to load member data</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Image Lightbox */}
          <AnimatePresence>
            {selectedImage && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/90 z-[60]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedImage(null)}
                />
                <motion.div
                  className="fixed inset-0 z-[70] flex items-center justify-center p-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className="relative max-w-5xl max-h-full">
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white text-2xl"
                    >
                      ×
                    </button>
                    <img
                      src={`http://localhost:3002${selectedImage.filePath}`}
                      alt={selectedImage.title || 'Memory'}
                      className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl"
                    />
                    {(selectedImage.title || selectedImage.description) && (
                      <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-4 text-white">
                        {selectedImage.title && (
                          <h5 className="font-bold text-lg mb-1">{selectedImage.title}</h5>
                        )}
                        {selectedImage.description && (
                          <p className="text-sm text-white/80">{selectedImage.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
