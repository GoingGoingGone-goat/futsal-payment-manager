
import { getData } from '@/lib/storage';
import { createFee, deleteFeeAction } from '@/app/actions';
import { BadgeDollarSign, Trash2 } from 'lucide-react';
import { FlashMessage } from '@/components/FlashMessage';

export const dynamic = 'force-dynamic';

export default async function FeesPage() {
    const data = await getData();
    // Sort fees new to old
    const sortedFees = [...data.fees].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <FlashMessage />
            <header>
                <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Fees & Registration</h1>
                <p className="text-muted">Manage annual registration and other one-off costs.</p>
            </header>

            {/* Record Fee Form */}
            <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BadgeDollarSign size={20} className="text-[hsl(var(--secondary))]" /> Add New Fee
                </h2>
                <form action={createFee} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-1">
                        <label htmlFor="player" className="block text-sm font-medium mb-1 text-muted">Player</label>
                        <select required name="playerId" id="player" className="input bg-[hsl(var(--background))]">
                            <option value="">Select Player...</option>
                            {data.players.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium mb-1 text-muted">Amount ($)</label>
                        <input required name="amount" id="amount" type="number" step="0.01" defaultValue="240.00" className="input" />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1 text-muted">Description</label>
                        <input required name="description" id="description" type="text" defaultValue="Registration" placeholder="e.g. Jersey" className="input" />
                    </div>

                    <div>
                        <label htmlFor="season" className="block text-sm font-medium mb-1 text-muted">Season</label>
                        <select name="season" id="season" className="input bg-[hsl(var(--background))]">
                            <option value="Season 3">Season 3</option>
                            <option value="Season 2">Season 2</option>
                            <option value="Season 1">Season 1</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-secondary">Add Fee</button>
                </form>
            </div>

            {/* Fees History */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-[hsl(var(--border))]">
                    <h2 className="text-lg font-semibold">Fee History</h2>
                </div>

                {sortedFees.length === 0 ? (
                    <div className="p-12 text-center text-muted">
                        No fees recorded yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[hsl(var(--accent))] text-muted-foreground text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Player</th>
                                    <th className="p-4 font-medium">Description</th>
                                    <th className="p-4 font-medium">Season</th>
                                    <th className="p-4 font-medium text-right">Amount</th>
                                    <th className="p-4 font-medium text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[hsl(var(--border))]">
                                {sortedFees.map(fee => {
                                    const player = data.players.find(p => p.id === fee.playerId);
                                    return (
                                        <tr key={fee.id} className="hover:bg-[hsl(var(--accent)/0.5)] transition-colors">
                                            <td className="p-4 text-sm text-muted">
                                                {new Date(fee.date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 font-medium">
                                                {player?.name || 'Unknown'}
                                            </td>
                                            <td className="p-4 text-sm">
                                                {fee.description}
                                            </td>
                                            <td className="p-4 text-sm text-muted">
                                                {fee.season}
                                            </td>
                                            <td className="p-4 text-sm font-bold text-right text-[hsl(var(--destructive))]">
                                                -${fee.amount.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <form action={deleteFeeAction.bind(null, fee.id)}>
                                                    <button type="submit" className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
