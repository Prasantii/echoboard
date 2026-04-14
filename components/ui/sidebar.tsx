"use client"
import { BugPlayIcon, CircleUser, FileText, LayoutDashboard, LogOut, Menu, Settings, Workflow } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./button";
import { useSidebar } from "@/store/sidebar.store";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

export default function Sidebar() {
    const supabase = createClient();

    const { toggle, isShow } = useSidebar();

    const fullPath = usePathname();
    const router = useRouter();
    const currentPath = fullPath.replace("/dashboard", "");

    const navigationMenu = [
        {
            name: "Dashboard",
            icon: <LayoutDashboard size={18} />,
            route: ""
        },
        {
            name: "Feed",
            icon: <FileText size={18} />,
            route: "/feed"
        },
        {
            name: "Integration",
            icon: <Workflow size={18} />,
            route: "/integration"
        },
        // {
        //     name: "Settings",
        //     icon: <Settings size={18} />,
        //     route: "/settings"
        // },
    ];

    const handleNavigation = (route: string) => {
        router.push('/dashboard' + route);
    }

    const handleShowSidebar = () => {
        toggle();
    }

    const handleLogout = async () => {
        // 1. Tell Supabase to invalidate the session
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Error logging out:', error.message);
            return;
        }

        // 2. Clear the local cache and re-run Middleware
        // This ensures the server knows the user is gone
        router.refresh();

        // 3. Send the user back to the login page
        router.push('/auth');
    }

    const visibilityStyle = '';

    return (
        <div className="absolute md:relative h-full flex flex-col bg-gray-300 z-50">

            <div>
                <div className="flex flex-row justify-between items-center  pt-4">
                    {isShow && <h1 className="inline-flex pl-6 gap-1 items-center font-medium text-xl text-center text-primary">
                        ECHOBOARD
                        {/* <span><Image src='/logo.svg' height={24} width={24} alt="logo" /></span> */}
                    </h1>}

                    <Button
                        className=""
                        onClick={handleShowSidebar}
                        variant='link'>
                        <Menu />
                    </Button>


                </div>

            </div>

            <div className={`h-full flex flex-col  px-2 py-4 min-w-60 max-w-lg justify-between ${isShow ? '' : 'hidden'}`}>

                <div className='flex flex-col gap-8'>

                    {/* Menu */}
                    <ul className="flex flex-col gap-2">
                        {navigationMenu.map(({ name, icon, route }, index) => {
                            const isSelected = currentPath === route;
                            const textColor = isSelected ? 'text-primary' : 'text-gray-800';
                            const bgColor = isSelected ? 'bg-accent' : '';
                            const fontStyle = isSelected ? 'font-bold' : 'font-medium';
                            return (
                                <li key={index}
                                    onClick={() => handleNavigation(route)}
                                    className={`inline-flex items-center gap-4 px-4 py-2 rounded-sm text-sm ${fontStyle} cursor-pointer ${textColor} ${bgColor} hover:bg-gray-200/90 transform-all duration-300`}>
                                    <span className="">{icon}</span>
                                    {name}
                                </li>
                            );
                        })}
                    </ul>

                </div>

                <div className="flex flex-col">
                    <div className="inline-flex items-center gap-4 px-4 py-2 rounded-sm text-sm font-medium cursor-pointer hover:bg-gray-200/90 transform-all duration-300">
                        <span><Settings size={18} /></span>
                        Settings
                    </div>
                    <hr />
                    <div className="inline-flex items-center gap-4 px-4 py-2 rounded-sm text-sm font-medium cursor-pointer hover:bg-gray-200/90 transform-all duration-300">
                        <span><CircleUser size={18} /></span>
                        User Profile
                    </div>
                    <div
                        onClick={handleLogout}
                        className="inline-flex items-center gap-4 px-4 py-2 rounded-sm text-sm font-medium cursor-pointer hover:bg-gray-200/90 transform-all duration-300">
                        <span><LogOut size={18} /></span>
                        Logout
                    </div>

                </div>
            </div>




        </div>
    );
}