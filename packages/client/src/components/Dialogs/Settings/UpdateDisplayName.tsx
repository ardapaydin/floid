import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { User } from "@/types/user";
import { updateUser, useUser } from "@/utils/api/users";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

export default function UpdateDisplayName({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const user = useUser();
    const [form, setForm] = useState({ displayName: user.data?.user?.displayName || "" })
    const qc = useQueryClient();

    const [errors, setErrors] = useState<Record<string, string[]>>({})
    const validate = () => {
        if (!form.displayName?.trim() || form.displayName.length > 64) return false;
        return true
    }

    const post = async () => {
        const update = await updateUser(form);
        if (update.status == 200) {
            setIsOpen(false);
            toast.success("Display name updated.");
            qc.setQueryData(["users", "me"], (old: { user: User }) => ({
                ...old,
                user: {
                    ...old.user,
                    displayName: form.displayName
                }
            }))
        } else setErrors(update.data?.errors)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <h3 className="text-xl font-medium">Display Name</h3>

                <div className="flex flex-col gap-1">
                    <label className="font-bold">Display Name</label>
                    {errors.displayName && <p className="text-red-400">{errors.displayName[0]}</p>}
                    <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                        <input
                            value={form.displayName}
                            max={64}
                            onChange={(e) => {
                                setErrors({})
                                setForm({ ...form, displayName: e.target.value });
                            }}
                            className="px-4 py-3 rounded-lg w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                        />
                    </div>
                </div>

                <div className="w-full border-[#555] border-t justify-end flex">
                    <button
                        onClick={() => post()}
                        disabled={Object.keys(errors).length != 0 || !validate()}
                        className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                        Update
                    </button>

                </div>
            </DialogContent>
        </Dialog>
    )
}