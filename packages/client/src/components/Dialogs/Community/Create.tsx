import CommunityBox from "@/components/Community/Box";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createCommunity, useDryrunName } from "@/utils/api/community";
import { useState } from "react";

export default function CreateCommunity({ children }: { children: React.ReactNode }) {

    const [form, setForm] = useState({ name: "", description: "" })
    const nameState = useDryrunName(form.name);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const post = async () => {
        const req = await createCommunity(form.name, form.description);
        if (req.status == 200) {
            window.location.href = "/c/" + form.name
        } else setErrors(req.data.errors)
    }


    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="border-0 bg-[#242424] min-w-3xl flex-col flex gap-4">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create Community</DialogTitle>
                </DialogHeader>
                <div className="flex w-full">
                    <div className="flex flex-col gap-4 w-3/5">
                        <div className="flex flex-col gap-1">
                            <label className="text font-bold">Name</label>
                            {errors.name && <p className="text-red-400">{errors.name[0]}</p>}
                            {nameState.data?.taken && <p className="text-red-400">This community name is already in use.</p>}
                            <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                                <input
                                    value={form.name}
                                    max={32}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                                        setErrors({})
                                        setForm({ ...form, name: value });
                                    }}
                                    placeholder="Name"
                                    className="px-4 py-3 rounded-lg w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text font-bold">Description</label>
                            {errors.description && <p className="text-red-400">{errors.description[0]}</p>}
                            <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                                <textarea
                                    maxLength={2048}
                                    value={form.description}
                                    onChange={(e) => {
                                        setErrors({})
                                        setForm({ ...form, description: e.target.value })
                                    }}
                                    placeholder="Description"
                                    rows={5}
                                    className="px-4 py-3 rounded-lg w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 w-1/2">
                        <CommunityBox name={form.name} description={form.description} />
                    </div>

                </div>

                <div className="w-full justify-end flex">
                    <button
                        onClick={() => post()}
                        disabled={Object.keys(errors).length != 0 || !form.description.length || !form.name.length || nameState.data?.taken}
                        className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                        Create
                    </button>
                </div>


            </DialogContent>
        </Dialog>
    )
}