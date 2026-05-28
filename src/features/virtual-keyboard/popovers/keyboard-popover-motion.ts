import type { Transition, Variants } from "framer-motion"

const ENTER_EASE = [0.16, 1, 0.3, 1] as const
const EXIT_EASE = [0.4, 0, 1, 1] as const

/**
 * Panel enter/exit variants shared by the keyboard popovers. The customize
 * popover slides from the left ("left"), the settings popover from the right
 * ("right"); everything else is identical.
 */
export function getPanelVariants(
  reduceMotion: boolean | null,
  direction: "left" | "right",
): Variants {
  const sign = direction === "left" ? -1 : 1
  return reduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: { opacity: 0, x: 24 * sign, filter: "blur(6px)" },
        visible: {
          opacity: 1,
          x: 0,
          filter: "blur(0px)",
          transition: {
            duration: 0.26,
            ease: ENTER_EASE,
            when: "beforeChildren",
            staggerChildren: 0.028,
            delayChildren: 0.04,
          } as Transition,
        },
        exit: {
          opacity: 0,
          x: 16 * sign,
          filter: "blur(4px)",
          transition: { duration: 0.2, ease: EXIT_EASE } as Transition,
        },
      }
}

/** Staggered child item variants shared by both keyboard popovers. */
export function getChildVariants(reduceMotion: boolean | null): Variants {
  return reduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 8 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.24, ease: ENTER_EASE } as Transition,
        },
      }
}
