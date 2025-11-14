import type { Community } from "@/types/community";
import { useCommunities } from "@/utils/api/community";

export default function Header({ community }: { community: Community }) {
    const communities = useCommunities();

    return (
        <div className="flex flex-col relative">
            <div className="w-full bg-[#222] h-32 rounded-lg" />
            <div className="absolute -bottom-12 left-7 right-12 flex items-end gap-2 justify-between">
                <div className="flex gap-2 items-end">
                    <div className="w-24 h-24 bg-[#1d1c1c] rounded-full border-[#1d1c1c] border-5" />
                    <span className="mb-2 font-bold text-2xl">c/{community.name}</span>
                </div>
                <div className="flex">
                    {!communities.data?.find((x) => x.id == community.id) && (
                        <button className="mt-4 w-16 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                            Join
                        </button>
                    )}
                </div>
            </div>
        </div>

    )
}