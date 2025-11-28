import Loading from "@/components/Loading/Loading";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAwards } from "@/utils/api/users";
import { useState } from "react";
import { useParams } from "react-router-dom";

export function UserAwards({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const { name } = useParams();

    const awards = useAwards(name!, isOpen)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                {awards.isLoading && <Loading /> || (
                    <div className="flex flex-col gap-2 py-4 max-h-96">
                        {awards.data!.filter(x => x.quantity).map((award) => (
                            <div className="justify-between flex items-center">
                                <div className="flex gap-1 items-center">
                                    <h1>{award.emoji}</h1>
                                    <p>{award.name}</p>
                                </div>
                                <span>{award.quantity}</span>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}