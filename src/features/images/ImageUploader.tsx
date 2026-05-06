import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, X, Maximize2 } from "lucide-react";
import { useImageStore } from "./image-store";
import type { PromptImage } from "./image-types";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { MAX_IMAGES } from "@/lib/constants";
import { useClickOutside } from "@/hooks/useClickOutside";
import { toast } from "sonner";

function imageLabel(count: number) {
  return `image${count === 1 ? "" : "s"}`;
}

export function ImageUploader({ compact }: { compact?: boolean }) {
  const images = useImageStore((s) => s.images);
  const addImages = useImageStore((s) => s.addImages);
  const removeImage = useImageStore((s) => s.removeImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const currentCount = useImageStore.getState().images.length;
      const remaining = MAX_IMAGES - currentCount;
      const incoming = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (incoming.length === 0) return;
      if (remaining <= 0) {
        toast.info(
          `Per-prompt limit is ${MAX_IMAGES} ${imageLabel(MAX_IMAGES)}. Remove some to add more.`,
        );
        return;
      }
      const imageFiles = incoming.slice(0, remaining);
      const skipped = incoming.length - imageFiles.length;
      if (skipped > 0) {
        toast.info(
          `Added ${imageFiles.length} ${imageLabel(imageFiles.length)}. ${skipped} more weren't attached because the per-prompt limit is ${MAX_IMAGES}. Remove some to add more.`,
        );
      }

      Promise.all(
        imageFiles.map(
          (file) =>
            new Promise<PromptImage>((resolve, reject) => {
              const reader = new FileReader();
              reader.onerror = () => reject(reader.error);
              reader.onload = (e) => {
                const dataUrl = e.target?.result;
                if (typeof dataUrl !== "string") {
                  reject(new Error(`Could not read ${file.name}`));
                  return;
                }

                const img = new Image();
                img.onerror = () =>
                  reject(new Error(`Could not load ${file.name}`));
                img.onload = () => {
                  resolve({
                    id: crypto.randomUUID(),
                    name: file.name,
                    dataUrl,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    size: file.size,
                  });
                };
                img.src = dataUrl;
              };
              reader.readAsDataURL(file);
            }),
        ),
      )
        .then(addImages)
        .catch((error) => {
          console.error("Failed to process images:", error);
          toast.error("One or more images couldn't be processed.");
        });
    },
    [addImages],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        processFiles(files);
      }
    },
    [processFiles],
  );

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useClickOutside(popoverRef, () => setPopoverOpen(false), popoverOpen);

  if (compact) {
    return (
      <div
        className={`relative flex items-center gap-2 ${isDragOver ? "bg-accent/5" : ""}`}
        ref={popoverRef}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <button
          onClick={() =>
            images.length > 0
              ? setPopoverOpen(!popoverOpen)
              : fileInputRef.current?.click()
          }
          className={`flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs transition-colors ${
            images.length > 0
              ? "border-accent/30 bg-accent/5 text-accent hover:bg-accent/10"
              : "border-dashed border-border text-text-muted hover:border-accent hover:text-accent"
          }`}
          aria-label="Add image"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          {images.length > 0 ? (
            <span>
              {images.length} {imageLabel(images.length)}
            </span>
          ) : (
            <span className="hidden sm:inline">Add images</span>
          )}
        </button>

        <AnimatePresence>
          {popoverOpen && images.length > 0 && (
            <motion.div
              className="panel-surface absolute bottom-full left-0 z-50 mb-2 w-64 rounded-xl border border-border p-3 shadow-xl"
              initial={{ opacity: 0, y: 4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-text-primary">
                  {images.length} {imageLabel(images.length)}
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-[10px] font-medium text-accent transition-colors hover:bg-accent/20"
                >
                  <ImagePlus className="h-3 w-3" />
                  Add
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, index) => (
                  <div key={img.id} className="group relative">
                    <div className="aspect-square overflow-hidden rounded-lg border border-border bg-bg-primary">
                      <img
                        src={img.dataUrl}
                        alt={img.name}
                        className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
                        onClick={() => {
                          setPreviewIndex(index);
                          setPopoverOpen(false);
                        }}
                      />
                    </div>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                      aria-label={`Remove ${img.name}`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <AnimatePresence>
          {previewIndex !== null && (
            <ImagePreviewModal
              images={images}
              currentIndex={previewIndex}
              onClose={() => setPreviewIndex(null)}
              onNavigate={setPreviewIndex}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div
        className={`shrink-0 border-t border-border bg-bg-secondary p-2 transition-colors ${
          isDragOver ? "bg-accent/5" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-xs text-text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          <span>Add images (drag, drop, or paste)</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 border-t border-border bg-bg-secondary p-2 transition-colors ${
        isDragOver ? "bg-accent/5" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
        {images.map((img, index) => (
          <div key={img.id} className="group relative shrink-0">
            <div className="h-12 w-12 overflow-hidden rounded-lg border border-border bg-bg-primary">
              <img
                src={img.dataUrl}
                alt={img.name}
                className="h-full w-full object-cover"
              />
            </div>
            <button
              onClick={() => removeImage(img.id)}
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label={`Remove ${img.name}`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
            <button
              onClick={() => setPreviewIndex(index)}
              className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Preview"
            >
              <Maximize2 className="h-2.5 w-2.5" />
            </button>
          </div>
        ))}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-text-muted transition-colors hover:border-accent hover:text-accent"
          aria-label="Add image"
        >
          <ImagePlus className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-1 text-[10px] text-text-muted">
        {images.length} {imageLabel(images.length)}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <AnimatePresence>
        {previewIndex !== null && (
          <ImagePreviewModal
            images={images}
            currentIndex={previewIndex}
            onClose={() => setPreviewIndex(null)}
            onNavigate={setPreviewIndex}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
