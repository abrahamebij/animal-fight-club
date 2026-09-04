'use client';

import React, { useState, useRef, useCallback, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlusSquare } from 'react-icons/fi';
import { useAccount } from 'wagmi';
import { useWalletGate } from '@/components/wallet/useWalletGate';
import { STAT_BUDGET } from '@/lib/constants/game';
import { BeastStats, BoundAsset, Beast } from '@/lib/types';
import { uploadImageToImgBB } from '@/lib/services/imageUploadService';
import { useCreateBeastMutation } from '@/hooks/useBeasts';
import { StepIdentity } from '@/components/create/StepIdentity';
import { StepAttributes } from '@/components/create/StepAttributes';
import { StepPerks } from '@/components/create/StepPerks';
import { StepDreamDex } from '@/components/create/StepDreamDex';
import { toast } from 'sonner';
import gsap from 'gsap';

export default function CreateBeastPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { requireAuth } = useWalletGate();
  const createMutation = useCreateBeastMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [boundAsset, setBoundAsset] = useState<BoundAsset>('UNBOUND');
  const [stats, setStats] = useState<BeastStats>({
    power: 1,
    defense: 1,
    speed: 1,
    special: 1,
  });
  const [selectedPerks, setSelectedPerks] = useState<string[]>([]);

  const usedPoints = stats.power + stats.defense + stats.speed + stats.special;
  const remainingPoints = STAT_BUDGET.TOTAL_POINTS - usedPoints;

  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.from('.forge-badge', { opacity: 0, y: -12, duration: 0.4 })
        .from('.forge-title', { opacity: 0, y: 28, duration: 0.55 }, '-=0.2')
        .from('.forge-desc', { opacity: 0, y: 18, duration: 0.4 }, '-=0.2');
    }, headerRef);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.forge-panel', {
        opacity: 0,
        y: 32,
        duration: 0.55,
        stagger: 0.12,
        ease: 'power2.out',
        delay: 0.3,
      });
    }, formRef);
    return () => ctx.revert();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Invalid file format. Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    try {
      setIsUploading(true);
      setUploadError(null);
      const url = await uploadImageToImgBB(file);
      setSelectedAvatar(url);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleStatChange = useCallback((statKey: keyof BeastStats, delta: number) => {
    const current = stats[statKey];
    const next = current + delta;
    if (next < STAT_BUDGET.MIN_PER_STAT || next > STAT_BUDGET.MAX_PER_STAT) return;
    if (delta > 0 && remainingPoints <= 0) return;
    setStats((prev) => ({ ...prev, [statKey]: next }));
  }, [stats, remainingPoints]);

  const handleTogglePerk = (perkId: string) => {
    if (selectedPerks.includes(perkId)) {
      setSelectedPerks((prev) => prev.filter((p) => p !== perkId));
    } else if (selectedPerks.length < 2) {
      setSelectedPerks((prev) => [...prev, perkId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name required', { description: 'Please enter a name for your beast.' });
      return;
    }

    requireAuth({
      actionTitle: `forge ${name.toUpperCase()}`,
      onSuccess: async () => {
        try {
          const newBeast: Beast = {
            id: `beast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: name.trim().toUpperCase(),
            ownerAddress: address || '0x0000000000000000000000000000000000000000',
            avatarUrl: selectedAvatar || '/beasts/lion.png',
            stats,
            perks: selectedPerks,
            boundAsset: boundAsset === 'UNBOUND' ? null : boundAsset,
            record: { wins: 0, losses: 0 },
            createdAt: Date.now(),
          };


          await createMutation.mutateAsync(newBeast);
          toast.success(`Beast ${newBeast.name} Forged!`, { description: 'Your autonomous combat agent is now registered.' });
          router.push(`/beast/${newBeast.id}`);
        } catch (err) {
          toast.error('Creation failed', { description: 'Failed to mint beast profile. Please try again.' });
        }
      },
    });
  };

  return (
    <div className="flex flex-col w-full bg-background min-h-screen text-foreground pb-24">
      <section ref={headerRef} className="border-b border-divider divider-ash bg-background pt-8 pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 space-y-3">
          <div className="forge-badge inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary text-background font-mono text-[11px] uppercase tracking-wider">
            <span className="w-2 h-2 bg-secondary" />
            <span>GENETIC FORGE // AGENT INCUBATOR</span>
          </div>
          <h1 className="forge-title font-headline font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-primary">
            FORGE COMBATANT
          </h1>
          <p className="forge-desc font-sans text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
            Construct an autonomous combat agent from baseline genetic parameters. Allocate 20 stat points, select up to 2 tactical perks, and bind to real-time DreamDEX market odds.
          </p>
        </div>
      </section>

      <div ref={formRef} className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
              <StepIdentity
                name={name}
                onChangeName={setName}
                description={description}
                onChangeDescription={setDescription}
                selectedAvatar={selectedAvatar}
                isUploading={isUploading}
                uploadError={uploadError}
                dragActive={dragActive}
                onDrag={handleDrag}
                onDrop={handleDrop}
                onFileInputChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                fileInputRef={fileInputRef}
              />
              <StepDreamDex
                boundAsset={boundAsset}
                onSelectBoundAsset={setBoundAsset}
              />
            </div>

            <div className="space-y-8">
              <StepAttributes
                stats={stats}
                remainingPoints={remainingPoints}
                onStatChange={handleStatChange}
              />
              <StepPerks
                selectedPerks={selectedPerks}
                onTogglePerk={handleTogglePerk}
              />
            </div>
          </div>

          <div className="border border-divider p-6 bg-background flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-mono text-xs text-secondary">
              Total Points: <strong className="text-primary">{usedPoints} / {STAT_BUDGET.TOTAL_POINTS}</strong> | Perks: <strong className="text-primary">{selectedPerks.length} / 2</strong> | Market Asset: <strong className="text-primary">{boundAsset}</strong>
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full sm:w-auto px-8 py-4 bg-primary text-background font-headline font-bold text-base uppercase tracking-wider hover:bg-secondary transition-colors border border-primary disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiPlusSquare className="w-5 h-5" />
              <span>{createMutation.isPending ? 'MINTING BEAST...' : 'MINT COMBAT AGENT'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
