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
            setPage(1);
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
                    <div className="text-center py-12 animate-pulse text-gray-400">Loading...</div>
                ) : Object.keys(groupedByDate).length === 0 ? (
                    <Card className="border-0 shadow-md bg-white/90 backdrop-blur-sm animate-fade-in">
                        <CardContent className="py-16 text-center">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Coffee className="h-8 w-8 text-green-600" />
                            </div>
                            <p className="text-gray-600 mb-4 font-medium">No food entries yet</p>
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
                            <Card key={date} className="border-0 shadow-sm bg-white/90 backdrop-blur-sm rounded-xl animate-slide-up" style={{ animationDelay: `${dateIndex * 50}ms` }}>
                                <CardContent className="p-5">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">{date}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {entries.map((entry: any) => (
                                            <div key={entry._id} className="border-l-4 border-green-500 pl-4 bg-gradient-to-r from-green-50 to-transparent rounded-r-lg p-4 hover:shadow-md transition-all duration-200">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-semibold capitalize text-base text-gray-800">{entry.mealType}</h3>
                                                    <Coffee className="h-4 w-4 text-green-500" />
                                                </div>
                                                <ul className="space-y-1.5">
                                                    {entry.items.map((item: MealItem, idx: number) => (
                                                        <li key={idx} className="text-sm text-gray-700 flex items-center">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                                                            {item.name}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {entry.notes && (
                                                    <p className="text-xs text-gray-600 mt-3 italic border-t border-green-100 pt-2">{entry.notes}</p>
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
                        <label className="block text-sm font-medium mb-3 text-gray-700">Meal Type</label>
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
                            <label className="block text-sm font-medium text-gray-700">Food Items</label>
                            <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-lg">
                                <X className="h-3 w-3 mr-1 rotate-45" />
                                Add Item
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-2 animate-scale-in">
                                    <Input
                                        placeholder="Food name"
                                        value={item.name}
                                        onChange={(e) => updateItem(index, 'name', e.target.value)}
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
                        <label htmlFor="notes" className="block text-sm font-medium mb-2 text-gray-700">
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
            <NavBar />
        </div>
    );
}
