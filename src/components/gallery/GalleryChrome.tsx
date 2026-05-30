import type { ReactNode, RefObject } from "react"
import { Search, X } from "lucide-react"

interface GalleryHeaderProps {
  title: string
  subtitle?: string
  onClose: () => void
  closeLabel?: string
}

export function GalleryHeader({ title, subtitle, onClose, closeLabel = "Close" }: GalleryHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      {subtitle !== undefined ? (
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
      ) : (
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      )}
      <button
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-bg-secondary"
        aria-label={closeLabel}
      >
        <X className="h-4 w-4 text-text-muted" />
      </button>
    </div>
  )
}

interface GallerySearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  inputRef?: RefObject<HTMLInputElement | null>
}

export function GallerySearchField({ value, onChange, placeholder, inputRef }: GallerySearchFieldProps) {
  return (
    <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-bg-primary px-3 py-1.5">
      <Search className="h-4 w-4 text-text-muted" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm text-text-primary outline-none"
        placeholder={placeholder}
      />
    </div>
  )
}

interface GalleryCategoryPillsProps {
  categories: readonly string[]
  selected: string | null
  onSelect: (category: string | null) => void
}

export function GalleryCategoryPills({ categories, selected, onSelect }: GalleryCategoryPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-border px-4 py-2 scrollbar-thin">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 rounded-full px-3 py-1 text-xs transition-colors ${
          selected === null
            ? "bg-accent text-white"
            : "bg-bg-secondary text-text-secondary hover:bg-bg-primary"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs transition-colors ${
            selected === cat
              ? "bg-accent text-white"
              : "bg-bg-secondary text-text-secondary hover:bg-bg-primary"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

export function GalleryEmptyState({ children }: { children: ReactNode }) {
  return <div className="py-12 text-center text-sm text-text-muted">{children}</div>
}
