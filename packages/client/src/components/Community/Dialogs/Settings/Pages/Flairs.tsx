import { FlairView } from "@/components/Community/Common/Member/Flair";
import { CreateFlair } from "@/components/Dialogs/Community/Flairs/Create";
import { UpdateFlair } from "@/components/Dialogs/Community/Flairs/Update";
import Loading from "@/components/Loading/Loading";
import type { Flair } from "@/types/flair";
import { deleteFlair, useFlairs } from "@/utils/api/flairs";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Tag, Trash } from "lucide-react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom"

export function FlairsPage() {
    const { name } = useParams();
    const flairs = useFlairs(name!);
    const qc = useQueryClient();
    const del = async (flairId: string) => {
        const r = await deleteFlair(name!, flairId);
        if (r.status == 200) qc.setQueryData(["communities", name, "flairs"], (old: Flair[]) => old.filter(x => x.id != flairId))
        else toast.error(r.data?.message)
    }

    return (
        <div className="flex flex-col">
            {flairs.isLoading && <Loading /> || (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">
                            Flairs
                        </h1>
                        <CreateFlair>
                            <div className="px-2 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-1 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                                Create Flair
                            </div>
                        </CreateFlair>
                    </div>

                    {(Array.isArray(flairs.data) && !flairs.data.length) && (
                        <div className="mt-32 flex flex-col gap-4 justify-center items-center">
                            <Tag className="w-32 h-32 text-red-500" />
                            <h1 className="font-bold text-2xl">{name} community doesn't have any flairs yet</h1>
                            <CreateFlair>
                                <button
                                    className="px-2 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                                    Create Flair
                                </button>
                            </CreateFlair>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        {flairs.data?.map((flair) => (
                            <div
                                className="p-2 px-4 bg-[#3d3d3d] rounded-lg w-full justify-between flex items-center">
                                <FlairView flair={flair} />
                                <div className="flex gap-2 items-center">
                                    <UpdateFlair flair={flair}>
                                        <Pencil className="w-4 cursor-pointer" />
                                    </UpdateFlair>
                                    <Trash className="w-4 cursor-pointer text-red-400" onClick={() => del(flair.id)} />
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            )}
        </div>
    )
}