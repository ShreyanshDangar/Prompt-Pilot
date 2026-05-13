# xml-tags

XML-tag helpers: an in-editor autocomplete popover plus a gallery of reusable tags.

| File | Exports | Description |
| --- | --- | --- |
| `XmlTagGallery.tsx` | `XmlTagGallery` | Gallery modal to browse/create/edit/delete XML tags. |
| `XmlTagAutocompletePopover.tsx` | `XmlTagAutocompletePopover` (forwardRef) | In-editor `<`-triggered tag autocomplete, positioned at the cursor. |
| `xml-tag-data.ts` | `BUILT_IN_XML_TAGS`, `XML_TAG_CATEGORIES`, `XmlTag` (type) | The shipped default tags and categories. |
| `xml-tags-store.ts` | `useXmlTagsStore` | Zustand store: user tags plus add/update/remove actions. |

## Cross-references

- **Store:** `xml-tags-store` (this folder)
- **Editor integration:** `@/features/editor/editor-popover-position`
- **Shared:** `@/components/modals/GalleryModal`, `@/components/modals/ConfirmDialog`, `@/lib/storage`, `@/lib/constants`
