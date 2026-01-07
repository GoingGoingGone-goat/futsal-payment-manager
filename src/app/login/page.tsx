import { login } from '@/app/actions';
import { Lock } from 'lucide-react';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const { error } = await searchParams;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8 rounded-2xl animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center mb-6">
                    <div className="h-12 w-12 rounded-full bg-[hsl(var(--primary)/20)] flex items-center justify-center text-[hsl(var(--primary))] mb-4">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Admin Access
                    </h1>
                    <p className="text-muted text-sm text-center mt-2">
                        Please enter the team password to continue.
                    </p>
                </div>

                <form action={login} className="space-y-4">
                    <div>
                        <input
                            required
                            name="password"
                            type="password"
                            placeholder="Enter password..."
                            className="input text-center text-lg tracking-widest placeholder:tracking-normal w-full"
                        />
                    </div>

                    {error && (
                        <div className="text-xs text-center text-red-500 bg-red-500/10 p-2 rounded-lg">
                            Incorrect password. Please try again.
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary w-full justify-center text-lg py-3">
                        Unlock Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
}
