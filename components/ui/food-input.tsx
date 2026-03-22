'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from './input';
import { FOOD_CATEGORIES, NORTH_INDIAN_FOODS } from '@/lib/food-items';
import { cn } from '@/lib/utils';
import { Check, Clock, Search } from 'lucide-react';

interface FoodInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    recentFoods?: string[];
}

// Meal-type aware default suggestions shown when input is empty/focused
const MEAL_DEFAULTS: Record<string, string[]> = {
    breakfast: [
        'Poha', 'Upma', 'Aloo Paratha', 'Masala Dosa', 'Idli', 'Vada',
        'Maggi', 'Bread Pakora', 'Dhokla', 'Paratha', 'Chai', 'Coffee',
    ],
    lunch: [
        'Dal Fry', 'Chawal', 'Rajma Chawal', 'Roti', 'Aloo Sabzi', 'Paneer Butter Masala',
        'Chicken Curry', 'Dal Tadka', 'Mix Veg', 'Chole Chawal', 'Biryani', 'Raita',
    ],
    dinner: [
        'Dal Makhani', 'Roti', 'Paneer Tikka', 'Butter Chicken', 'Chicken Biryani',
        'Naan', 'Shahi Paneer', 'Aloo Gobi', 'Dal Chawal', 'Khichdi', 'Soup', 'Dahi',
    ],
    snack: [
        'Samosa', 'Bhel Puri', 'Pani Puri', 'Aloo Tikki', 'Pakora', 'Chai',
        'Kachori', 'Chaat', 'Biscuits', 'Fruit', 'Nuts', 'Nimbu Pani',
    ],
};

export function FoodInput({
    value,
    onChange,
    placeholder,
    className,
    mealType = 'lunch',
    recentFoods = [],
}: FoodInputProps) {
    const [focused, setFocused] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setFocused(false);
                setActiveIdx(-1);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const getSuggestions = useCallback((): { items: string[]; isSearch: boolean } => {
        const q = value.trim().toLowerCase();

        if (!q) {
            // Show recent + meal defaults (deduped)
            const seen = new Set<string>();
            const merged: string[] = [];
            [...recentFoods, ...(MEAL_DEFAULTS[mealType] || [])].forEach((f) => {
                if (!seen.has(f.toLowerCase())) {
                    seen.add(f.toLowerCase());
                    merged.push(f);
                }
            });
            return { items: merged.slice(0, 14), isSearch: false };
        }

        // Fuzzy search — items that START with query first, then items that CONTAIN query
        const starts: string[] = [];
        const contains: string[] = [];
        for (const food of NORTH_INDIAN_FOODS) {
            const lower = food.toLowerCase();
            if (lower.startsWith(q)) starts.push(food);
            else if (lower.includes(q)) contains.push(food);
        }
        const results = [...starts, ...contains].slice(0, 12);
        return { items: results, isSearch: true };
    }, [value, mealType, recentFoods]);

    const { items: suggestions, isSearch } = getSuggestions();
    const open = focused && suggestions.length > 0;

    const select = (food: string) => {
        onChange(food);
        setFocused(false);
        setActiveIdx(-1);
        inputRef.current?.blur();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx((i) => Math.max(i - 1, -1));
        } else if (e.key === 'Enter' && activeIdx >= 0) {
            e.preventDefault();
            select(suggestions[activeIdx]);
        } else if (e.key === 'Escape') {
            setFocused(false);
            setActiveIdx(-1);
        }
    };

    // Scroll active item into view
    useEffect(() => {
        if (activeIdx >= 0 && listRef.current) {
            const el = listRef.current.children[activeIdx] as HTMLElement;
            el?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIdx]);

    const defaultPlaceholder = placeholder ??
        (mealType === 'breakfast' ? 'e.g. Poha, Dosa, Chai…' :
         mealType === 'snack' ? 'e.g. Samosa, Chai…' :
         'e.g. Dal, Roti, Biryani…');

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => { onChange(e.target.value); setActiveIdx(-1); }}
                    onFocus={() => setFocused(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={defaultPlaceholder}
                    autoComplete="off"
                    className={cn('pl-8', className)}
                />
            </div>

            {open && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl shadow-black/20 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
                    {/* Section label */}
                    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
                        {isSearch
                            ? <Search className="h-3 w-3 text-muted-foreground" />
                            : <Clock className="h-3 w-3 text-muted-foreground" />
                        }
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {isSearch
                                ? `${suggestions.length} match${suggestions.length !== 1 ? 'es' : ''}`
                                : recentFoods.length > 0 ? 'Recent & suggested' : `${mealType} suggestions`
                            }
                        </span>
                    </div>

                    <ul
                        ref={listRef}
                        className="max-h-56 overflow-y-auto py-1"
                        role="listbox"
                    >
                        {suggestions.map((food, i) => {
                            const isRecent = recentFoods.includes(food);
                            const isActive = i === activeIdx;
                            const isSelected = food === value;

                            return (
                                <li
                                    key={food}
                                    role="option"
                                    aria-selected={isSelected}
                                    onMouseDown={(e) => { e.preventDefault(); select(food); }}
                                    onMouseEnter={() => setActiveIdx(i)}
                                    className={cn(
                                        'flex items-center justify-between px-3 py-2 cursor-pointer text-sm transition-colors select-none',
                                        isActive ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/50',
                                    )}
                                >
                                    <span className="flex items-center gap-2 min-w-0">
                                        {isRecent && !isSearch && (
                                            <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                        )}
                                        {/* Bold the matching part when searching */}
                                        {isSearch && value.trim() ? (
                                            <HighlightMatch text={food} query={value.trim()} />
                                        ) : (
                                            <span>{food}</span>
                                        )}
                                    </span>
                                    {isSelected && (
                                        <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                    {/* Quick type hint */}
                    {!isSearch && (
                        <div className="px-3 py-2 border-t border-border">
                            <p className="text-[10px] text-muted-foreground">
                                Start typing to search all foods
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
        <span>
            {text.slice(0, idx)}
            <mark className="bg-transparent font-semibold text-foreground not-italic">
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </span>
    );
}
