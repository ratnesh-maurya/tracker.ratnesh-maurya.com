'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Chip } from '@/components/ui/chip';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { ArrowLeft, Plus, Coffee, X } from 'lucide-react';
import { NavBar } from '@/components/layout/NavBar';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
    const [items, setItems] = useState<MealItem[]>([{ name: '', calories: undefined }]);
    const [notes, setNotes] = useState('');
    const [page, setPage] = useState(1);

    const { data: foodData, isLoading } = useQuery({
        queryKey: ['food', page],
        queryFn: async () => {
            const res = await fetch(`/api/food?page=${page}&limit=20`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data.data;
        },
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
            setPage(1); // Reset to first page after creating new entry
            setIsModalOpen(false);
            setItems([{ name: '', calories: undefined }]);
            setNotes('');
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

    const foodEntries = foodData?.entries || [];
    const pagination = foodData?.pagination;
    const groupedByDate = foodEntries.reduce((acc: any, entry: any) => {
        const date = formatDate(entry.date);
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
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
                            <h1 className="text-2xl font-bold">Food</h1>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Log Meal
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
                {isLoading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : Object.keys(groupedByDate).length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Coffee className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">No food entries yet. Log your first meal!</p>
                            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Log Meal
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedByDate).map(([date, entries]: [string, any]) => (
                            <Card key={date}>
                                <CardHeader>
                                    <CardTitle>{date}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {entries.map((entry: any) => (
                                            <div key={entry._id} className="border-l-4 border-green-500 pl-4 bg-green-50 rounded-r-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-semibold capitalize text-lg">{entry.mealType}</h3>
                                                </div>
                                                <ul className="space-y-1">
                                                    {entry.items.map((item: MealItem, idx: number) => (
                                                        <li key={idx} className="text-sm text-gray-700">
                                                            • {item.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {entry.notes && (
                                                    <p className="text-sm text-gray-600 mt-2 italic">{entry.notes}</p>
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
                    <Pagination
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={setPage}
                        isLoading={isLoading}
                    />
                )}
            </main>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Meal" size="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-3">Meal Type</label>
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
                            <label className="block text-sm font-medium">Food Items</label>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="h-3 w-3 mr-1" />
                                Add Item
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <Input
                                        placeholder="Food name"
                                        value={item.name}
                                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                                        className="flex-1"
                                    />
                                    {items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
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
