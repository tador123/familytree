'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:3002/api/v1';

console.log('[AddMemberForm] API_BASE_URL:', API_BASE_URL);
console.log('[AddMemberForm] MEDIA_BASE_URL:', MEDIA_BASE_URL);

// Form data interface
interface AddMemberFormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  deathDate?: string;
  deathTime?: string;
  deathPlace?: string;
  isLiving?: boolean;
  bio?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  profilePhoto?: File;
  galleryPhotos?: File[];
}

// Family member interface
interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
}

// Step indicator component
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <React.Fragment key={step}>
          <motion.div
            initial={false}
            animate={{
              scale: currentStep === step ? 1.1 : 1,
              backgroundColor: currentStep >= step ? '#10b981' : '#e5e7eb',
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full text-white font-semibold shadow-md"
          >
            {step}
          </motion.div>
          {step < totalSteps && (
            <motion.div
              initial={false}
              animate={{
                backgroundColor: currentStep > step ? '#10b981' : '#e5e7eb',
              }}
              className="w-16 h-1 mx-2"
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Profile photo uploader component
const ProfilePhotoUploader = ({ 
  onFileSelect, 
  preview 
}: { 
  onFileSelect: (file: File) => void; 
  preview?: string;
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
  });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="space-y-3">
            <img 
              src={preview} 
              alt="Profile preview" 
              className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg"
            />
            <p className="text-sm text-gray-600">Click or drag to change photo</p>
          </div>
        ) : (
          <div className="space-y-3">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-xs">PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Gallery photos uploader component
const GalleryPhotosUploader = ({ 
  onFilesSelect, 
  files 
}: { 
  onFilesSelect: (files: File[]) => void; 
  files: File[];
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxFiles: 10,
    onDrop: (acceptedFiles) => {
      onFilesSelect([...files, ...acceptedFiles].slice(0, 10));
    },
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesSelect(newFiles);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Memory Gallery Photos <span className="text-xs text-gray-500">(Max 10)</span>
      </label>
      <motion.div
        whileHover={{ scale: 1.01 }}
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'
        }`}
      >
        <input {...getInputProps()} />
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500">{files.length}/10 files selected</p>
      </motion.div>

      {/* Preview grid */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 mt-4"
        >
          {files.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Gallery ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg shadow-md"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

// Main component
export default function AddMemberForm({ onSuccess }: { onSuccess?: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [galleryPhotos, setGalleryPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Debug current step
  console.log('AddMemberForm render - currentStep:', currentStep, 'isSubmitting:', isSubmitting);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<AddMemberFormData>();

  // Fetch existing family members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/members`);
        if (response.data.success) {
          setFamilyMembers(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching family members:', error);
      }
    };
    fetchMembers();
  }, []);

  // Handle profile photo selection
  const handleProfilePhotoSelect = (file: File) => {
    setProfilePhotoFile(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
  };

  // Validate current step
  const validateStep = async (step: number): Promise<boolean> => {
    let fields: any[] = [];
    if (step === 1) {
      fields = ['firstName', 'lastName'];
    }
    const isValid = await trigger(fields as any);
    return isValid;
  };

  // Next step
  const nextStep = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('nextStep called, currentStep:', currentStep);
    const isValid = await validateStep(currentStep);
    console.log('Validation result:', isValid);
    if (isValid && currentStep < 3) {
      console.log('Moving to step:', currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  };

  // Previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit form
  const onSubmit = async (data: AddMemberFormData) => {
    console.log('onSubmit called, currentStep:', currentStep);
    // Only submit on step 3
    if (currentStep !== 3) {
      console.log('Blocking submit - not on step 3');
      return;
    }
    
    console.log('Proceeding with submission');
    setIsSubmitting(true);
    try {
      // Combine date and time if both are provided
      let birthDateTimeISO = data.birthDate;
      if (data.birthDate && data.birthTime) {
        birthDateTimeISO = `${data.birthDate}T${data.birthTime}:00.000Z`;
      } else if (data.birthDate) {
        birthDateTimeISO = `${data.birthDate}T00:00:00.000Z`;
      }

      let deathDateTimeISO = data.deathDate;
      if (data.deathDate && data.deathTime) {
        deathDateTimeISO = `${data.deathDate}T${data.deathTime}:00.000Z`;
      } else if (data.deathDate) {
        deathDateTimeISO = `${data.deathDate}T00:00:00.000Z`;
      }

      // Step 1: Create the member
      console.log('Creating member with URL:', `${API_BASE_URL}/members`);
      const memberResponse = await axios.post(`${API_BASE_URL}/members`, {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        gender: data.gender,
        birthDate: birthDateTimeISO,
        birthPlace: data.birthPlace,
        deathDate: deathDateTimeISO,
        deathPlace: data.deathPlace,
        isLiving: data.isLiving !== false, // Default to true
        bio: data.bio,
        fatherId: data.fatherId || null,
        motherId: data.motherId || null,
        spouseId: data.spouseId || null,
      });

      const memberId = memberResponse.data.data.person.id;

      // Step 2: Upload profile photo if selected
      if (profilePhotoFile) {
        const profileFormData = new FormData();
        profileFormData.append('photo', profilePhotoFile);
        profileFormData.append('memberId', memberId);
        profileFormData.append('title', 'Profile Photo');

        await axios.post(`${MEDIA_BASE_URL}/upload/profile-photo`, profileFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Step 3: Upload gallery photos if selected
      if (galleryPhotos.length > 0) {
        const galleryFormData = new FormData();
        galleryPhotos.forEach((photo) => {
          galleryFormData.append('photos', photo);
        });
        galleryFormData.append('memberId', memberId);

        await axios.post(`${MEDIA_BASE_URL}/upload/gallery-photos`, galleryFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error: any) {
      console.error('Error creating member:', error);
      alert(error.response?.data?.message || 'Failed to create family member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-4"
              >
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
              <p className="text-gray-600">Family member added successfully</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Add Family Member</h2>
        <p className="text-gray-600 text-center mb-6">Share your family story, one member at a time</p>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={3} />

        <form 
          onSubmit={handleSubmit(onSubmit)} 
          onKeyDown={(e) => {
            if (e.key === 'Enter' && currentStep < 3) {
              e.preventDefault();
            }
          }}
          className="space-y-6"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Middle Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input
                    {...register('middleName')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Michael"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    {...register('gender')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Living Status */}
                <div className="flex items-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <input
                    type="checkbox"
                    {...register('isLiving')}
                    defaultChecked={true}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 transition-all cursor-pointer"
                    id="isLiving"
                  />
                  <label htmlFor="isLiving" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer flex items-center">
                    <span className="mr-2">✅</span>
                    Currently Living
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Birth Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                    <input
                      type="date"
                      {...register('birthDate')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Birth Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Birth Time (Optional)</label>
                    <input
                      type="time"
                      {...register('birthTime')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Birth Place */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birth Place</label>
                  <input
                    {...register('birthPlace')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="New York, NY, USA"
                  />
                </div>

                {/* Death Information (only if not living) */}
                {!watch('isLiving') && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                      <span className="mr-2">🕊️</span>
                      Passing Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Death Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Passing</label>
                        <input
                          type="date"
                          {...register('deathDate')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>

                      {/* Death Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time (Optional)</label>
                        <input
                          type="time"
                          {...register('deathTime')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Death Place */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Place of Passing</label>
                      <input
                        {...register('deathPlace')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="Location"
                      />
                    </div>
                  </div>
                )}

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about this family member..."
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Connections */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Family Connections</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Select existing family members to establish relationships
                </p>

                {/* Father */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father</label>
                  <select
                    {...register('fatherId')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select father (optional)</option>
                    {familyMembers
                      .filter((m) => m.firstName) // Basic filtering
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.firstName} {member.middleName ? member.middleName + ' ' : ''}
                          {member.lastName}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Mother */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mother</label>
                  <select
                    {...register('motherId')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select mother (optional)</option>
                    {familyMembers
                      .filter((m) => m.firstName)
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.firstName} {member.middleName ? member.middleName + ' ' : ''}
                          {member.lastName}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Spouse */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spouse</label>
                  <select
                    {...register('spouseId')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select spouse (optional)</option>
                    {familyMembers
                      .filter((m) => m.firstName)
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.firstName} {member.middleName ? member.middleName + ' ' : ''}
                          {member.lastName}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-blue-500 mt-0.5 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-blue-800">
                      Don't see the person you're looking for? You can add them later and update
                      relationships from their profile.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Photos */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Photos & Memories</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Add a profile picture and share precious memories
                </p>

                <ProfilePhotoUploader
                  onFileSelect={handleProfilePhotoSelect}
                  preview={profilePhotoPreview}
                />

                <div className="border-t border-gray-200 my-6" />

                <GalleryPhotosUploader files={galleryPhotos} onFilesSelect={setGalleryPhotos} />

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-amber-500 mt-0.5 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <p className="text-sm text-amber-800">
                      Photos are optional but help bring your family tree to life!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-md'
              }`}
            >
              Previous
            </motion.button>

            {currentStep < 3 ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  nextStep(e);
                }}
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 shadow-md transition-all"
              >
                Next
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
                className={`px-8 py-2 rounded-lg font-medium shadow-lg transition-all ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Member'
                )}
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
