// Common North Indian food items organized by category
export const FOOD_CATEGORIES = {
    'Bread': [
        'Roti', 'Chapati', 'Naan', 'Paratha', 'Aloo Paratha', 'Gobi Paratha', 'Paneer Paratha', 'Methi Paratha',
        'Kulcha', 'Bhatura', 'Poori', 'Tandoori Roti', 'Butter Naan', 'Garlic Naan', 'Laccha Paratha'
    ],
    'Curry': [
        'Paneer Butter Masala', 'Paneer Tikka', 'Shahi Paneer', 'Kadai Paneer', 'Paneer Do Pyaza',
        'Butter Chicken', 'Chicken Curry', 'Chicken Tikka', 'Chicken Masala', 'Chicken Korma',
        'Mutton Curry', 'Mutton Korma', 'Fish Curry', 'Egg Curry', 'Prawn Curry',
        'Malai Kofta', 'Navratan Korma'
    ],
    'Breakfast': [
        'Poha', 'Upma', 'Dosa', 'Masala Dosa', 'Idli', 'Vada', 'Dhokla', 'Paratha', 'Aloo Paratha',
        'Pav Bhaji', 'Vada Pav', 'Bread Pakora', 'Cutlet', 'Maggi', 'Noodles'
    ],
    'Rice': [
        'Chawal', 'Biryani', 'Veg Biryani', 'Chicken Biryani', 'Mutton Biryani', 'Pulao', 'Jeera Rice',
        'Fried Rice', 'Khichdi', 'Dal Chawal', 'Rajma Chawal', 'Chole Chawal', 'Matar Pulao'
    ],
    'Sabzi': [
        'Aloo Sabzi', 'Aloo Gobi', 'Aloo Matar', 'Aloo Baingan', 'Gobi Sabzi', 'Gobi Aloo',
        'Baingan Sabzi', 'Baingan Bharta', 'Bhindi Sabzi', 'Bhindi Fry', 'Mix Veg', 'Matar Paneer',
        'Aloo Jeera', 'Tinda Sabzi', 'Lauki Sabzi', 'Tori Sabzi'
    ],
    'Dal': [
        'Dal Fry', 'Dal Tadka', 'Dal Makhani', 'Dal Chana', 'Dal Arhar', 'Dal Moong', 'Dal Masoor',
        'Rajma', 'Chole', 'Chana Masala', 'Kadhi', 'Sambar', 'Rasam', 'Dal Palak'
    ],
    'Snacks': [
        'Samosa', 'Aloo Samosa', 'Pakora', 'Onion Pakora', 'Paneer Pakora', 'Mirchi Pakora',
        'Kachori', 'Bhel Puri', 'Pani Puri', 'Dahi Puri', 'Aloo Tikki', 'Chaat', 'Papdi Chaat', 'Dahi Bhalla',
        'Spring Roll'
    ],
    'Sweets': [
        'Gulab Jamun', 'Rasgulla', 'Jalebi', 'Kheer', 'Rice Kheer', 'Halwa', 'Gajar Halwa',
        'Sooji Halwa', 'Barfi', 'Kaju Barfi', 'Ladoo', 'Besan Ladoo', 'Rava Ladoo',
        'Rasmalai', 'Kulfi', 'Ice Cream'
    ],
    'Beverages': [
        'Chai', 'Masala Chai', 'Green Tea', 'Coffee', 'Lassi', 'Sweet Lassi', 'Salted Lassi',
        'Buttermilk', 'Chaas', 'Jal Jeera', 'Nimbu Pani', 'Shikanji', 'Aam Panna'
    ],
    'Others': [
        'Raita', 'Booni Raita', 'Pickle', 'Achar', 'Papad', 'Salad', 'Soup', 'Tomato Soup',
        'Dahi', 'Curd', 'Yogurt'
    ]
};

// Flattened list for backward compatibility
export const NORTH_INDIAN_FOODS = Object.values(FOOD_CATEGORIES).flat();

export function searchFoodItems(query: string): string[] {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return NORTH_INDIAN_FOODS.filter(food => 
        food.toLowerCase().includes(lowerQuery)
    ).slice(0, 8); // Limit to 8 suggestions
}

