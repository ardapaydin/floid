import { Navigate } from "react-router-dom";
import { useUser } from "../../utils/api/users";
import { useState } from "react";
import { login } from "../../utils/api/auth";
import { setToken } from "../../utils/auth/user";
import { User } from "lucide-react";

export default function Login() {
    const user = useUser();
    if (user.data?.user) return <Navigate to={"/"} />

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,165,0,0.3),rgba(255,255,255,0))]" />
            <div className="px-2 w-screen h-screen justify-center items-center flex">
                <div className="bg-[#363636] p-8 max-w-lg w-full mx-auto rounded-lg flex flex-col gap-4">
                    <LoginContent />
                </div>
            </div>
        </div>
    )

}

export function LoginContent() {

    const [form, setForm] = useState({
        email: "",
        password: ""
    })
    const [errors, setErrors] = useState<Record<string, string[]>>({})

    const post = async () => {
        const req = await login(form.email, form.password);
        if (req.status == 200) {
            await setToken(req.data.data.token)
            window.location.href = "/"
        } else setErrors(req.data.errors)
    }

    const validate = () => {
        if (!form.password.trim() || !form.email.trim() || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(form.email)) return false;
        return true;
    }

    return (
        <>
            <h1 className="font-semibold text-2xl">Login</h1>

            <div className="flex flex-col gap-2">
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
                            type="password"
                            autoComplete="new-password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="Password"
                            className="px-4 py-3 rounded-l-lg w-full bg-[#313131] border-b-3 border-[#242323] text-white focus:outline-none transition"
                        />
                    </div>
                </div>

                <button
                    onClick={() => post()}
                    disabled={!validate()}
                    className="mt-4 w-full justify-center items-center flex disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                    <User className="w-5" />
                    Login
                </button>

                <div className="flex justify-end text-sm text-gray-400 mt-2 gap-1">
                    Don't have an account? <a href="/register" className="text-orange-500">Sign up</a>
                </div>
            </div>

        </>
    )
}