'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { Chip } from '@/components/ui/chip';
import { ArrowLeft, Plus, IndianRupee } from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [notes, setNotes] = useState('');
    const [page, setPage] = useState(1);

    const { data: expensesData, isLoading } = useQuery({
        queryKey: ['expenses', page],
        queryFn: async () => {
            const res = await fetch(`/api/expenses?page=${page}&limit=20`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
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
            setPage(1); // Reset to first page after creating new entry
            setIsModalOpen(false);
            setAmount('');
            setCategory('Food');
            setNotes('');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const today = new Date().toISOString().split('T')[0];
        await createMutation.mutateAsync({
            date: today,
            amount: parseFloat(amount),
            category,
            currency: 'INR', // Fixed to INR
            notes: notes || undefined,
        });
    };

    const expenses = expensesData?.entries || [];
    const pagination = expensesData?.pagination;
    // Calculate total from all pages (for display, we'll show current page total)
    const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const byCategory = expenses.reduce((acc: any, exp: any) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-bold">Expenses</h1>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Expense
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-20">
                {expenses.length > 0 && (
                    <Card className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                        <CardContent className="py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Total Expenses</p>
                                    <p className="text-3xl font-bold">₹{totalExpenses.toFixed(2)}</p>
                                </div>
                                <IndianRupee className="h-12 w-12 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isLoading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : expenses.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <IndianRupee className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">No expenses yet. Add your first expense!</p>
                            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Expense
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {expenses.map((expense: any) => (
                            <Card key={expense._id} className="hover:shadow-md transition-shadow">
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-blue-600 font-bold text-lg">
                                                        {expense.category.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">{expense.category}</h3>
                                                    <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                                                </div>
                                            </div>
                                            {expense.notes && (
                                                <p className="text-sm text-gray-600 mt-2 ml-15">{expense.notes}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900">
                                                ₹{expense.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                {pagination && (
                    <Pagination
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={setPage}
                        isLoading={isLoading}
                    />
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium mb-2">
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
                        <label className="block text-sm font-medium mb-3">Category</label>
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
                        <label htmlFor="notes" className="block text-sm font-medium mb-2">
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

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                            {createMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </Modal>
            <NavBar />
        </div>
    );
}
