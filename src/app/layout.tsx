import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import './globals.css';

export const metadata: Metadata = {
    title: 'Futsal Manager',
    description: 'Premium team management',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <div className="flex flex-col md:flex-row min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
                    <Nav />
                    <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
