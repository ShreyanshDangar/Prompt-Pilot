import { useEffect, useState } from "react"

export function useMinViewport(width: number, height: number): boolean {
  const compute = () => {
    if (typeof window === "undefined") return false
    return window.innerWidth >= width && window.innerHeight >= height
  }

  const [matches, setMatches] = useState<boolean>(compute)

  useEffect(() => {
    if (typeof window === "undefined") return
    const handler = () => setMatches(compute())
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [width, height])

  return matches
}
