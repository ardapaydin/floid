import Loading from "@/components/Loading/Loading";
import { resetPassword, useResetPasswordToken } from "@/utils/api/auth";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";

export function ResetPassword() {
    const token = new URLSearchParams(window.location.search).get('token');
    const use = useResetPasswordToken(token);
    const nav = useNavigate();
    const [form, setForm] = useState({
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState<Record<string, string[]>>({})

    const validate = () => {
        if (!form.password.trim() || !form.confirmPassword.trim() || form.confirmPassword != form.password) return false;
        return true;
    }

    const post = async () => {
        if (!token) return
        const r = await resetPassword(token, form.password);
        if (r.status == 200) {
            toast.success("Password reset successfully")
            nav("/login")
        } else if (r.data?.errors) setErrors(r.data?.errors)
        else if (r.data?.message) toast.error(r.data.message)
    }

    useEffect(() => {
        if (!use.data?.success) {
            toast.error(use.data?.message || "")
            nav("/")
        }
    }, [use.data?.success, use.data?.message, nav])

    if (!token) return <Navigate to={"/"} />
    if (use.isLoading || !use.data) return <Loading />
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,165,0,0.3),rgba(255,255,255,0))]" />
            <div className="px-2 w-screen h-screen justify-center items-center flex">
                <div className="bg-[#363636] p-8 max-w-lg w-full mx-auto rounded-lg flex flex-col gap-4">
                    <h1 className="font-semibold text-2xl">Reset Password</h1>
                    <div className="flex flex-col gap-1">
                        <label className="text font-bold">Password</label>
                        {errors.password && <p className="text-red-400">{errors.password[0]}</p>}
                        <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                            <input
                                type={"password"}
                                autoComplete="new-password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="Password"
                                className="px-4 py-3 rounded-lg w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                            />
                        </div>

                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text font-bold">Confirm Password</label>
                        <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                            <input
                                type={"password"}
                                autoComplete="new-password"
                                value={form.confirmPassword}
                                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                placeholder="Password"
                                className="px-4 py-3 rounded-lg w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => post()}
                        disabled={!validate()}
                        className="mt-4 w-full justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                        Reset Password
                    </button>

                </div>
            </div>
        </div>
    )
}