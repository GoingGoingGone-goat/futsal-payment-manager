import { getData } from '@/lib/storage';
import { createPayment, deletePaymentAction } from '@/app/actions';
import { BadgeDollarSign, History, Trash2 } from 'lucide-react';

import { FlashMessage } from '@/components/FlashMessage';

export default async function PaymentsPage() {
    const data = await getData();
    // Sort payments new to old
    const sortedPayments = [...data.payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <FlashMessage />
            <header>
                <h1 className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Payments</h1>
                <p className="text-muted">Track incoming funds.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Record Payment Form */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-6 rounded-2xl sticky top-8">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <BadgeDollarSign size={20} className="text-[hsl(var(--primary))]" /> Record Payment
                        </h2>
                        <form action={createPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-muted">Player</label>
                                <select required name="playerId" className="input">
                                    <option value="">Select Player...</option>
                                    {data.players.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-muted">Amount ($)</label>
                                <input required name="amount" type="number" step="0.01" placeholder="0.00" className="input" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-muted">Season</label>
                                <select name="season" defaultValue="Season 3" className="input">
                                    <option value="Season 3">Season 3</option>
                                    <option value="Season 2">Season 2</option>
                                    <option value="Season 1">Season 1</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-muted">Date Received</label>
                                <input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="input" />
                            </div>

                            <button type="submit" className="btn btn-primary w-full justify-center">Log Payment</button>
                        </form>
                    </div>
                </div>

                {/* Payment History */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <History size={20} className="text-[hsl(var(--muted-foreground))]" /> Payment History
                    </h2>

                    {sortedPayments.length === 0 ? (
                        <div className="glass-card p-12 rounded-2xl text-center text-muted">
                            No payments recorded yet.
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[hsl(var(--accent))] text-muted-foreground text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium">Player</th>
                                        <th className="p-4 font-medium text-right">Amount</th>
                                        <th className="p-4 font-medium w-[50px]"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[hsl(var(--border))]">
                                    {sortedPayments.map(payment => {
                                        const player = data.players.find(p => p.id === payment.playerId);
                                        return (
                                            <tr key={payment.id} className="hover:bg-[hsl(var(--accent)/0.5)] transition-colors">
                                                <td className="p-4 text-sm font-medium">
                                                    {new Date(payment.date).toLocaleDateString()}
                                                </td>
                                                <td className="p-4">
                                                    {player ? player.name : 'Unknown Player'}
                                                </td>
                                                <td className="p-4 text-right font-bold text-[hsl(var(--primary))]">
                                                    +${payment.amount.toFixed(2)}
                                                </td>
                                                <td className="p-4">
                                                    <form action={deletePaymentAction.bind(null, payment.id)}>
                                                        <button type="submit" className="text-muted-foreground hover:text-red-500 transition-colors" title="Delete Payment">
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
        </div >
    );
}
