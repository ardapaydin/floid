import type { Flair } from "@/types/flair";

export function FlairView({ flair }: { flair: Flair }) {
    if (!flair) return
    return (
        <div className="px-4 rounded-full text-white" style={{ backgroundColor: flair.color }}>
            {flair.flair}
        </div>
    )
}