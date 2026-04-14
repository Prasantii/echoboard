"use client"
import Sidebar from "@/components/ui/sidebar";
import "../globals.css";
import { DetailPane } from "@/components/ui/detail_pane";

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
import { useDialog } from "@/store/dialog.store";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { MessageDialog } from "@/components/ui/message-dialog";


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <div className="relative flex flex-row overflow-hidden w-full h-full">
            <Sidebar />
            <div className="w-full h-full pl-6 md:pl-0 overflow-auto bg-gray-50">
                {children}

            </div>
            <DetailPane />
            <MessageDialog />


        </div>
    );
}
