'use client';

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { NORTH_INDIAN_FOODS } from '@/lib/food-items';
import { cn } from '@/lib/utils';
import { Check, Clock, Search, X } from 'lucide-react';

interface FoodTagInputProps {
    value: string[];
    onChange: (value: string[]) => void;
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    recentFoods?: string[];
    className?: string;
    placeholder?: string;
}

const MEAL_DEFAULTS: Record<string, string[]> = {
    breakfast: ['Poha', 'Upma', 'Aloo Paratha', 'Masala Dosa', 'Idli', 'Vada', 'Maggi', 'Bread Pakora', 'Dhokla', 'Paratha', 'Chai', 'Coffee'],
    lunch: ['Dal Fry', 'Chawal', 'Rajma Chawal', 'Roti', 'Aloo Sabzi', 'Paneer Butter Masala', 'Chicken Curry', 'Dal Tadka', 'Mix Veg', 'Chole Chawal', 'Biryani', 'Raita'],
    dinner: ['Dal Makhani', 'Roti', 'Paneer Tikka', 'Butter Chicken', 'Chicken Biryani', 'Naan', 'Shahi Paneer', 'Aloo Gobi', 'Dal Chawal', 'Khichdi', 'Soup', 'Dahi'],
    snack: ['Samosa', 'Bhel Puri', 'Pani Puri', 'Aloo Tikki', 'Pakora', 'Chai', 'Kachori', 'Chaat', 'Biscuits', 'Fruit', 'Nuts', 'Nimbu Pani'],
};

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

