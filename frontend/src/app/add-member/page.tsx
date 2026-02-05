'use client';

import AddMemberForm from '@/components/AddMemberForm';

export default function AddMemberPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12">
      <AddMemberForm 
        onSuccess={() => {
          // Redirect to members list or show success message
          window.location.href = '/members';
        }}
      />
    </main>
  );
}
