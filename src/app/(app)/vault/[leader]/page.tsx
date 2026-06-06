'use client';

export default function VaultPage({ params }: { params: { leader: string } }) {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-white text-2xl font-bold">Vault — {params.leader}</h1>
      <p className="text-white/50 mt-2">Create or manage your vault for this leader.</p>
    </div>
  );
}
