'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Textarea } from '@/components/ui/textarea';
import { Habit } from '@/types';

interface HabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (habit: Partial<Habit>) => Promise<void>;
    habit?: Habit | null;
}

const HABIT_TYPES = [
    { value: 'boolean', label: 'Yes/No' },
    { value: 'count', label: 'Count' },
];

const HABIT_SCHEDULES = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom' },
];

const TIME_RANGES = [
    { value: 'anytime', label: 'Anytime' },
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
];

const HABITUAL_TYPES = [
    { value: 'build', label: 'Build' },
    { value: 'quit', label: 'Quit' },
];

export function HabitModal({ isOpen, onClose, onSave, habit }: HabitModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'boolean' | 'count'>('boolean');
    const [habitualType, setHabitualType] = useState<'build' | 'quit'>('build');
    const [schedule, setSchedule] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
    const [target, setTarget] = useState('');
    const [timeRange, setTimeRange] = useState<'anytime' | 'morning' | 'afternoon' | 'evening'>('anytime');
    const [remindersEnabled, setRemindersEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState('09:30');
    const [reminderMessage, setReminderMessage] = useState('Remember to set off time for a workout today.');
    const [color, setColor] = useState('#3B82F6');
    const [icon, setIcon] = useState('📝');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (habit) {
            setTitle(habit.title);
            setDescription((habit as any).description || '');
            setType(habit.type);
            setSchedule(habit.schedule);
            setTarget(habit.target?.toString() || '');
            setColor(habit.color || '#3B82F6');
            setIcon(habit.icon || '📝');
            setHabitualType((habit as any).habitualType || 'build');
            setTimeRange((habit as any).timeRange || 'anytime');
            // Load reminder settings from existing habit
            const reminders = habit.reminders;
            setRemindersEnabled(reminders?.enabled || false);
            setReminderTime(reminders?.times?.[0] || '09:30');
            setReminderMessage(reminders?.message || 'Remember to set off time for a workout today.');
        } else {
            // Reset to defaults for new habit
            setTitle('');
            setType('boolean');
            setSchedule('daily');
            setTarget('');
            setColor('#3B82F6');
            setIcon('📝');
            setDescription('');
            setHabitualType('build');
            setTimeRange('anytime');
            setRemindersEnabled(false);
            setReminderTime('09:30');
            setReminderMessage('Remember to set off time for a workout today.');
        }
    }, [habit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onSave({
                title,
                description,
                type,
                schedule,
                target: type === 'count' && target ? parseInt(target) : undefined,
                color,
                icon,
                habitualType,
                timeRange,
                reminders: {
                    enabled: remindersEnabled,
                    times: remindersEnabled ? [reminderTime] : [],
                    ...(remindersEnabled && { message: reminderMessage }),
                },
            });
            onClose();
        } catch (error) {
            console.error('Error saving habit:', error);
        } finally {
            setLoading(false);
        }
    };

    const commonIcons = ['📝', '🏃', '💧', '📚', '🧘', '🍎', '💪', '🎯', '🌱', '⭐', '🔥', '🎨'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={habit ? 'Edit Habit' : 'Create Custom Habit'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        NAME
                    </label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Walk"
                        required
                        className="text-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Description
                    </label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                        rows={2}
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">ICON AND COLOR</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Icon</label>
                            <div className="flex flex-wrap gap-2">
                                {commonIcons.map((ic) => (
                                    <button
                                        key={ic}
                                        type="button"
                                        onClick={() => setIcon(ic)}
                                        className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all ${icon === ic ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        {ic}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Color</label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="w-20 h-12"
                                />
                                <div className="flex-1 flex flex-wrap gap-2">
                                    {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-12 h-12 rounded-lg ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                                                }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">HABITUAL TYPE</label>
                    <div className="flex gap-2">
                        {HABITUAL_TYPES.map((ht) => (
                            <Chip
                                key={ht.value}
                                label={ht.label}
                                selected={habitualType === ht.value}
                                onClick={() => setHabitualType(ht.value as 'build' | 'quit')}
                                className="flex-1 justify-center"
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Type</label>
                    <div className="flex flex-wrap gap-2">
                        {HABIT_TYPES.map((t) => (
                            <Chip
                                key={t.value}
                                label={t.label}
                                selected={type === t.value}
                                onClick={() => setType(t.value as 'boolean' | 'count')}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">GOAL PERIOD</label>
                    <div className="flex flex-wrap gap-2">
                        {HABIT_SCHEDULES.map((s) => (
                            <Chip
                                key={s.value}
                                label={s.label}
                                selected={schedule === s.value}
                                onClick={() => setSchedule(s.value as any)}
                            />
                        ))}
                    </div>
                </div>

                {type === 'count' && (
                    <div>
                        <label htmlFor="target" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            GOAL VALUE
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="target"
                                type="number"
                                min="1"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                placeholder="1"
                                className="text-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                            <span className="text-gray-600 dark:text-gray-400">times</span>
                            <span className="text-gray-500 dark:text-gray-500">or more per {schedule === 'daily' ? 'day' : schedule === 'weekly' ? 'week' : 'month'}</span>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">REMINDERS</label>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="reminderMessage" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                Reminder Message
                            </label>
                            <Input
                                id="reminderMessage"
                                value={reminderMessage}
                                onChange={(e) => setReminderMessage(e.target.value)}
                                placeholder="Remember to set off time for a workout today."
                                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Reminders</span>
                            <button
                                type="button"
                                onClick={() => setRemindersEnabled(!remindersEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${remindersEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${remindersEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                        {remindersEnabled && (
                            <div className="space-y-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="reminderTime" className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                        Reminder Time:
                                    </label>
                                    <Input
                                        id="reminderTime"
                                        type="time"
                                        value={reminderTime}
                                        onChange={(e) => setReminderTime(e.target.value)}
                                        className="flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Every day</span>
                                </div>
                                {reminderMessage && (
                                    <div className="mt-2 p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{reminderMessage}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">TIME RANGE</label>
                    <div className="flex flex-wrap gap-2">
                        {TIME_RANGES.map((tr) => (
                            <Chip
                                key={tr.value}
                                label={tr.label}
                                selected={timeRange === tr.value}
                                onClick={() => setTimeRange(tr.value as 'anytime' | 'morning' | 'afternoon' | 'evening')}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" variant="outline" onClick={onClose} className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {loading ? 'Saving...' : habit ? 'Update' : 'Add Habit'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
