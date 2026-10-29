import { Loader2Icon } from "lucide-react";

export default function LoadingComponent() {
    return (
        <div className="w-full h-full flex flex-row gap-4 items-center justify-center pt-24 text-gray-400">
            <Loader2Icon size={24} className="animate-spin" />
            <p className="flex items-center justify-center  text-sm">Loading...</p>
        </div>
    );
}
