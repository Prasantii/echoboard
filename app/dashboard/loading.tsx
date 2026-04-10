import { Skeleton } from "@/components/ui/skeleton";
import { Loader2Icon } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="h-screen w-full flex items-center justify-center ">
            <Loader2Icon size={64} color="green" className="animate-spin" />
        </div>
    );
}