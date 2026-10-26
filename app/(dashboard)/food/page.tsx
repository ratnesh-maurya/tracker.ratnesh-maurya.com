'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { EmptyState, PageHeader, PageShell, Section } from '@/components/layout/page';
import { Input } from '@/components/ui/input';
import { Chip } from '@/components/ui/chip';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast-provider';
import { PendingTag } from '@/components/ui/pending-tag';
import { SAVED_OFFLINE_MESSAGE, useOfflineCreate } from '@/lib/offline/useOfflineCreate';
import { FoodTagInput } from '@/components/ui/food-tag-input';
import { Edit2, Trash2 } from 'lucide-react';
import { formatDate, getLocalDateString } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { SkeletonList } from '@/components/ui/skeleton';
import { handleApiResponse } from '@/lib/api/client';

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
    const [itemNames, setItemNames] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [page, setPage] = useState(1);

    const { data: foodData, isLoading } = useQuery({
        queryKey: ['food', page],
        queryFn: async () => {
            const res = await fetch(`/api/food?page=${page}&limit=20`, { cache: 'no-store' });
            return handleApiResponse(res);
        },
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // Goes through the offline queue: works without a connection, syncs later
    const createMutation = useOfflineCreate('food', {
        optimistic: true,
        onSaved: (queued) => {
            setPage(1);
            setIsModalOpen(false);
            setItemNames([]);
            setNotes('');
            toast.success(queued ? SAVED_OFFLINE_MESSAGE : 'Food entry added successfully!');
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
            setItemNames([]);
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
        if (itemNames.length === 0) {
            toast.warning('Please add at least one food item');
            return;
        }
        const today = getLocalDateString();
        createMutation.create({
            date: today,
            mealType,
            items: itemNames.map(name => ({ name })),
            notes: notes || undefined,
        });
    };

    const handleEdit = (entry: any) => {
        setEditingFood(entry);
        setMealType(entry.mealType);
        setItemNames(entry.items.map((i: MealItem) => i.name).filter(Boolean));
        setNotes(entry.notes || '');
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFood) return;
        if (itemNames.length === 0) {
            toast.warning('Please add at least one food item');
            return;
        }
        await updateMutation.mutateAsync({
            id: editingFood._id,
            food: {
                mealType,
                items: itemNames.map(name => ({ name })),
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

    const foodEntries = (foodData as any)?.entries || [];
    const pagination = (foodData as any)?.pagination;

    // Build recent foods list from existing entries (deduped, most recent first)
    const recentFoods: string[] = Array.from(
        new Set<string>(
            foodEntries
                .flatMap((e: any) => e.items?.map((i: any) => i.name as string) ?? [])
                .filter(Boolean)
        )
    ).slice(0, 20);
    const groupedByDate = foodEntries.reduce((acc: any, entry: any) => {
        const date = formatDate(entry.date);
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
        return acc;
    }, {});

    return (
        <>
            <PageShell>
                <PageHeader
                    kicker="§ 03 · Food"
                    title={<>What you <em>ate</em></>}
                    action={<Button onClick={() => setIsModalOpen(true)}>Log meal →</Button>}
                />

                {isLoading ? (
                    <SkeletonList count={3} />
                ) : Object.keys(groupedByDate).length === 0 ? (
                    <EmptyState action={<Button onClick={() => setIsModalOpen(true)}>Log meal →</Button>}>
                        No meals logged yet. Start with today’s breakfast.
                    </EmptyState>
                ) : (
                    <div className="animate-fade-in">
                        {Object.entries(groupedByDate).map(([date, entries]: [string, any]) => (
                            <Section key={date} kicker={date} className="mt-8">
                                <ul className="border-b border-border">
                                    {entries.map((entry: any) => (
                                        <li
                                            key={entry._id}
                                            className="flex items-start gap-3 border-t border-border px-1 py-4 transition-colors duration-150 hover:bg-hover sm:gap-5 sm:px-2"
                                        >
                                            <span className="w-20 shrink-0 pt-1.5 font-mono text-xs capitalize text-muted-foreground sm:w-28">{entry.mealType}</span>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-display text-[24px] leading-[1.15] sm:text-[28px]">
                                                    {entry.items.map((item: MealItem) => item.name).join(', ')}
                                                </p>
                                                {entry.notes && <p className="mt-1 text-sm text-muted-foreground">{entry.notes}</p>}
                                            </div>
                                            <div className="flex shrink-0 items-center gap-0.5">
                                                {entry.pending ? (
                                                    <PendingTag />
                                                ) : (
                                                    <>
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} aria-label="Edit meal">
                                                            <Edit2 className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(entry._id)} aria-label="Delete meal" className="text-kicker hover:text-kicker">
                                                            <Trash2 className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </Section>
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
            </PageShell>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Meal" size="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">Meal Type</label>
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
                        <label className="mb-2 block text-sm font-medium text-foreground">
                            Food Items
                            {itemNames.length > 0 && (
                                <span className="ml-2 text-xs text-muted-foreground font-normal">({itemNames.length} added)</span>
                            )}
                        </label>
                        <FoodTagInput
                            value={itemNames}
                            onChange={setItemNames}
                            mealType={mealType}
                            recentFoods={recentFoods}
                        />
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

            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingFood(null); }} title="Edit Food Entry" size="lg">
                <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">Meal Type</label>
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
                        <label className="mb-2 block text-sm font-medium text-foreground">
                            Food Items
                            {itemNames.length > 0 && (
                                <span className="ml-2 text-xs text-muted-foreground font-normal">({itemNames.length} added)</span>
                            )}
                        </label>
                        <FoodTagInput
                            value={itemNames}
                            onChange={setItemNames}
                            mealType={mealType}
                            recentFoods={recentFoods}
                        />
                    </div>

                    <div>
                        <label htmlFor="editNotes" className="mb-2 block text-sm font-medium text-foreground">
                            Notes (optional)
                        </label>
                        <Textarea
                            id="editNotes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingFood(null); }}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
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
        </>
    );
}
