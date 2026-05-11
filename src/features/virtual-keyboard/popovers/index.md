# virtual-keyboard / popovers

The two floating keyboard popovers (appearance + settings) and their shared Framer Motion config.

| File | Exports | Description |
| --- | --- | --- |
| `KeyboardCustomizePopover.tsx` | `KeyboardCustomizePopover` | Top-left "Appearance" popover: keyboard color and font preset pickers. Slides in from the left. |
| `KeyboardSettingsPopover.tsx` | `KeyboardSettingsPopover`, re-exports `ActiveKeyboard`/`KeyboardPlatform` (types) | Top-right "Settings" popover: keyboard/platform switch, sound/preview toggles, preview mode, reset. Slides in from the right. |
| `keyboard-popover-motion.ts` | `ENTER_EASE`, `EXIT_EASE`, `getPanelVariants(reduceMotion, direction)`, `getChildVariants(reduceMotion)` | Shared enter/exit easing and panel/child variants; `direction` (`"left"`/`"right"`) captures the only difference between the two panels. |

## Cross-references

- **Store:** `../keyboard-store`
- **Presets:** `../keyboard-presets` (customize popover)
- **Shared hooks:** `@/hooks/useEscapeKey` (Escape on `document`, with `stopPropagation`), `@/hooks/useClickOutside` (`[panelRef, triggerRef]`)
- **Settings reads:** `@/stores/global-store` (`websiteTheme`, customize popover)
