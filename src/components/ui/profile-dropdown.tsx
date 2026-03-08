"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CreditCard, FileText, LogOut, User, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin, logout as adminLogout } from "@/admin/adminAuth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Profile {
    name: string;
    email: string;
    avatar: string;
    subscription?: string;
}

interface MenuItem {
    label: string;
    value?: string;
    href: string;
    icon: React.ReactNode;
    external?: boolean;
}

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
    compact?: boolean;
}

export function ProfileDropdown({
    compact = false,
    className,
    ...props
}: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const profileData: Profile = {
        name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User",
        email: user?.email || "",
        avatar: user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`,
        subscription: "FREE",
    };

    const menuItems: MenuItem[] = [
        {
            label: "Profile",
            href: "/profile",
            icon: <User className="w-4 h-4" />,
        },
        {
            label: "Subscription",
            value: profileData.subscription,
            href: "/pricing",
            icon: <CreditCard className="w-4 h-4" />,
        },
        {
            label: "Terms & Policies",
            href: "/terms",
            icon: <FileText className="w-4 h-4" />,
            external: false,
        },
    ];

    const handleSignOut = async () => {
        // Clear both Supabase session and admin session
        adminLogout();
        await signOut();
        navigate('/');
    };

    return (
        <div className={cn("relative", className)} {...props}>
            <DropdownMenu onOpenChange={setIsOpen}>
                <div className="group relative">
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                "flex items-center rounded-2xl bg-card border border-border hover:border-border/80 hover:bg-muted/50 hover:shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                compact ? "gap-2 p-2" : "gap-4 p-3"
                            )}
                        >
                            {!compact && (
                                <div className="text-left flex-1 hidden sm:block">
                                    <div className="text-sm font-medium text-foreground tracking-tight leading-tight">
                                        {profileData.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground tracking-tight leading-tight">
                                        {profileData.email}
                                    </div>
                                </div>
                            )}
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-0.5">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-card">
                                        <img
                                            src={profileData.avatar}
                                            alt={profileData.name}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </button>
                    </DropdownMenuTrigger>

                    {/* Bending line indicator on the right */}
                    {!compact && (
                        <div
                            className={cn(
                                "absolute -right-3 top-1/2 -translate-y-1/2 transition-all duration-200 hidden sm:block",
                                isOpen
                                    ? "opacity-100"
                                    : "opacity-60 group-hover:opacity-100"
                            )}
                        >
                            <svg
                                width="12"
                                height="24"
                                viewBox="0 0 12 24"
                                fill="none"
                                className={cn(
                                    "transition-all duration-200",
                                    isOpen
                                        ? "text-primary scale-110"
                                        : "text-muted-foreground group-hover:text-foreground"
                                )}
                                aria-hidden="true"
                            >
                                <path
                                    d="M2 4C6 8 6 16 2 20"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    fill="none"
                                />
                            </svg>
                        </div>
                    )}

                    <DropdownMenuContent
                        align="end"
                        sideOffset={4}
                        className="z-[100] w-64 p-2 bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-xl"
                    >
                        {/* User info header in dropdown for compact mode */}
                        {compact && (
                            <>
                                <div className="px-3 py-2 mb-2">
                                    <div className="text-sm font-medium text-foreground">
                                        {profileData.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {profileData.email}
                                    </div>
                                </div>
                                <DropdownMenuSeparator className="bg-border" />
                            </>
                        )}
                        
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <DropdownMenuItem key={item.label} asChild>
                                    <Link
                                        to={item.href}
                                        className="flex items-center p-3 hover:bg-muted/80 rounded-xl transition-all duration-200 cursor-pointer group hover:shadow-sm border border-transparent hover:border-border/50"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            {item.icon}
                                            <span className="text-sm font-medium text-foreground tracking-tight leading-tight whitespace-nowrap group-hover:text-foreground transition-colors">
                                                {item.label}
                                            </span>
                                        </div>
                                        <div className="flex-shrink-0 ml-auto">
                                            {item.value && (
                                                <span
                                                    className="text-xs font-medium rounded-md py-1 px-2 tracking-tight text-purple-500 bg-purple-500/10 border border-purple-500/20"
                                                >
                                                    {item.value}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </div>

                        <DropdownMenuSeparator className="my-3 bg-gradient-to-r from-transparent via-border to-transparent" />

                        {/* Admin Panel Link - only visible to admins */}
                        {isAdmin() && (
                            <DropdownMenuItem asChild>
                                <Link
                                    to="/admin/dashboard"
                                    className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-primary/10 hover:bg-primary/20 cursor-pointer border border-primary/20 hover:border-primary/30 transition-all group"
                                >
                                    <Shield className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium text-primary">
                                        Admin Panel
                                    </span>
                                </Link>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem asChild>
                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 p-3 duration-200 bg-destructive/10 rounded-xl hover:bg-destructive/20 cursor-pointer border border-transparent hover:border-destructive/30 hover:shadow-sm transition-all group"
                            >
                                <LogOut className="w-4 h-4 text-destructive group-hover:text-destructive" />
                                <span className="text-sm font-medium text-destructive group-hover:text-destructive">
                                    Sign Out
                                </span>
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </div>
            </DropdownMenu>
        </div>
    );
}
