import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { User } from "@/types/user";
import { updateUser, useUser } from "@/utils/api/users";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

export default function UpdateEmail({ children }: { children: React.ReactNode }) {
    const user = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({
        email: user.data?.user?.email || "",
        password: ""
    });
    const qc = useQueryClient();
    const [errors, setErrors] = useState<Record<string, string[]>>({})
    const validate = () => {
        if (!form.password?.trim() || !form.email?.trim() || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(form.email)) return false;
        return true;
    }

    const post = async () => {
        const update = await updateUser(form);
        if (update.status == 200) {
            setIsOpen(false);
            toast.success("A verification email has been sent to your new email address")
            qc.setQueryData(["users", "me"], (old: { user: User }) => ({
                ...old,
                user: {
                    ...old.user,
                    email: form.email,
                    emailVerified: false
                }
            }))
        } else setErrors(update.data?.errors)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <h3 className="text-xl font-medium">Email Address</h3>
                <div className="flex flex-col gap-1">
                    <label className="font-bold">Email</label>
                    {errors.email && <p className="text-red-400">{errors.email[0]}</p>}
                    <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                        <input
                            value={form.email}
                            max={64}
                            onChange={(e) => {
                                setErrors({})
                                setForm({ ...form, email: e.target.value });
                            }}
                            className="px-4 py-3 rounded-lg w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="font-bold">Password</label>
                    {errors.password && <p className="text-red-400">{errors.password[0]}</p>}
                    <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                        <input
                            type="password"
                            value={form.password}
                            max={255}
                            onChange={(e) => {
                                setErrors({})
                                setForm({ ...form, password: e.target.value });
                            }}
                            placeholder="************"
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