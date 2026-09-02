'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/wallet/RouteGuard';

export default function CreateBeastAliasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/create');
  }, [router]);

  return (
    <RouteGuard routeName="GENETIC FORGE">
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background text-foreground font-mono text-xs">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin mb-4" />
        <p className="uppercase tracking-widest text-secondary">REDIRECTING TO GENETIC FORGE...</p>
      </div>
    </RouteGuard>
  );
}
