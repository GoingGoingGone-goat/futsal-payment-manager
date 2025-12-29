'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Trophy, DollarSign } from 'lucide-react';

export function Nav() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/players', label: 'Players', icon: Users },
        { href: '/games', label: 'Games', icon: Trophy },
        { href: '/payments', label: 'Payments', icon: DollarSign },
    ];

    return (
        <nav className="fixed bottom-0 left-0 w-full md:relative md:w-auto md:h-screen glass border-t md:border-t-0 md:border-r border-[hsl(var(--border))] z-50">
            <div className="flex md:flex-col h-full md:w-64">
                <div className="hidden md:flex items-center p-6 mb-4">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                        Futsal Manager
                    </h1>
                </div>

                <div className="flex md:flex-col justify-around md:justify-start w-full gap-1 md:px-3">
                    {links.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex flex-col md:flex-row items-center md:gap-4 p-4 md:px-6 md:py-4 rounded-xl transition-all ${isActive
                                    ? 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] opacity-100'
                                    : 'text-[hsl(var(--primary))] opacity-70 hover:opacity-100 hover:bg-[hsl(var(--accent))]'
                                    }`}
                            >
                                <Icon size={32} className={isActive ? "stroke-[3px]" : "stroke-2"} />
                                <span className={`text-lg md:text-2xl font-medium ${isActive ? 'font-bold' : ''}`}>{label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
