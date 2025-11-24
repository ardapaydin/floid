import type { Flair } from "@/types/flair";

export function FlairView({ flair }: { flair: Flair }) {
    return (
        <div className="px-4 rounded-full" style={{ backgroundColor: flair.color }}>
            {flair.flair}
        </div>
    )
}