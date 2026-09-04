'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/wallet/RouteGuard';
import Img from '@/components/ui/Img';

export default function CreateBeastAliasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/create');
  }, [router]);

  return (
    <RouteGuard routeName="GENETIC FORGE">
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background text-foreground font-mono text-xs space-y-3">
        <div className="w-10 h-10 relative flex items-center justify-center overflow-hidden animate-spin">
          <Img 
            src="/logo.png" 
            alt="Redirecting..." 
            className="w-10 h-10 object-contain"
          />
        </div>
        <p className="uppercase tracking-widest text-secondary">REDIRECTING TO GENETIC FORGE...</p>
      </div>
    </RouteGuard>
  );
}
