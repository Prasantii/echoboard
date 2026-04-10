import { FolderSearch } from "lucide-react"

export default function PageNotFound() {
    return (
        <div className="h-full w-full flex flex-col gap-4 justify-center items-center bg-gray-200">
            <FolderSearch size={64} color="var(--color-gray-400)" />
            <p className="flex flex-col items-center text-xs font-medium text-gray-600">
                <span className="font-bold text-xl">
                    404
                </span>
                {' '}Page Not Found
            </p>
        </div>
    );
}