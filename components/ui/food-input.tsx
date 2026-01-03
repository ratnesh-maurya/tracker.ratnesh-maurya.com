'use client';

import { useState } from 'react';
import { Input } from './input';
import { FOOD_CATEGORIES } from '@/lib/food-items';
import { cn } from '@/lib/utils';

interface FoodInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function FoodInput({ value, onChange, placeholder = 'Type food name or select from categories below...', className }: FoodInputProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleCategoryClick = (category: string) => {
        if (selectedCategory === category) {
            setSelectedCategory(null); // Toggle off if already selected
        } else {
            setSelectedCategory(category); // Show sub-items
        }
    };

    const handleFoodClick = (food: string) => {
        onChange(food);
        setSelectedCategory(null); // Close sub-items after selection
    };

    const categories = Object.keys(FOOD_CATEGORIES);
    const subItems = selectedCategory ? FOOD_CATEGORIES[selectedCategory as keyof typeof FOOD_CATEGORIES] : [];

    return (
        <div className="w-full space-y-2">
            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={className}
            />

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                {categories.map((category) => (
                    <button
                        key={category}
                        type="button"
                        onClick={() => handleCategoryClick(category)}
                        className={cn(
                            'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap',
                            selectedCategory === category
                                ? 'bg-blue-600 text-white shadow-md dark:bg-blue-700'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700'
                        )}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Sub-items Pills (shown when category is selected) */}
            {selectedCategory && subItems.length > 0 && (
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="w-full text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Select from {selectedCategory}:
                    </div>
                    {subItems.map((food) => (
                        <button
                            key={food}
                            type="button"
                            onClick={() => handleFoodClick(food)}
                            className={cn(
                                'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap',
                                value === food
                                    ? 'bg-green-600 text-white shadow-md dark:bg-green-700'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 border border-gray-200 dark:border-gray-700'
                            )}
                        >
                            {food}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

