import { CommunityIcon } from "@/components/Community/Common/Icon";
import Layout from "@/components/Layout/layout";
import { useCommunityByName } from "@/utils/api/community";
import { createCommunityPost, uploadAttachment } from "@/utils/api/post";
import { Paperclip, Trash } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

export default function Submit() {
    const { name } = useParams();
    const community = useCommunityByName(name!);
    const [form, setForm] = useState<{ title: string, content: string, attachments: { key: string, id: string }[] }>({
        title: "",
        content: "",
        attachments: []
    });
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const nav = useNavigate();
    const post = async () => {
        const r = await createCommunityPost(name!, { ...form, attachments: form.attachments.map((a) => (a.id)) });
        if (r.status == 200) nav(`/c/${name!}/comments/${r.data.data.id}`)
        else { setErrors(r.data?.errors || {}); toast.error(r.data?.message) }
    }
    const fileinput = useRef<HTMLInputElement>(null)
    const attachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("attachment", file);

        const r = await uploadAttachment(name!, formData);
        if (r.status == 200) setForm(prevForm => ({ ...prevForm, attachments: [...prevForm.attachments, r.data] }))

        e.target.value = '';
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
                    {errors.title && <p className="text-red-400">{errors?.title[0]}</p>}
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

                    <input ref={fileinput} type="file" className="hidden" accept="image/*" onChange={attachment} />

                    <div className="flex flex-col mt-4">
                        {form.attachments.length <= 10 && (
                            <button
                                type="button"
                                onClick={() => fileinput.current?.click()}
                                className="px-4 py-2 rounded-lg bg-[#333] hover:bg-[#444] text-white cursor-pointer transition flex items-center gap-2"
                            >
                                <Paperclip /> Upload Attachment
                            </button>
                        )}

                        {form.attachments.length > 0 && (
                            <div className="mt-2">
                                <div className="flex flex-wrap gap-2">
                                    {form.attachments.map((attachment) => (
                                        <div key={attachment.id} className="bg-black/50 px-3 py-1 rounded text-sm text-white relative">
                                            <div
                                                onClick={() => setForm({ ...form, attachments: form.attachments.filter(x => x.id != attachment.id) })}
                                                className="absolute top-2 right-2 bg-[#444] hover:bg-[#555] transition cursor-pointer p-0.5 rounded-lg">
                                                <Trash className="w-4" />
                                            </div>
                                            <img src={import.meta.env.VITE_CDN_URL + "/attachments/" + attachment.key} className="max-w-64 max-h-32" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
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