import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import type { PromptImage } from "./image-types";

export function ImagePreviewModal({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: {
  images: PromptImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const total = images.length;
  const goPrev = useCallback(() => {
    if (total <= 1) return;
    onNavigate((currentIndex - 1 + total) % total);
  }, [currentIndex, onNavigate, total]);
  const goNext = useCallback(() => {
    if (total <= 1) return;
    onNavigate((currentIndex + 1) % total);
  }, [currentIndex, onNavigate, total]);

  useEscapeKey((e) => {
    e.preventDefault();
    onClose();
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="Close preview"
      >
        <X className="h-5 w-5" />
      </button>

      {total > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {total > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <img
        src={images[currentIndex]?.dataUrl}
        alt={images[currentIndex]?.name ?? "Preview"}
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      <div className="absolute bottom-4 text-sm text-white/70">
        {currentIndex + 1} / {total}
      </div>
    </motion.div>
  );
}
