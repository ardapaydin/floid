import { Eye, EyeClosed, User } from "lucide-react";
import { useState } from "react"
import { register } from "../../utils/api/auth";
import { setToken } from "../../utils/auth/user";
import { useUser } from "../../utils/api/users";
import { Navigate } from "react-router-dom";

export default function Register() {
    const user = useUser();
    if (user.data?.user) return <Navigate to={"/"} />
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,165,0,0.3),rgba(255,255,255,0))]" />
            <div className="px-2 w-screen h-screen justify-center items-center flex">
                <div className="bg-[#363636] p-8 2xl:w-1/4 rounded-lg flex flex-col gap-4">
                    <RegisterContent />
                </div>
            </div>
        </div>
    )
}

export function RegisterContent() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const post = async () => {
        const req = await register(form.username, form.email, form.password);
        if (req.status == 200) {
            await setToken(req.data.data.token)
            window.location.href = "/"
        } else setErrors(req.data.errors)
    }

    const validate = () => {
        if (!form.username.trim() || !form.password.trim() || !form.email.trim() || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(form.email)) return false;
        return true;
    }

    return (
        <>
            <h1 className="font-semibold text-2xl">Register</h1>

            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                    <label className="text font-bold">Username</label>
                    {errors.username && <p className="text-red-400">{errors.username[0]}</p>}
                    <input
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        placeholder="Username"
                        className="px-4 py-3 rounded-lg bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text font-bold">Email</label>
                    {errors.email && <p className="text-red-400">{errors.email[0]}</p>}
                    <input
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="my@email.com"
                        className="px-4 py-3 rounded-lg bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text font-bold">Password</label>
                    {errors.password && <p className="text-red-400">{errors.password[0]}</p>}
                    <div className="flex focus-within:ring-2 rounded-lg focus-within:ring-orange-400/50 transition">
                        <input
                            type={showPass ? "text" : "password"}
                            autoComplete="new-password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="Password"
                            className="px-4 py-3 rounded-l-lg w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                        />
                        <button
                            onClick={() => setShowPass(!showPass)}
                            className="px-4 py-3 rounded-r-lg bg-[#313131] border-b-3 cursor-pointer border-[#242323] text-white hover:bg-[#2b2b2b] focus:outline-none transition"
                        >
                            {!showPass ? <Eye /> : <EyeClosed />}
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => post()}
                    disabled={!validate()}
                    className="mt-4 w-full justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                    <User className="w-5" />
                    Register
                </button>
                <div className="flex justify-end text-sm text-gray-400 mt-2 gap-1">
                    Don you have an account? <a href="/login" className="text-orange-500">Sign In</a>
                </div>

            </div>

        </>
    )
}