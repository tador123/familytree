// @ts-nocheck - React types are in Docker container
'use client';

// @ts-ignore - react is installed in Docker container
import { useState, useEffect } from 'react';
// @ts-ignore - react-hook-form is installed in Docker container
import { useForm } from 'react-hook-form';
// @ts-ignore - next is installed in Docker container
import { useRouter } from 'next/navigation';
// @ts-ignore - axios is installed in Docker container
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface FamilyMember {
  id: string;
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
}

interface EditFormData {
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
}

export default function EditMemberPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [allMembers, setAllMembers] = useState<FamilyMember[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EditFormData>();
  const isLiving = watch('isLiving', true);

  // Fetch member data and all members for relationship dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the member to edit
        const memberResponse = await axios.get(`${API_BASE_URL}/family-members/${params.id}`);
        const memberData = memberResponse.data.data;
        setMember(memberData);

        // Fetch all members for parent/spouse selection
        const allMembersResponse = await axios.get(`${API_BASE_URL}/family-members`);
        setAllMembers(allMembersResponse.data.data || []);

        // Set form values
        setValue('firstName', memberData.firstName || '');
        setValue('lastName', memberData.lastName || '');
        setValue('middleName', memberData.middleName || '');
        setValue('gender', memberData.gender || '');
        setValue('birthDate', memberData.birthDate ? memberData.birthDate.split('T')[0] : '');
        setValue('birthTime', memberData.birthTime || '');
        setValue('birthPlace', memberData.birthPlace || '');
        setValue('deathDate', memberData.deathDate ? memberData.deathDate.split('T')[0] : '');
        setValue('deathTime', memberData.deathTime || '');
        setValue('deathPlace', memberData.deathPlace || '');
        setValue('isLiving', memberData.isLiving !== false);
        setValue('bio', memberData.bio || '');
        setValue('fatherId', memberData.fatherId || '');
        setValue('motherId', memberData.motherId || '');
        setValue('spouseId', memberData.spouseId || '');

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load member data');
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, setValue]);

  const onSubmit = async (data: EditFormData) => {
    setSaving(true);
    setError(null);

    try {
      // Prepare update data
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName || null,
        gender: data.gender || null,
        birthDate: data.birthDate || null,
        birthTime: data.birthTime || null,
        birthPlace: data.birthPlace || null,
        deathDate: data.isLiving ? null : (data.deathDate || null),
        deathTime: data.isLiving ? null : (data.deathTime || null),
        deathPlace: data.isLiving ? null : (data.deathPlace || null),
        isLiving: data.isLiving,
        bio: data.bio || null,
        fatherId: data.fatherId || null,
        motherId: data.motherId || null,
        spouseId: data.spouseId || null,
      };

      // Update the member
      await axios.patch(`${API_BASE_URL}/family-members/${params.id}`, updateData);

      // Redirect to member profile
      router.push(`/members/${params.id}`);
    } catch (err: any) {
      console.error('Error updating member:', err);
      setError(err.response?.data?.message || 'Failed to update member. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mb-4"></div>
          <p className="text-xl text-gray-700">Loading member data...</p>
        </div>
      </div>
    );
  }

  if (error && !member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold">Error Loading Member</h2>
              <p className="mt-2">{error}</p>
            </div>
            <button
              onClick={() => router.push('/members')}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-semibold"
            >
              Back to Members
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter out current member from relationship selections and prevent circular relationships
  const availableFathers = allMembers.filter(m => 
    m.id !== params.id && 
    m.gender !== 'Female' &&
    m.id !== member?.motherId // Prevent selecting mother as father
  );
  
  const availableMothers = allMembers.filter(m => 
    m.id !== params.id && 
    m.gender !== 'Male' &&
    m.id !== member?.fatherId // Prevent selecting father as mother
  );
  
  const availableSpouses = allMembers.filter(m => 
    m.id !== params.id &&
    m.id !== member?.fatherId &&
    m.id !== member?.motherId
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Edit Member</h1>
                <p className="text-sm text-gray-600">
                  {member?.firstName} {member?.lastName}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('firstName', { required: 'First name is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('lastName', { required: 'Last name is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input
                    {...register('middleName')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    {...register('gender')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Birth Information */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Birth Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                  <input
                    type="date"
                    {...register('birthDate')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birth Time</label>
                  <input
                    type="time"
                    {...register('birthTime')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birth Place</label>
                  <input
                    {...register('birthPlace')}
                    placeholder="City, Country"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Living Status & Death Information */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Living Status</h2>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isLiving')}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">This person is currently living</span>
                </label>
              </div>

              {!isLiving && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Death Date</label>
                    <input
                      type="date"
                      {...register('deathDate')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Death Time</label>
                    <input
                      type="time"
                      {...register('deathTime')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Death Place</label>
                    <input
                      {...register('deathPlace')}
                      placeholder="City, Country"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Family Relationships */}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Family Relationships
              </h2>
              <p className="text-sm text-emerald-700 mb-4">
                Set parent and spouse relationships to build your family tree
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father</label>
                  <select
                    {...register('fatherId')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  >
                    <option value="">Select Father</option>
                    {availableFathers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mother</label>
                  <select
                    {...register('motherId')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  >
                    <option value="">Select Mother</option>
                    {availableMothers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spouse</label>
                  <select
                    {...register('spouseId')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  >
                    <option value="">Select Spouse</option>
                    {availableSpouses.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Biography</h2>
              <textarea
                {...register('bio')}
                rows={4}
                placeholder="Share their life story, accomplishments, memories..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
