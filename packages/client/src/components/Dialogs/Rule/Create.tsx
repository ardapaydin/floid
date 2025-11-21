import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createCommunityRule } from "@/utils/api/rules";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";

export default function CreateRule({ children }: { children: React.ReactNode }) {
    const [form, setForm] = useState({
        title: "",
        content: ""
    });
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isOpen, setIsOpen] = useState(false);
    const { name } = useParams();
    const qc = useQueryClient();
    const post = async () => {
        const r = await createCommunityRule(name!, form.title, form.content);
        if (r.status == 200) {
            qc.invalidateQueries({ queryKey: ["communities", name!, "rules"] })
        }
        else setErrors(r.data.errors)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="bg-[#242424]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Add Rule</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="font-bold">Title</label>
                        {errors.name && <p className="text-red-400">{errors.name[0]}</p>}
                        <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                            <input
                                value={form.title}
                                max={64}
                                onChange={(e) => {
                                    setErrors({})
                                    setForm({ ...form, title: e.target.value });
                                }}
                                placeholder="Rule displayed"
                                className="px-4 py-3 rounded-lg w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-bold">Description</label>
                        {errors.name && <p className="text-red-400">{errors.name[0]}</p>}
                        <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                            <textarea
                                value={form.content}
                                onChange={(e) => {
                                    setErrors({})
                                    setForm({ ...form, content: e.target.value });
                                }}
                                maxLength={255}
                                placeholder="Enter description of rule"
                                className="px-4 py-3 rounded-lg w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full border-[#333] border-t justify-end flex">
                    <button
                        onClick={() => post()}
                        disabled={Object.keys(errors).length != 0 || !form.content.length || !form.title.length}
                        className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                        Create
                    </button>

                </div>
            </DialogContent>
        </Dialog>
    )
}