export function FoodTagInput({
    value: tags,
    onChange,
    mealType = 'lunch',
    recentFoods = [],
    className,
    placeholder,
}: FoodTagInputProps) {
    const [input, setInput] = useState('');
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
        const q = input.trim().toLowerCase();

        if (!q) {
            const seen = new Set<string>(tags.map(t => t.toLowerCase()));
            const merged: string[] = [];
            [...recentFoods, ...(MEAL_DEFAULTS[mealType] || [])].forEach((f) => {
                if (!seen.has(f.toLowerCase())) {
                    seen.add(f.toLowerCase());
                    merged.push(f);
                }
            });
            return { items: merged.slice(0, 14), isSearch: false };
        }

        const starts: string[] = [];
        const contains: string[] = [];
        const addedLower = new Set(tags.map(t => t.toLowerCase()));
        for (const food of NORTH_INDIAN_FOODS) {
            const lower = food.toLowerCase();
            if (addedLower.has(lower)) continue;
            if (lower.startsWith(q)) starts.push(food);
            else if (lower.includes(q)) contains.push(food);
        }
        const results = [...starts, ...contains].slice(0, 10);
        return { items: results, isSearch: true };
    }, [input, mealType, recentFoods, tags]);

    const { items: suggestions, isSearch } = getSuggestions();

    // Show dropdown when focused, even if empty (show defaults)
    const open = focused && suggestions.length > 0;

    const addTag = useCallback((food: string) => {
        const trimmed = food.trim();
        if (!trimmed) return;
        if (tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
            // Already added — just clear input
            setInput('');
            setActiveIdx(-1);
            return;
        }
        onChange([...tags, trimmed]);
        setInput('');
        setActiveIdx(-1);
        // Keep focus on input for next entry
        setTimeout(() => inputRef.current?.focus(), 0);
    }, [tags, onChange]);

    const removeTag = useCallback((index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    }, [tags, onChange]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (open && activeIdx >= 0) {
                addTag(suggestions[activeIdx]);
            } else if (input.trim()) {
                // Custom food — add as-is even if no match
                addTag(input.trim());
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, -1));
        } else if (e.key === 'Escape') {
            setFocused(false);
            setActiveIdx(-1);
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            // Remove last tag on backspace when input is empty
            removeTag(tags.length - 1);
        }
    };

    // Scroll active item into view
    useEffect(() => {
        if (activeIdx >= 0 && listRef.current) {
            const el = listRef.current.children[activeIdx] as HTMLElement;
            el?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIdx]);

    const defaultPlaceholder = placeholder ?? (
        tags.length > 0 ? 'Add more…' :
        mealType === 'breakfast' ? 'e.g. Poha, Chai… (Enter to add)' :
        mealType === 'snack' ? 'e.g. Samosa, Chai… (Enter to add)' :
        'e.g. Dal, Roti… (Enter to add)'
    );

    return (
        <div ref={containerRef} className={cn('relative w-full', className)}>
            {/* Tag container + input */}
            <div
                className={cn(
                    'min-h-[44px] w-full flex flex-wrap items-center gap-1.5 px-4 py-2 rounded-inner border bg-card text-base transition-colors duration-150 cursor-text',
                    focused
                        ? 'border-rule'
                        : 'border-border hover:border-rule',
                )}
                onClick={() => inputRef.current?.focus()}
            >
                {/* Pills */}
                {tags.map((tag, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-mono text-[12.5px] font-medium text-secondary-foreground shrink-0"
                    >
                        {tag}
                        <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); removeTag(i); }}
                            className="ml-0.5 text-muted-foreground transition-colors duration-150 hover:text-foreground"
                            tabIndex={-1}
                        >
                            <X className="h-3 w-3" strokeWidth={1.8} aria-hidden />
                        </button>
                    </span>
                ))}

                {/* Text input */}
                <div className="relative flex-1 min-w-[120px] flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => { setInput(e.target.value); setActiveIdx(-1); }}
                        onFocus={() => setFocused(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={defaultPlaceholder}
                        autoComplete="off"
                        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-base min-w-0"
                    />
                </div>
            </div>

            {/* Hint */}
            {focused && input.trim() && !isSearch && (
                <p className="font-mono text-[11px] text-muted-foreground mt-1.5 px-2">
                    Press <kbd className="px-1 py-0.5 rounded bg-muted text-[11px]">Enter</kbd> to add &quot;{input.trim()}&quot; as a custom item
                </p>
            )}
            {focused && input.trim() && isSearch && suggestions.length === 0 && (
                <p className="font-mono text-[11px] text-muted-foreground mt-1.5 px-2">
                    No match — press <kbd className="px-1 py-0.5 rounded bg-muted text-[11px]">Enter</kbd> to add &quot;{input.trim()}&quot;
                </p>
            )}

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-popover border border-border rounded-inner shadow-pop overflow-hidden animate-fade-in">
                    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
                        {isSearch
                            ? <Search className="h-3 w-3 text-muted-foreground" />
                            : <Clock className="h-3 w-3 text-muted-foreground" />
                        }
                        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                            {isSearch
                                ? `${suggestions.length} match${suggestions.length !== 1 ? 'es' : ''}`
                                : recentFoods.length > 0 ? 'Recent & suggested' : `${mealType} suggestions`
                            }
                        </span>
                    </div>

                    <ul ref={listRef} className="max-h-52 overflow-y-auto py-1" role="listbox">
                        {suggestions.map((food, i) => {
                            const isRecent = recentFoods.includes(food);
                            const isActive = i === activeIdx;

                            return (
                                <li
                                    key={food}
                                    role="option"
                                    aria-selected={isActive}
                                    onMouseDown={(e) => { e.preventDefault(); addTag(food); }}
                                    onMouseEnter={() => setActiveIdx(i)}
                                    className={cn(
                                        'flex min-h-[40px] items-center justify-between px-4 py-2 cursor-pointer text-sm transition-colors duration-150 select-none',
                                        isActive ? 'bg-hover text-foreground' : 'text-foreground hover:bg-hover',
                                    )}
                                >
                                    <span className="flex items-center gap-2 min-w-0">
                                        {isRecent && !isSearch && (
                                            <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                        )}
                                        {isSearch && input.trim() ? (
                                            <HighlightMatch text={food} query={input.trim()} />
                                        ) : (
                                            <span>{food}</span>
                                        )}
                                    </span>
                                    <Check className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                                </li>
                            );
                        })}
                    </ul>

                    {!isSearch && (
                        <div className="px-3 py-2 border-t border-border">
                            <p className="font-mono text-[11px] text-muted-foreground">
                                Type to search · <kbd className="px-1 py-0.5 rounded bg-muted">Enter</kbd> to add custom
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
