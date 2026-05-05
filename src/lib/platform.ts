export type PhysicalPlatform = "mac" | "windows"

export function detectPhysicalPlatform(): PhysicalPlatform {
  if (typeof navigator === "undefined") return "windows"
  const hint =
    (navigator as unknown as { userAgentData?: { platform?: string } })
      .userAgentData?.platform ||
    navigator.platform ||
    navigator.userAgent ||
    ""
  const p = hint.toLowerCase()
  if (p.includes("mac") || p.includes("iphone") || p.includes("ipad")) return "mac"
  return "windows"
}
