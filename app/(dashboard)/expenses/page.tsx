'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { EmptyState, PageHeader, PageShell, Section, Stat } from '@/components/layout/page';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Chip } from '@/components/ui/chip';
import { useToast } from '@/components/ui/toast-provider';
import { PendingTag } from '@/components/ui/pending-tag';
import { SAVED_OFFLINE_MESSAGE, useOfflineCreate } from '@/lib/offline/useOfflineCreate';
import { Edit2, Trash2 } from 'lucide-react';
import { formatDate, getLocalDateString } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { handleApiResponse } from '@/lib/api/client';
import { SkeletonList } from '@/components/ui/skeleton';

const CATEGORIES = [
    'Food',
    'Transport',
    'Entertainment',
    'Shopping',
    'Bills',
    'Healthcare',
    'Education',
    'Travel',
    'Other',
];

export default function ExpensesPage() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);
    const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [notes, setNotes] = useState('');
    const [page, setPage] = useState(1);

    const { data: expensesData, isLoading } = useQuery({
        queryKey: ['expenses', page],
        queryFn: async () => {
            const res = await fetch(`/api/expenses?page=${page}&limit=20`, { cache: 'no-store' });
            return handleApiResponse(res);
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // Goes through the offline queue: works without a connection, syncs later
    const createMutation = useOfflineCreate('expenses', {
        optimistic: true,
        onSaved: (queued) => {
            setPage(1);
            setIsModalOpen(false);
            setAmount('');
            setCategory('Food');
            setNotes('');
            toast.success(queued ? SAVED_OFFLINE_MESSAGE : 'Expense added successfully!');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, expense }: { id: string; expense: any }) => {
            const res = await fetch(`/api/expenses/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: async () => {
            // Remove and refetch all expense queries
            queryClient.removeQueries({ queryKey: ['expenses'] });
            await queryClient.refetchQueries({ queryKey: ['expenses'], type: 'active' });
            setIsEditModalOpen(false);
            setEditingExpense(null);
            toast.success('Expense updated successfully!');
        },
        onError: () => {
            toast.error('Failed to update expense. Please try again.');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/expenses/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: async () => {
            // Remove all expense queries from cache and refetch
            queryClient.removeQueries({ queryKey: ['expenses'] });
            await queryClient.refetchQueries({ queryKey: ['expenses'], type: 'active' });
            setIsDeleteDialogOpen(false);
            setDeletingExpenseId(null);
            toast.success('Expense deleted successfully!');
        },
        onError: () => {
            toast.error('Failed to delete expense. Please try again.');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const today = getLocalDateString();
        createMutation.create({
            date: today,
            amount: parseFloat(amount),
            category,
            currency: 'INR',
            notes: notes || undefined,
        });
    };

    const handleEdit = (expense: any) => {
        setEditingExpense(expense);
        setAmount(expense.amount.toString());
        setCategory(expense.category);
        setNotes(expense.notes || '');
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingExpense) return;
        await updateMutation.mutateAsync({
            id: editingExpense._id,
            expense: {
                amount: parseFloat(amount),
                category,
                notes: notes || undefined,
            },
        });
    };

    const handleDeleteClick = (id: string) => {
        setDeletingExpenseId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingExpenseId) {
            await deleteMutation.mutateAsync(deletingExpenseId);
        }
    };

    const expenses = (expensesData as any)?.entries || [];
    const pagination = (expensesData as any)?.pagination;
    const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

    return (
        <>
            <PageShell>
                <PageHeader
                    kicker="§ 06 · Expenses"
                    title={<>Where the <em>money</em> went</>}
                    action={<Button onClick={() => setIsModalOpen(true)}>Add expense →</Button>}
                />

                {expenses.length > 0 && (
                    <dl className="mb-12 grid grid-cols-2 gap-x-6 sm:grid-cols-4">
                        <Stat label="on this page, ₹" value={totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })} className="border-t border-border pt-4" />
                        <Stat label="entries" value={expenses.length} className="border-t border-border pt-4" />
                    </dl>
                )}

                <Section kicker="§ 01 · Ledger">
                    {isLoading ? (
                        <SkeletonList count={5} />
                    ) : expenses.length === 0 ? (
                        <EmptyState action={<Button onClick={() => setIsModalOpen(true)}>Add expense →</Button>}>
                            No expenses yet. The first one is the hardest.
                        </EmptyState>
                    ) : (
                        <ul className="border-b border-border animate-fade-in">
                            {expenses.map((expense: any) => (
                                <li
                                    key={expense._id}
                                    className="flex items-center gap-3 border-t border-border px-1 py-4 transition-colors duration-150 hover:bg-hover sm:gap-5 sm:px-2"
                                >
                                    <span className="hidden w-28 shrink-0 font-mono text-xs text-muted-foreground sm:block">{formatDate(expense.date)}</span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold text-foreground">{expense.category}</p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            <span className="font-mono text-xs sm:hidden">{formatDate(expense.date)}{expense.notes ? ' · ' : ''}</span>
                                            {expense.notes}
                                        </p>
                                    </div>
                                    <span className="shrink-0 whitespace-nowrap font-display text-[26px] leading-none sm:text-[30px]">
                                        ₹{expense.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </span>
                                    <div className="flex shrink-0 items-center gap-0.5">
                                        {expense.pending ? (
                                            <PendingTag />
                                        ) : (
                                            <>
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)} aria-label="Edit expense">
                                                    <Edit2 className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(expense._id)} aria-label="Delete expense" className="text-kicker hover:text-kicker">
                                                    <Trash2 className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {pagination && (
                        <Pagination
                            page={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={setPage}
                            isLoading={isLoading}
                        />
                    )}
                </Section>
            </PageShell>

            {/* Add Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="amount" className="mb-2 block text-sm font-medium text-foreground">
                            Amount (₹)
                        </label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="text-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <Chip
                                    key={cat}
                                    label={cat}
                                    selected={category === cat}
                                    onClick={() => setCategory(cat)}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="notes" className="mb-2 block text-sm font-medium text-foreground">
                            Notes (optional)
                        </label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Add any notes about this expense..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => {
                setIsEditModalOpen(false);
                setEditingExpense(null);
                setAmount('');
                setCategory('Food');
                setNotes('');
            }} title="Edit Expense">
                <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="edit-amount" className="mb-2 block text-sm font-medium text-foreground">
                            Amount (₹)
                        </label>
                        <Input
                            id="edit-amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="text-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <Chip
                                    key={cat}
                                    label={cat}
                                    selected={category === cat}
                                    onClick={() => setCategory(cat)}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="edit-notes" className="mb-2 block text-sm font-medium text-foreground">
                            Notes (optional)
                        </label>
                        <Textarea
                            id="edit-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Add any notes about this expense..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsEditModalOpen(false);
                                setEditingExpense(null);
                                setAmount('');
                                setCategory('Food');
                                setNotes('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setDeletingExpenseId(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Delete Expense"
                message="Are you sure you want to delete this expense? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </>
    );
}
