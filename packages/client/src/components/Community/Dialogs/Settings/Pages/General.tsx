import { CommunityIcon } from "@/components/Community/Common/Icon";
import type { Community } from "@/types/community";
import { updateCommunity, uploadBanner, uploadIcon, useCommunityByName, useDryrunName } from "@/utils/api/community";
import { useQueryClient } from "@tanstack/react-query";
import { Image, Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function GeneralPage() {
    const { name } = useParams();
    const community = useCommunityByName(name!)

    const [form, setForm] = useState({
        name: name!,
        description: community.data?.description
    });
    const qc = useQueryClient();
    const nav = useNavigate();
    const findname = useDryrunName(form.name)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerFileInputRef = useRef<HTMLInputElement>(null);
    const update = async (field: string, value?: string) => {
        if (!name) return;
        const req = await updateCommunity(name, { [field]: value })
        if (req.status == 200) {
            if (field == "name") {
                nav("/c/" + value);
            }

            qc.setQueryData(["communities", field == "name" ? value : name], (old: Community) => ({
                ...old,
                ...community,
                [field]: value
            }))
            qc.invalidateQueries({ queryKey: ["communities"] })
        }
    }

    const changeIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const form = new FormData();
        form.append("icon", file);

        const r = await uploadIcon(name!, form);
        if (r.status == 200) {
            qc.setQueryData(["communities", name], (old: Community) => ({
                ...old,
                ...community,
                icon: r.data.key
            }))
        }
    }

    const changeBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const form = new FormData();
        form.append("banner", file);

        const r = await uploadBanner(name!, form);
        if (r.status == 200) {
            qc.setQueryData(["communities", name], (old: Community) => ({
                ...old,
                ...community,
                banner: r.data.key
            }))
        }
    }

    if (!community.data) return
    return (
        <div className="flex flex-col flex-1 min-h-full">
            <div className="flex flex-col relative">
                <div className="w-full bg-[#222] h-42 rounded-lg relative cursor-pointer" onClick={() => bannerFileInputRef.current?.click()}>
                    {community.data.banner && <img src={import.meta.env.VITE_CDN_URL + "/banners/" + community.data.banner} className="object-cover w-full h-full rounded-lg" draggable={false} />}
                    <div className="absolute bottom-4 right-4">
                        <Pencil className="w-4 cursor-pointer" />
                    </div>
                    <input
                        ref={bannerFileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={changeBanner}
                    />

                </div>
                <div className="absolute -bottom-12 left-7 right-12 flex items-end gap-2 justify-between">
                    <div className="flex gap-2 items-end">
                        <div className="w-24 h-24 bg-[#1d1c1c] relative rounded-full group border-[#1d1c1c] border-5 flex items-center justify-center">
                            <CommunityIcon community={community.data} className="text-2xl" />
                            <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 bg-[#1d1c1c]/50 absolute hidden group-hover:flex rounded-full cursor-pointer" />
                            <div className="hidden group-hover:flex absolute left-1/2 -translate-x-1/2 cursor-pointer">
                                <Image />
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={changeIcon}
                            />
                        </div>
                        <div className="flex items-end gap-1">
                            <div className="flex flex-col">
                                {(form.name != name && findname.data?.taken) && <p className="text-red-400">This community name is already in use</p>}
                                <span className="mb-2 font-bold text-2xl flex"><p className="text-muted-foreground">c/</p>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                                    />
                                </span>
                            </div>

                            {form.name != name && (
                                <button
                                    onClick={() => update("name", form.name)}
                                    disabled={findname.data?.taken}
                                    className="px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-0.5 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                                    Save
                                </button>
                            )}
                        </div>
                    </div>


                </div>

            </div>

            <div className="py-16 flex flex-col">
                <label>Description</label>
                <textarea
                    maxLength={2048}
                    value={form.description}
                    onChange={(e) => {
                        setForm({ ...form, description: e.target.value })
                    }}
                    placeholder="Description"
                    rows={5}
                    className="px-4 py-3 rounded-lg w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                >{form.description}</textarea>

                <div className="w-full flex justify-end mt-4 items-end">
                    <button
                        onClick={() => update("description", form.description)}
                        disabled={community.data.description == form.description}
                        className="px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-0.5 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                        Save
                    </button>
                </div>

            </div>

        </div>
    )
}