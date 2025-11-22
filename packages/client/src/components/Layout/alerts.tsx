import { useUser } from "@/utils/api/users"
import VerifyEmailDialog from "../Dialogs/Auth/VerifyEmail";

export default function Alerts() {
    const user = useUser();
    if (!user.isLoading && user.data?.user && !user.data.user.emailVerified) return <div className="bg-red-400 gap-2 flex py-1 justify-center items-center">
        <p>
            Please verify your email to unlock all features
        </p>
        <VerifyEmailDialog>
            <button className="border max-h-min px-2 rounded-full hover:bg-red-500 transition-all cursor-pointer hover:border-red-500">
                Verify
            </button>
        </VerifyEmailDialog>
    </div>

}