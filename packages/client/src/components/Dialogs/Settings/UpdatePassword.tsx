import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { updateUser } from "@/utils/api/users";
import { useState } from "react";

export default function UpdatePassword({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({
        newPassword: "",
        password: "",
        confirmNewPassword: ""
    });
    const [errors, setErrors] = useState<Record<string, string[]>>({})
    const validate = () => {
        if (!form.password?.trim() || !form.newPassword?.trim() || form.newPassword != form.confirmNewPassword) return false;
        return true;
    }

    const post = async () => {
        const update = await updateUser({ password: form.password, newPassword: form.newPassword });
        if (update.status == 200) {
            setIsOpen(false);
            setForm({ password: "", newPassword: "", confirmNewPassword: "" })
        } else setErrors(update.data?.errors)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <h3 className="text-xl font-medium">Change Password</h3>
                <div className="flex flex-col gap-1">
                    <label className="font-bold">Current Password</label>
                    {errors.password && <p className="text-red-400">{errors.password[0]}</p>}
                    <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                        <input
                            type="password"
                            value={form.password}
                            max={255}
                            placeholder="************"
                            onChange={(e) => {
                                setErrors({})
                                setForm({ ...form, password: e.target.value });
                            }}
                            className="px-4 py-3 rounded-lg w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="font-bold">New Password</label>
                    {errors.newPassword && <p className="text-red-400">{errors.newPassword[0]}</p>}
                    <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                        <input
                            type="password"
                            value={form.newPassword}
                            max={255}
                            onChange={(e) => {
                                setErrors({})
                                setForm({ ...form, newPassword: e.target.value });
                            }}
                            placeholder="************"
                            className="px-4 py-3 rounded-lg w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="font-bold">Confirm New Password</label>
                    {errors.confirmNewPassword && <p className="text-red-400">{errors.confirmNewPassword[0]}</p>}
                    <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                        <input
                            type="password"
                            value={form.confirmNewPassword}
                            max={255}
                            onChange={(e) => {
                                setErrors({})
                                setForm({ ...form, confirmNewPassword: e.target.value });
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