"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FiPlusSquare,
  FiCheck,
  FiUploadCloud,
  FiImage,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { useAccount } from "wagmi";
import { useWalletGate } from "@/components/wallet/useWalletGate";
import { STAT_BUDGET, AVAILABLE_PERKS } from "@/lib/constants/game";
import { BeastStats, BoundAsset } from "@/lib/types";
import { createBeast } from "@/lib/services/beastService";
import { uploadImageToImgBB } from "@/lib/services/imageUploadService";
import { RouteGuard } from "@/components/wallet/RouteGuard";
import gsap from "gsap";
import Img from "@/components/ui/Img";

export default function CreateBeastPage() {
  const router = useRouter();
  const { address } = useAccount();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [boundAsset, setBoundAsset] = useState<BoundAsset>("UNBOUND");

  // Start with minimum base points (1 per stat, 16 remaining to allocate)
  const [stats, setStats] = useState<BeastStats>({
    power: 1,
    defense: 1,
    speed: 1,
    special: 1,
  });

  const [selectedPerks, setSelectedPerks] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Points calculation
  const usedPoints = stats.power + stats.defense + stats.speed + stats.special;
  const remainingPoints = STAT_BUDGET.TOTAL_POINTS - usedPoints;

  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const pointsBadgeRef = useRef<HTMLSpanElement>(null);
  const statRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  // Header entrance
  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.from(".forge-badge", { opacity: 0, y: -12, duration: 0.4 })
        .from(".forge-title", { opacity: 0, y: 28, duration: 0.55 }, "-=0.2")
        .from(".forge-desc", { opacity: 0, y: 18, duration: 0.4 }, "-=0.2")
        .from(
          ".forge-hero-ill",
          { opacity: 0, scale: 0.85, duration: 0.6, ease: "back.out(1.4)" },
          "-=0.3",
        );
    }, headerRef);
    return () => ctx.revert();
  }, [address]);

  // Form panels stagger in
  useEffect(() => {
    if (!formRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".forge-panel", {
        opacity: 0,
        y: 32,
        duration: 0.55,
        stagger: 0.12,
        ease: "power2.out",
        delay: 0.2,
      });
    }, formRef);
    return () => ctx.revert();
  }, [address]);

  // Handle Image File Upload via ImgBB
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError(
        "Invalid file format. Please upload an image file (PNG, JPG, WEBP, GIF).",
      );
      return;
    }

    if (file.size > 32 * 1024 * 1024) {
      setUploadError("File size exceeds 32MB limit.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      const url = await uploadImageToImgBB(file);
      setSelectedAvatar(url);
    } catch (err: any) {
      console.error("Image upload failed:", err);
      setUploadError(
        err?.message ||
          "Failed to upload image to ImgBB. Please check your network and try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleStatChange = useCallback(
    (statKey: keyof BeastStats, delta: number) => {
      const currentValue = stats[statKey];
      const newValue = currentValue + delta;

      if (
        newValue < STAT_BUDGET.MIN_PER_STAT ||
        newValue > STAT_BUDGET.MAX_PER_STAT
      )
        return;
      if (delta > 0 && remainingPoints <= 0) return;

      setStats((prev) => ({
        ...prev,
        [statKey]: newValue,
      }));

      // Bounce the stat number
      const el = statRefs.current[statKey];
      if (el) {
        gsap.fromTo(
          el,
          { scale: delta > 0 ? 1.5 : 0.6 },
          { scale: 1, duration: 0.35, ease: "elastic.out(1.2, 0.5)" },
        );
      }

      // Flash the points badge when budget changes
      if (pointsBadgeRef.current) {
        gsap.fromTo(
          pointsBadgeRef.current,
          {
            scale: 1.25,
            backgroundColor:
              remainingPoints - delta === 0
                ? "var(--primary)"
                : "var(--secondary)",
          },
          { scale: 1, backgroundColor: "var(--primary)", duration: 0.3 },
        );
      }
    },
    [remainingPoints, stats],
  );

  const togglePerk = (perkId: string) => {
    if (selectedPerks.includes(perkId)) {
      setSelectedPerks(selectedPerks.filter((id) => id !== perkId));
    } else {
      if (selectedPerks.length >= 2) return;
      setSelectedPerks([...selectedPerks, perkId]);
    }
  };

  const { requireAuth } = useWalletGate();

  const handleForge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedAvatar || isSubmitting || remainingPoints > 0)
      return;

    requireAuth({
      actionTitle: `forge combat beast "${name.trim().toUpperCase()}"`,
      onSuccess: async () => {
        setIsSubmitting(true);

        // Pulse the submit button
        if (submitBtnRef.current) {
          gsap.fromTo(
            submitBtnRef.current,
            { scale: 0.96 },
            { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.5)" },
          );
        }

        try {
          if (!address) {
            setIsSubmitting(false);
            return;
          }
          const createdBeast = await createBeast({
            ownerAddress: address,
            name: name.trim() || "UNTITLED BEAST",
            description: description.trim() || "No tactical lore entered.",
            avatarUrl: selectedAvatar,
            stats,
            perks: selectedPerks,
            boundAsset,
          });

          // Navigate directly to the newly forged beast profile
          router.push(`/beast/${createdBeast.id}`);
        } catch (err) {
          console.error("Failed to create beast:", err);
          setIsSubmitting(false);
        }
      },
    });
  };

  return (
    <RouteGuard routeName="GENETIC FORGE">
      <div className="flex flex-col w-full bg-background min-h-screen text-foreground pb-24">
        {/* 1. HEADER */}
        <section
          ref={headerRef}
          className="border-b border-primary bg-background pt-8 pb-8"
        >
          <div className="max-w-[1440px] mx-auto px-4 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="forge-badge inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary text-background font-mono text-[11px] uppercase tracking-wider mb-1">
                <span className="w-2 h-2 bg-secondary" />
                <span>GENETIC FORGE // ATTRIBUTE MATRIX</span>
              </div>
              <h1 className="forge-title font-headline font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-primary">
                FORGE YOUR COMBAT BEAST
              </h1>
              <p className="forge-desc font-sans text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
                Construct an apex synthetic combatant on Somnia Shannon. Upload
                your custom combatant avatar, allocate your 20-point attribute
                budget, configure tactical passives, and select your live
                DreamDEX market binding.
              </p>
            </div>
            <div className="forge-hero-ill lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full">
                <Img
                  src="/forge-hero.png"
                  alt="Genetic Forge Bohemian Illustration"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. MAIN FORGE FORM */}
        <section
          ref={formRef}
          className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-10"
        >
          <form
            onSubmit={handleForge}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: Avatar Upload & Basic Lore (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Custom Avatar Uploader */}
              <div className="forge-panel border border-primary p-6 bg-background space-y-4">
                <div className="flex items-center justify-between border-b border-primary pb-2">
                  <span className="font-mono text-xs text-secondary uppercase font-bold">
                    01 // CUSTOM AVATAR SYNTHESIS
                  </span>
                  <span className="font-mono text-xs text-primary font-bold">
                    IMGBB STORAGE
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Uploaded Avatar Preview or Drag-and-Drop Area */}
                {selectedAvatar ? (
                  <div className="space-y-3">
                    <div className="relative aspect-square w-full border-2 border-primary overflow-hidden bg-zinc-900 group">
                      <Image
                        src={selectedAvatar}
                        alt={name || "Uploaded Combatant Avatar"}
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute bottom-2 left-2 bg-primary text-background font-mono text-[10px] font-bold px-2 py-0.5 uppercase">
                        {name || "DESIGNATION PENDING"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full py-2.5 bg-surface-container-low border border-primary text-primary font-headline font-bold text-xs uppercase tracking-wider hover:bg-primary hover:text-background transition-colors flex items-center justify-center gap-2"
                    >
                      <FiRefreshCw className="w-3.5 h-3.5" />
                      <span>Change / Replace Avatar Image</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 min-h-[260px] ${
                      dragActive
                        ? "border-primary bg-primary/10"
                        : "border-neutral hover:border-primary bg-surface-container-low"
                    }`}
                  >
                    {isUploading ? (
                      <div className="space-y-3">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin mx-auto" />
                        <p className="font-mono text-xs text-primary font-bold uppercase tracking-wider">
                          UPLOADING AVATAR TO IMGBB...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 border border-primary bg-background flex items-center justify-center">
                          <FiUploadCloud className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-headline font-bold text-sm uppercase text-primary">
                            DRAG & DROP COMBATANT IMAGE
                          </p>
                          <p className="font-mono text-xs text-secondary">
                            or click to browse from your device
                          </p>
                        </div>
                        <span className="font-mono text-[10px] text-secondary uppercase border border-neutral px-2 py-0.5">
                          PNG, JPG, WEBP, GIF UP TO 32MB
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Upload Error Alert */}
                {uploadError && (
                  <div className="p-3 bg-danger/10 border border-danger text-danger font-mono text-xs flex items-center gap-2">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Beast Lore & Identity */}
              <div className="forge-panel border border-primary p-6 bg-background space-y-4">
                <div className="flex items-center justify-between border-b border-primary pb-2">
                  <span className="font-mono text-xs text-secondary uppercase font-bold">
                    02 // COMBAT IDENTIFIER
                  </span>
                  <span className="font-mono text-xs text-secondary">
                    REQUIRED
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block font-headline font-bold text-sm uppercase text-primary">
                    BEAST DESIGNATION / NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. MECHA-KONG, CYBER-MANTIS..."
                    className="w-full bg-surface-container-low border border-primary p-3 font-mono text-sm text-primary uppercase focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-secondary"
                    maxLength={24}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-headline font-bold text-sm uppercase text-primary">
                    TACTICAL LORE / DESCRIPTION
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Describe your combatant's genetic modifications and combat directives..."
                    className="w-full bg-surface-container-low border border-primary p-3 font-mono text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-secondary"
                    maxLength={180}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Attribute Allocator, Perks, Market Binding, Submit (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Attribute Matrix Allocator (20 points) */}
              <div className="forge-panel border border-primary p-6 bg-background space-y-6">
                <div className="flex items-center justify-between border-b border-primary pb-3">
                  <div>
                    <span className="font-mono text-xs text-secondary uppercase font-bold">
                      03 // ATTRIBUTE MATRIX
                    </span>
                    <h2 className="font-headline font-bold text-2xl uppercase tracking-tight text-primary">
                      POINT ALLOCATION
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] text-secondary block uppercase">
                      POINTS REMAINING
                    </span>
                    <span
                      ref={pointsBadgeRef}
                      className={`inline-block font-headline font-bold text-lg px-2.5 py-0.5 border ${
                        remainingPoints === 0
                          ? "bg-primary text-background border-primary"
                          : "bg-surface-container-low text-primary border-primary"
                      }`}
                    >
                      {remainingPoints} / {STAT_BUDGET.TOTAL_POINTS}
                    </span>
                  </div>
                </div>

                {/* Stat Allocation Rows */}
                <div className="space-y-4">
                  {/* POWER */}
                  <div className="border border-neutral p-4 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-headline font-bold text-base uppercase text-primary">
                        POWER // KINETIC OUTPUT
                      </div>
                      <div className="font-mono text-xs text-secondary">
                        Governs raw strike damage and critical hit potency.
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleStatChange("power", -1)}
                        disabled={stats.power <= STAT_BUDGET.MIN_PER_STAT}
                        className="w-9 h-9 bg-background border border-primary font-headline font-bold text-lg hover:bg-neutral disabled:opacity-30 disabled:hover:bg-background transition-colors flex items-center justify-center"
                      >
                        -
                      </button>
                      <span
                        ref={(el) => {
                          statRefs.current["power"] = el;
                        }}
                        className="font-headline font-extrabold text-2xl w-8 text-center text-primary"
                      >
                        {stats.power}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStatChange("power", 1)}
                        disabled={
                          stats.power >= STAT_BUDGET.MAX_PER_STAT ||
                          remainingPoints <= 0
                        }
                        className="w-9 h-9 bg-primary text-background border border-primary font-headline font-bold text-lg hover:bg-secondary disabled:opacity-30 disabled:hover:bg-primary transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* DEFENSE */}
                  <div className="border border-neutral p-4 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-headline font-bold text-base uppercase text-primary">
                        DEFENSE // REINFORCED PLATING
                      </div>
                      <div className="font-mono text-xs text-secondary">
                        Reduces incoming kinetic & energy damage from opponent
                        turns.
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleStatChange("defense", -1)}
                        disabled={stats.defense <= STAT_BUDGET.MIN_PER_STAT}
                        className="w-9 h-9 bg-background border border-primary font-headline font-bold text-lg hover:bg-neutral disabled:opacity-30 disabled:hover:bg-background transition-colors flex items-center justify-center"
                      >
                        -
                      </button>
                      <span
                        ref={(el) => {
                          statRefs.current["defense"] = el;
                        }}
                        className="font-headline font-extrabold text-2xl w-8 text-center text-primary"
                      >
                        {stats.defense}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStatChange("defense", 1)}
                        disabled={
                          stats.defense >= STAT_BUDGET.MAX_PER_STAT ||
                          remainingPoints <= 0
                        }
                        className="w-9 h-9 bg-primary text-background border border-primary font-headline font-bold text-lg hover:bg-secondary disabled:opacity-30 disabled:hover:bg-primary transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* SPEED */}
                  <div className="border border-neutral p-4 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-headline font-bold text-base uppercase text-primary">
                        SPEED // ACTUATOR VELOCITY
                      </div>
                      <div className="font-mono text-xs text-secondary">
                        Determines turn initiative and evasion counter chances.
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleStatChange("speed", -1)}
                        disabled={stats.speed <= STAT_BUDGET.MIN_PER_STAT}
                        className="w-9 h-9 bg-background border border-primary font-headline font-bold text-lg hover:bg-neutral disabled:opacity-30 disabled:hover:bg-background transition-colors flex items-center justify-center"
                      >
                        -
                      </button>
                      <span
                        ref={(el) => {
                          statRefs.current["speed"] = el;
                        }}
                        className="font-headline font-extrabold text-2xl w-8 text-center text-primary"
                      >
                        {stats.speed}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStatChange("speed", 1)}
                        disabled={
                          stats.speed >= STAT_BUDGET.MAX_PER_STAT ||
                          remainingPoints <= 0
                        }
                        className="w-9 h-9 bg-primary text-background border border-primary font-headline font-bold text-lg hover:bg-secondary disabled:opacity-30 disabled:hover:bg-primary transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* SPECIAL */}
                  <div className="border border-neutral p-4 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-headline font-bold text-base uppercase text-primary">
                        SPECIAL // NEURAL OVERCLOCK
                      </div>
                      <div className="font-mono text-xs text-secondary">
                        Amplifies Market Pulse modifiers and execution moves.
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleStatChange("special", -1)}
                        disabled={stats.special <= STAT_BUDGET.MIN_PER_STAT}
                        className="w-9 h-9 bg-background border border-primary font-headline font-bold text-lg hover:bg-neutral disabled:opacity-30 disabled:hover:bg-background transition-colors flex items-center justify-center"
                      >
                        -
                      </button>
                      <span
                        ref={(el) => {
                          statRefs.current["special"] = el;
                        }}
                        className="font-headline font-extrabold text-2xl w-8 text-center text-primary"
                      >
                        {stats.special}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStatChange("special", 1)}
                        disabled={
                          stats.special >= STAT_BUDGET.MAX_PER_STAT ||
                          remainingPoints <= 0
                        }
                        className="w-9 h-9 bg-primary text-background border border-primary font-headline font-bold text-lg hover:bg-secondary disabled:opacity-30 disabled:hover:bg-primary transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tactical Perks (Select Up to 2) */}
              <div className="forge-panel border border-primary p-6 bg-background space-y-4">
                <div className="flex items-center justify-between border-b border-primary pb-2">
                  <div>
                    <span className="font-mono text-xs text-secondary uppercase font-bold">
                      04 // TACTICAL PASSIVES
                    </span>
                    <div className="font-headline font-bold text-lg uppercase text-primary">
                      SELECT UP TO 2 PERKS ({selectedPerks.length} / 2)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABLE_PERKS.map((perk) => {
                    const isSelected = selectedPerks.includes(perk.id);
                    return (
                      <button
                        key={perk.id}
                        type="button"
                        onClick={() => togglePerk(perk.id)}
                        className={`p-3 text-left border transition-colors flex flex-col justify-between gap-2 ${
                          isSelected
                            ? "border-primary bg-primary text-background"
                            : "border-neutral bg-surface-container-low hover:border-primary text-primary"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-headline font-bold text-sm uppercase">
                            {perk.name}
                          </span>
                          {isSelected && (
                            <FiCheck className="w-4 h-4 text-background flex-shrink-0" />
                          )}
                        </div>
                        <p
                          className={`font-sans text-xs leading-relaxed ${isSelected ? "text-background/80" : "text-secondary"}`}
                        >
                          {perk.description}
                        </p>
                        <span
                          className={`font-mono text-[10px] font-bold ${isSelected ? "text-background" : "text-primary"}`}
                        >
                          {perk.effectSummary}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Market Binding (DreamDEX Event Contracts) */}
              <div className="forge-panel border border-primary p-6 bg-background space-y-4">
                <div className="flex items-center justify-between border-b border-primary pb-2">
                  <div>
                    <span className="font-mono text-xs text-secondary uppercase font-bold">
                      05 // DREAMDEX MARKET BINDING
                    </span>
                    <div className="font-headline font-bold text-lg uppercase text-primary">
                      EVENT CONTRACT TELEMETRY
                    </div>
                  </div>
                  <span className="font-mono text-xs text-secondary">
                    OPTIONAL
                  </span>
                </div>

                <p className="font-sans text-xs text-secondary leading-relaxed">
                  Bind your combatant to a real-time crypto price prediction
                  market. Live order book Up/Down probability will grant dynamic
                  in-battle stat modifiers.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  {(["BTC", "ETH", "UNBOUND"] as BoundAsset[]).map((asset) => {
                    const isSelected = boundAsset === asset;
                    return (
                      <button
                        key={asset}
                        type="button"
                        onClick={() => setBoundAsset(asset)}
                        className={`p-3 text-center border font-headline font-bold text-sm uppercase tracking-wider transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-background"
                            : "border-neutral bg-surface-container-low hover:border-primary text-primary"
                        }`}
                      >
                        {asset === "UNBOUND"
                          ? "UNBOUND (NONE)"
                          : `${asset} BOUND`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submission CTA */}
              <button
                ref={submitBtnRef}
                type="submit"
                disabled={
                  isSubmitting ||
                  remainingPoints > 0 ||
                  !name.trim() ||
                  !selectedAvatar
                }
                className="w-full py-5 bg-primary text-background font-headline font-extrabold text-xl uppercase tracking-wider hover:bg-neutral hover:text-primary border-2 border-primary transition-colors disabled:opacity-40 disabled:hover:bg-primary disabled:hover:text-background flex items-center justify-center gap-3"
              >
                <FiPlusSquare className="w-6 h-6" />
                <span>
                  {isSubmitting
                    ? "COMMITTING TO SOMNIA SHANNON..."
                    : !selectedAvatar
                      ? "UPLOAD COMBATANT AVATAR IMAGE"
                      : remainingPoints > 0
                        ? `ALLOCATE REMAINING ${remainingPoints} POINTS`
                        : !name.trim()
                          ? "ENTER BEAST DESIGNATION"
                          : "FORGE & PERSIST COMBATANT"}
                </span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </RouteGuard>
  );
}
