export default function CommunityBox({ name, description }: { name: string, description: string }) {
    return (
        <div className="bg-[#333]/50 p-4 shadow-black/50 shadow-2xl text-white rounded-lg">
            <h1 className="text-lg font-bold break-all">c/{name || "name"}</h1>
            <p className="mt-2 text-sm text-white/50">{description || "Community description"}</p>
        </div>
    )
}