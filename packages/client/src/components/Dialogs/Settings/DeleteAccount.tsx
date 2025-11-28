import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useTwoFactorDialogStore } from "@/store/twoFactorDialogStore";
import { deleteUser } from "@/utils/api/users";
import { removeToken } from "@/utils/auth/user";
import { useState } from "react";

export function DeleteAccount({ children }: { children: React.ReactNode }) {
    const [form, setForm] = useState({
        password: "",
        confirmPassword: ""
    });
    const { setData, setIsOpen } = useTwoFactorDialogStore();
    const [errors, setErrors] = useState<Record<string, string[]>>({})
    const validate = () => {
        if (!form.password?.trim() || !form.confirmPassword?.trim() || form.confirmPassword != form.password) return false;
        return true;
    }

    const post = async () => {
        const del = await deleteUser(form.password);
        if (del.status == 200) {
            removeToken();
            window.location.replace("/")
        } else if (del?.data?.message == "2fa") {
            setData({
                function: post,
                mfa: del.data.mfa
            })
            setIsOpen(true)
        } else setErrors(del.data?.errors)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <h3 className="text-xl font-medium">Delete Account</h3>
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
                    <label className="font-bold">Repeat Password</label>
                    <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                        <input
                            type="password"
                            value={form.confirmPassword}
                            max={255}
                            placeholder="************"
                            onChange={(e) => {
                                setErrors({})
                                setForm({ ...form, confirmPassword: e.target.value });
                            }}
                            className="px-4 py-3 rounded-lg w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                        />
                    </div>
                </div>

                <div className="w-full border-[#555] border-t justify-end flex">
                    <button
                        onClick={() => post()}
                        disabled={Object.keys(errors).length != 0 || !validate()}
                        className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-red-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-red-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                        Delete ;(
                    </button>

                </div>
            </DialogContent>
        </Dialog>
    )
}