'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Chip } from '@/components/ui/chip';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast-provider';
import { FoodInput } from '@/components/ui/food-input';
import { ArrowLeft, Plus, Coffee, X, Edit2, Trash2 } from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { SkeletonList } from '@/components/ui/skeleton';

interface MealItem {
    name: string;
    calories?: number;
}

const MEAL_TYPES = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
];

export default function FoodPage() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingFood, setEditingFood] = useState<any>(null);
    const [deletingFoodId, setDeletingFoodId] = useState<string | null>(null);
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
    const [items, setItems] = useState<MealItem[]>([{ name: '', calories: undefined }]);
    const [notes, setNotes] = useState('');
    const [page, setPage] = useState(1);

    const { data: foodData, isLoading } = useQuery({
        queryKey: ['food', page],
        queryFn: async () => {
            const res = await fetch(`/api/food?page=${page}&limit=20`, { cache: 'no-store' });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    const createMutation = useMutation({
        mutationFn: async (food: { date: string; mealType: string; items: MealItem[]; notes?: string }) => {
            const res = await fetch('/api/food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(food),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['food'] });
            setPage(1);
            setIsModalOpen(false);
            setItems([{ name: '', calories: undefined }]);
            setNotes('');
            toast.success('Food entry added successfully!');
        },
        onError: () => {
            toast.error('Failed to add food entry. Please try again.');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, food }: { id: string; food: any }) => {
            const res = await fetch(`/api/food/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(food),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: async () => {
            // Remove and refetch all food queries
            queryClient.removeQueries({ queryKey: ['food'] });
            await queryClient.refetchQueries({ queryKey: ['food'], type: 'active' });
            setIsEditModalOpen(false);
            setEditingFood(null);
            setItems([{ name: '', calories: undefined }]);
            setNotes('');
            toast.success('Food entry updated successfully!');
        },
        onError: () => {
            toast.error('Failed to update food entry. Please try again.');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/food/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
        onSuccess: async () => {
            // Remove all food queries from cache and refetch
            queryClient.removeQueries({ queryKey: ['food'] });
            await queryClient.refetchQueries({ queryKey: ['food'], type: 'active' });
            setIsDeleteDialogOpen(false);
            setDeletingFoodId(null);
            toast.success('Food entry deleted successfully!');
        },
        onError: () => {
            toast.error('Failed to delete food entry. Please try again.');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const filteredItems = items.filter((item) => item.name.trim() !== '');
        if (filteredItems.length === 0) {
            alert('Please add at least one food item');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        await createMutation.mutateAsync({
            date: today,
            mealType,
            items: filteredItems,
            notes: notes || undefined,
        });
    };

    const addItem = () => {
        setItems([...items, { name: '', calories: undefined }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof MealItem, value: string | number | undefined) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleEdit = (entry: any) => {
        setEditingFood(entry);
        setMealType(entry.mealType);
        setItems(entry.items.length > 0 ? entry.items : [{ name: '', calories: undefined }]);
        setNotes(entry.notes || '');
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFood) return;
        const filteredItems = items.filter((item) => item.name.trim() !== '');
        if (filteredItems.length === 0) {
            toast.warning('Please add at least one food item');
            return;
        }
        await updateMutation.mutateAsync({
            id: editingFood._id,
            food: {
                mealType,
                items: filteredItems,
                notes: notes || undefined,
            },
        });
    };

    const handleDeleteClick = (id: string) => {
        setDeletingFoodId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingFoodId) {
            await deleteMutation.mutateAsync(deletingFoodId);
        }
    };

    const foodEntries = foodData?.entries || [];
    const pagination = foodData?.pagination;
    const groupedByDate = foodEntries.reduce((acc: any, entry: any) => {
        const date = formatDate(entry.date);
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
                                    Food
                                </h1>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Log Meal
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-20">
                {isLoading ? (
                    <div className="space-y-6">
                        <SkeletonList count={3} />
                    </div>
                ) : Object.keys(groupedByDate).length === 0 ? (
                    <Card className="border-0 shadow-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm animate-fade-in">
                        <CardContent className="py-16 text-center">
                            <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Coffee className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 font-medium">No food entries yet</p>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Log Meal
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        {Object.entries(groupedByDate).map(([date, entries]: [string, any], dateIndex: number) => (
                            <Card key={date} className="border-0 shadow-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl animate-slide-up" style={{ animationDelay: `${dateIndex * 50}ms` }}>
                                <CardContent className="p-5">
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{date}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {entries.map((entry: any) => (
                                            <div key={entry._id} className="border-l-4 border-green-500 dark:border-green-400 pl-4 bg-gradient-to-r from-green-50 dark:from-green-900/20 to-transparent rounded-r-lg p-4 hover:shadow-md transition-all duration-200 relative">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-semibold capitalize text-base text-gray-800 dark:text-gray-100">{entry.mealType}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <Coffee className="h-4 w-4 text-green-500 dark:text-green-400" />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(entry)}
                                                            className="h-6 w-6 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            <Edit2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteClick(entry._id)}
                                                            className="h-6 w-6 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <ul className="space-y-1.5">
                                                    {entry.items.map((item: MealItem, idx: number) => (
                                                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 mr-2"></span>
                                                            {item.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {entry.notes && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 italic border-t border-green-100 dark:border-green-800 pt-2">{entry.notes}</p>
                                                )}
                                            </div>
                                        ))}
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Meal" size="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Meal Type</label>
                        <div className="flex flex-wrap gap-2">
                            {MEAL_TYPES.map((mt) => (
                                <Chip
                                    key={mt.value}
                                    label={mt.label}
                                    selected={mealType === mt.value}
                                    onClick={() => setMealType(mt.value as any)}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Food Items</label>
                            <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-lg">
                                <X className="h-3 w-3 mr-1 rotate-45" />
                                Add Item
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-2 animate-scale-in">
                                    <FoodInput
                                        value={item.name}
                                        onChange={(value) => updateItem(index, 'name', value)}
                                        placeholder="Type food name or select from options below..."
                                        className="flex-1 rounded-lg"
                                    />
                                    {items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            className="rounded-lg"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
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
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg"
                        >
                            {createMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingFood(null); }} title="Edit Food Entry" size="lg">
                <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Meal Type</label>
                        <div className="flex flex-wrap gap-2">
                            {MEAL_TYPES.map((mt) => (
                                <Chip
                                    key={mt.value}
                                    label={mt.label}
                                    selected={mealType === mt.value}
                                    onClick={() => setMealType(mt.value as any)}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Food Items</label>
                            <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-lg">
                                <X className="h-3 w-3 mr-1 rotate-45" />
                                Add Item
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-2 animate-scale-in">
                                    <FoodInput
                                        value={item.name}
                                        onChange={(value) => updateItem(index, 'name', value)}
                                        placeholder="Type food name or select from options below..."
                                        className="flex-1 rounded-lg"
                                    />
                                    {items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            className="rounded-lg"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="editNotes" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Notes (optional)
                        </label>
                        <Textarea
                            id="editNotes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="rounded-lg"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingFood(null); }} className="rounded-lg">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg"
                        >
                            {updateMutation.isPending ? 'Updating...' : 'Update'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => { setIsDeleteDialogOpen(false); setDeletingFoodId(null); }}
                onConfirm={handleDeleteConfirm}
                title="Delete Food Entry"
                message="Are you sure you want to delete this food entry? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />

            <NavBar />
        </div>
    );
}
