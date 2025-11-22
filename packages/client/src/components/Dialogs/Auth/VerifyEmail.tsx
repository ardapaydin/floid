import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { requestVerifyToken } from "@/utils/api/auth";
import { useUser } from "@/utils/api/users";
import { useState } from "react";

export default function VerifyEmailDialog({ children }: { children: React.ReactNode }) {
    const [requested, setRequested] = useState(false);
    const [sending, setSending] = useState(false);
    const user = useUser();
    const [error, setError] = useState("");
    const request = async () => {
        setSending(true)
        const r = await requestVerifyToken();
        if (r.status == 200) setRequested(true)
        else setError(r.data?.message)
        setSending(false)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogTitle className="text-2xl font-bold mb-4 text-white">Email Verification</DialogTitle>

                <div className="gap-4 flex flex-col">
                    <p className="text-sm text-white/80">
                        Your email is not verified. We sent a verification email to <b className="text-white">{user.data?.user?.email}</b>. Please check your inbox and click the verification button.
                    </p>
                </div>

                {requested && <p className="text-sm font-semibold text-green-400 bg-green-950 rounded-lg py-2 px-3">Verification email sent successfully!</p> || (
                    <button
                        onClick={() => request()}
                        disabled={sending}
                        className="mt-4 px-4 justify-center items-center flex disabled:opacity-50 disabled:hover:bg-orange-500 disabled:hover:translate-y-0 disabled:cursor-not-allowed py-2 rounded-lg bg-orange-500 border-b-6 border-gray-400/50 hover:translate-y-0.5 hover:bg-orange-600 text-white cursor-pointer font-semibold transition">
                        Resend Verification Mail
                    </button>
                )}

                {error && <p className="text-red-300 bg-red-950 rounded-lg py-1 px-2 text-sm font-semibold">{error}</p>}
            </DialogContent>
        </Dialog>
    )
}