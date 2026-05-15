# token-calculator

Right-panel token/cost estimator for the current prompt and attached images across models.

| File | Exports | Description |
| --- | --- | --- |
| `TokenCalculator.tsx` | `TokenCalculator` | Entry component: model picker + estimated input/output token counts and cost. |

## Cross-references

- **Stores read:** `@/stores/global-store` (default model), `@/features/editor/editor-store` (prompt text), `@/features/images/image-store` (attached images)
- **Model data:** `@/lib/model-data` (`MODELS`, `getModelById`, `estimateTokens`, `estimateImageTokens`)
- **Shared:** `@/hooks/useClickOutside`, `@/hooks/useEscapeKey` (model dropdown)

This feature has no store of its own.
