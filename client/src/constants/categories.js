import { 
    Zap, 
    Wrench, 
    Wifi, 
    Sparkles, 
    Bed, 
    Droplets, 
    ShieldAlert, 
    Utensils, 
    Hammer, 
    MoreHorizontal 
} from 'lucide-react';

export const CATEGORIES = [
    { name: "Electrical", icon: Zap, color: "text-amber-400", bg: "bg-amber-400" },
    { name: "Plumbing", icon: Wrench, color: "text-blue-400", bg: "bg-blue-400" },
    { name: "WiFi / Internet", icon: Wifi, color: "text-indigo-400", bg: "bg-indigo-400" },
    { name: "Cleaning", icon: Sparkles, color: "text-teal-400", bg: "bg-teal-400" },
    { name: "Furniture", icon: Bed, color: "text-orange-400", bg: "bg-orange-400" },
    { name: "Water Supply", icon: Droplets, color: "text-cyan-400", bg: "bg-cyan-400" },
    { name: "Security", icon: ShieldAlert, color: "text-red-400", bg: "bg-red-400" },
    { name: "Mess / Food", icon: Utensils, color: "text-green-400", bg: "bg-green-400" },
    { name: "Room Maintenance", icon: Hammer, color: "text-purple-400", bg: "bg-purple-400" },
    { name: "Other", icon: MoreHorizontal, color: "text-gray-400", bg: "bg-gray-400" }
];

export const getCategoryData = (categoryName) => {
    return CATEGORIES.find(c => c.name === categoryName) || CATEGORIES[CATEGORIES.length - 1]; // defaults to Other
};
