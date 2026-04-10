import Sidebar from "@/components/ui/sidebar";
import "../globals.css";
import { DetailPane } from "@/components/ui/detail_pane";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative flex flex-row overflow-hidden w-full h-full">
            <Sidebar />
            <div className="w-full h-full overflow-auto bg-gray-50">
                {children}

            </div>
            <DetailPane />
        </div>
    );
}
