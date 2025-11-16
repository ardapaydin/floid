import { CommunityIcon } from "@/components/Community/Common/Icon";
import Layout from "@/components/Layout/layout";
import { useCommunityByName } from "@/utils/api/community";
import { createCommunityPost } from "@/utils/api/post";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Submit() {
    const { name } = useParams();
    const community = useCommunityByName(name!);
    const [form, setForm] = useState({
        title: "",
        content: ""
    });
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const nav = useNavigate();
    const post = async () => {
        const r = await createCommunityPost(name!, form);
        if (r.status == 200) nav(`/c/${name!}/comments/${r.data.data.id}`)
        else setErrors(r.data.errors)
    }

    if (!community.data) return
    return (
        <Layout>
            <div className="flex flex-col max-w-3xl">
                <div className="flex justify-between">
                    <h1 className="text-white/90 text-2xl font-bold">Create post</h1>
                    <div className="flex items-center bg-[#444] px-3 py-2 rounded-full gap-2">
                        <CommunityIcon community={community.data} className="text-xs w-6 h-6" style={{ fontSize: "0.6rem" }} />
                        <p>c/{community.data.name}</p>
                    </div>
                </div>

                <div className="flex flex-col">
                    {errors.title && <p className="text-red-400">{errors.title[0]}</p>}
                    <input
                        placeholder="Title"
                        maxLength={300}
                        value={form.title}
                        onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({}) }}
                        className="px-4 py-3 rounded-2xl mt-4 bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition"
                    />

                    <div className="justify-end flex text-xs text-muted-foreground px-2">
                        {form.title.length}/300
                    </div>
                </div>

                <div className="flex flex-col">
                    {errors.content && <p className="text-red-400">{errors.content[0]}</p>}
                    <textarea
                        className="px-4 py-3 rounded-2xl mt-4 max-h-96 bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition"
                        rows={12}
                        placeholder="Body text"
                        value={form.content}
                        onChange={(e) => { setForm({ ...form, content: e.target.value }); setErrors({}) }}
                    />
                </div>

                <div className="justify-end flex">
                    <button
                        onClick={() => post()}
                        disabled={!form.content.trim().length || !form.title.trim().length || Object.keys(errors).length != 0}
                        className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                        Post
                    </button>


                </div>
            </div>
        </Layout>
    )
}