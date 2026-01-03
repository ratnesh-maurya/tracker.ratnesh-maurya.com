'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
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
            setPage(1);
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
            currency: 'INR',
            notes: notes || undefined,
        });
    };

    const expenses = expensesData?.entries || [];
    const pagination = expensesData?.pagination;
    const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 transition-smooth">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
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
                    <div className="text-center py-12 animate-pulse text-gray-400">Loading...</div>
                ) : expenses.length === 0 ? (
                    <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm animate-fade-in">
                        <CardContent className="py-16 text-center">
                            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <IndianRupee className="h-8 w-8 text-yellow-600" />
                            </div>
                            <p className="text-gray-600 mb-4 font-medium">No expenses yet</p>
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
                                className="border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white/90 backdrop-blur-sm rounded-xl animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-sm">
                                                    <span className="text-white font-bold text-lg">
                                                        {expense.category.charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg text-gray-800">{expense.category}</h3>
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium mb-2 text-gray-700">
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
                        <label className="block text-sm font-medium mb-3 text-gray-700">Category</label>
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
                        <label htmlFor="notes" className="block text-sm font-medium mb-2 text-gray-700">
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
            <NavBar />
        </div>
    );
}
