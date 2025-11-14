import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function CommunitySettings({ children }: { children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="flex min-w-[calc(200vh-30px)] h-[calc(100vh-30px)]">

            </DialogContent>
        </Dialog>
    )
}