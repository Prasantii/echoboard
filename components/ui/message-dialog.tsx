"use client"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "./button";
import { useDialog } from "@/store/dialog.store";
import { Trash2 } from "lucide-react";

export function MessageDialog() {
    const { isShow, closeDialog, detail } = useDialog();

    return (
        <Dialog open={isShow}>
            <DialogContent showCloseButton={false} className="sm:max-w-sm">
                <DialogHeader>
                    {detail?.title && <DialogTitle>{detail.title}</DialogTitle>}
                    <DialogDescription>
                        {detail?.message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={(e) => {
                            e.stopPropagation()
                            closeDialog();
                        }}>Cancel</Button>
                    </DialogClose>
                    {(detail?.confirmButton) &&
                        detail.confirmButton}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}