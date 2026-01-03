'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Chip } from '@/components/ui/chip';
import { useToast } from '@/components/ui/toast-provider';
import { ArrowLeft, Plus, IndianRupee, Edit2, Trash2 } from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
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
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const createMutation = useMutation({
        mutationFn: async (expense: any) => {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            setPage(1);
            setIsModalOpen(false);
            setAmount('');
            setCategory('Food');
            setNotes('');
            toast.success('Expense added successfully!');
        },
        onError: () => {
            toast.error('Failed to add expense. Please try again.');
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
        await createMutation.mutateAsync({
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
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/40 dark:to-amber-900/40">
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-smooth">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                    Expenses
                                </h1>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-20">
                {expenses.length > 0 && (
                    <div className="animate-fade-in mb-6">
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                            <CardContent className="py-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-yellow-100 text-sm mb-1 font-medium">Total Expenses</p>
                                        <p className="text-3xl font-bold">₹{totalExpenses.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                                        <IndianRupee className="h-8 w-8" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {isLoading ? (
                    <div className="space-y-3">
                        <SkeletonList count={5} />
                    </div>
                ) : expenses.length === 0 ? (
                    <Card className="border border-white/30 dark:border-white/10 shadow-xl bg-white/40 dark:bg-gray-800/70 backdrop-blur-2xl animate-fade-in">
                        <CardContent className="py-16 text-center">
                            <div className="bg-yellow-100 dark:bg-yellow-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IndianRupee className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 font-medium">No expenses yet</p>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Expense
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3 animate-fade-in">
                        {expenses.map((expense: any, index: number) => (
                            <Card
                                key={expense._id}
                                className="border border-white/30 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-200 bg-white/40 dark:bg-gray-800/70 backdrop-blur-2xl animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <CardContent className="py-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-sm flex-shrink-0">
                                                    <span className="text-white font-bold text-lg">
                                                        {expense.category.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-base md:text-lg text-gray-800 dark:text-gray-100 truncate">{expense.category}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(expense.date)}</p>
                                                </div>
                                            </div>
                                            {expense.notes && (
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 ml-15 truncate">{expense.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <div className="text-right">
                                                <div className="text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                                    ₹{expense.amount.toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(expense)}
                                                    className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 h-8 w-8"
                                                >
                                                    <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteClick(expense._id)}
                                                    className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 h-8 w-8"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                {pagination && (
                    <div className="mt-6">
                        <Pagination
                            page={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={setPage}
                            isLoading={isLoading}
                        />
                    </div>
                )}
            </main>

            {/* Add Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
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
                            className="text-lg rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Category</label>
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
                        <label htmlFor="notes" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Notes (optional)
                        </label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Add any notes about this expense..."
                            className="rounded-lg"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-lg">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg"
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
                        <label htmlFor="edit-amount" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
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
                            className="text-lg rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Category</label>
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
                        <label htmlFor="edit-notes" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Notes (optional)
                        </label>
                        <Textarea
                            id="edit-notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Add any notes about this expense..."
                            className="rounded-lg"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
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
                            className="rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg"
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

            <NavBar />
        </div>
    );
}
