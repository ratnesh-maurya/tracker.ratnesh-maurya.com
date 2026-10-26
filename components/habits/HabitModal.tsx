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
        <Modal isOpen={isOpen} onClose={onClose} title={habit ? 'Edit habit' : 'New habit'} size="lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                <div>
                    <label htmlFor="title" className="eyebrow mb-3 block">
                        Name
                    </label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Walk"
                        required
                        
                    />
                </div>

                <div>
                    <label htmlFor="description" className="eyebrow mb-3 block">
                        Description
                    </label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                        rows={2}
                        
                    />
                </div>

                <div>
                    <label className="eyebrow mb-3 block">Icon and colour</label>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block font-mono text-xs text-muted-foreground">Icon</label>
                            <div className="flex flex-wrap gap-2">
                                {commonIcons.map((ic) => (
                                    <button
                                        key={ic}
                                        type="button"
                                        onClick={() => setIcon(ic)}
                                        aria-pressed={icon === ic}
                                        aria-label={`Icon ${ic}`}
                                        className={`flex h-11 w-11 items-center justify-center rounded-full border text-xl transition-colors duration-150 ${icon === ic ? 'border-primary bg-muted' : 'border-border bg-card hover:border-rule'
                                            }`}
                                    >
                                        {ic}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block font-mono text-xs text-muted-foreground">Color</label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="h-11 w-16 cursor-pointer p-1"
                                    aria-label="Custom colour"
                                />
                                <div className="flex-1 flex flex-wrap gap-2">
                                    {['#FF7A18', '#E8336D', '#FFB347', '#C2185B', '#1FA463', '#6B675E'].map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            aria-pressed={color === c}
                                            aria-label={`Colour ${c}`}
                                            className={`h-11 w-11 rounded-full border-2 transition-colors duration-150 ${color === c ? 'border-foreground' : 'border-transparent'
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
                    <label className="eyebrow mb-3 block">Build or quit</label>
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
                    <label className="eyebrow mb-3 block">Type</label>
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
                    <label className="eyebrow mb-3 block">Goal period</label>
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
                        <label htmlFor="target" className="eyebrow mb-3 block">
                            Goal value
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="target"
                                type="number"
                                min="1"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                placeholder="1"
                                
                            />
                            <span className="font-mono text-xs text-muted-foreground">times</span>
                            <span className="font-mono text-xs text-muted-foreground">or more per {schedule === 'daily' ? 'day' : schedule === 'weekly' ? 'week' : 'month'}</span>
                        </div>
                    </div>
                )}

                <div>
                    <label className="eyebrow mb-3 block">Reminders</label>
                    <div className="flex flex-col gap-3">
                        <div>
                            <label htmlFor="reminderMessage" className="mb-2 block font-mono text-xs text-muted-foreground">
                                Reminder Message
                            </label>
                            <Input
                                id="reminderMessage"
                                value={reminderMessage}
                                onChange={(e) => setReminderMessage(e.target.value)}
                                placeholder="Remember to set off time for a workout today."
                                
                            />
                        </div>
                        <div className="flex min-h-[56px] items-center justify-between rounded-inner border border-border bg-muted px-4">
                            <span id="reminders-label" className="text-[15px] font-medium">Remind me</span>
                            <button
                                type="button"
                                onClick={() => setRemindersEnabled(!remindersEnabled)}
                                role="switch"
                                aria-checked={remindersEnabled}
                                aria-labelledby="reminders-label"
                                className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors duration-150 ${remindersEnabled ? 'border-primary bg-primary' : 'border-input bg-card'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 rounded-full ${remindersEnabled ? 'ml-[22px] bg-primary-foreground' : 'ml-[3px] bg-muted-foreground'
                                        }`}
                                />
                            </button>
                        </div>
                        {remindersEnabled && (
                            <div className="flex flex-col gap-3 rounded-inner border border-border p-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <label htmlFor="reminderTime" className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                                        at
                                    </label>
                                    <Input
                                        id="reminderTime"
                                        type="time"
                                        value={reminderTime}
                                        onChange={(e) => setReminderTime(e.target.value)}
                                        className="flex-1"
                                    />
                                    <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">every day</span>
                                </div>
                                {reminderMessage && (
                                    <div className="rounded-tile bg-muted p-3">
                                        <p className="mb-1 font-mono text-xs text-muted-foreground">preview</p>
                                        <p className="text-sm text-body">{reminderMessage}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="eyebrow mb-3 block">Time of day</label>
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

                <div className="flex justify-end gap-2 border-t border-border pt-5">
                    <Button type="button" variant="outline" onClick={onClose} >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? '…' : habit ? 'Save changes' : 'Add habit'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
