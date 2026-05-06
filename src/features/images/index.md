# images

Image attachments for prompts: upload, thumbnail strip, and full-size preview.

| File | Exports | Description |
| --- | --- | --- |
| `ImageUploader.tsx` | `ImageUploader` | Entry component: drag/drop + file-picker upload, thumbnail row, and the per-image popover menu. |
| `ImagePreviewModal.tsx` | `ImagePreviewModal` | Full-size image preview overlay. |
| `image-store.ts` | `useImageStore` | Zustand store: the list of attached images and add/remove actions. |
| `image-types.ts` | `PromptImage` (type) | Shape of one attached image. |

## Cross-references

- **Store:** `image-store` (this folder)
- **Shared:** `@/hooks/useClickOutside` (popover dismiss), `@/lib/storage` (IndexedDB persistence), `@/lib/constants` (`MAX_IMAGES`)
- Token estimates for images live in `@/lib/model-data` (`estimateImageTokens`); consumed by `token-calculator`.
