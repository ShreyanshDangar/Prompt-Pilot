# prompt-templates

Gallery of ready-made prompt templates that can be inserted as slash commands.

| File | Exports | Description |
| --- | --- | --- |
| `TemplateGallery.tsx` | `TemplateGallery` | Entry component: the template gallery modal (built on `GalleryModal`) with category filtering and insert/save actions. |
| `template-data.ts` | `TEMPLATES`, `TEMPLATE_CATEGORIES`, `PromptTemplate` (type) | The built-in template catalog and its categories. |

## Cross-references

- **Shared:** `@/components/modals/GalleryModal`
- **Stores read:** `@/features/slash-commands/slash-store` (save a template as a slash command)

This feature has no store of its own; its data is static in `template-data.ts`.
