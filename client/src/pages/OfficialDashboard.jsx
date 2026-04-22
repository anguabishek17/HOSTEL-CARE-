import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { getCategoryData } from '../constants/categories';
import { TrendingUp, TrendingDown, Minus, Clock, Send, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import api from '../config/api';


const COLORS = ['#6b7280', '#3b82f6', '#22c55e'];

const TrendIndicator = ({ trend }) => {
    if (!trend) return null;
    if (trend.dir === 'up')   return <span className="text-green-600 flex items-center gap-1 text-xs font-semibold"><TrendingUp className="w-3.5 h-3.5" />{trend.percent}%</span>;
    if (trend.dir === 'down') return <span className="text-red-500 flex items-center gap-1 text-xs font-semibold"><TrendingDown className="w-3.5 h-3.5" />{trend.percent}%</span>;
    return <span className="text-gray-400 flex items-center gap-1 text-xs font-semibold"><Minus className="w-3.5 h-3.5" />0%</span>;
};

const OfficialDashboard = () => {
    const { token } = useContext(AuthContext);
    const [overview, setOverview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [recent, setRecent] = useState([]);
    const [daysFilter, setDaysFilter] = useState(0);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [resO, resC, resR] = await Promise.all([
                    api.get(`/api/analytics/overview?days=${daysFilter}`),
                    api.get(`/api/analytics/categories?days=${daysFilter}`),
                    api.get(`/api/analytics/recent?limit=15`),
                ]);
                setOverview(resO.data);
                setCategories(resC.data);
                setRecent(resR.data);
            } catch (err) { console.error(err); }
        };
        fetchAll();
    }, [token, daysFilter]);

    const statusData = overview ? [
        { name: 'Dispatched', value: overview.current.dispatched },
        { name: 'In Progress', value: overview.current.in_progress },
        { name: 'Completed',   value: overview.current.completed },
    ] : [];

    return (
        <div className="page-wrapper">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Executive Analytics</h1>
                        <p className="text-xs text-gray-500">Read-only performance monitoring dashboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-500">Time Period:</label>
                    <select
                        value={daysFilter}
                        onChange={(e) => setDaysFilter(parseInt(e.target.value))}
                        className="field py-1.5 px-3 text-sm w-auto"
                    >
                        <option value={0}>All Time</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={7}>Last 7 Days</option>
                    </select>
                </div>
            </div>

            {overview && (
                <>
                    {/* Stat cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {[
                            { label: 'Total Complaints', value: overview.current.total,       trend: overview.trends?.total,       border: 'border-t-blue-500',   num: 'text-blue-700' },
                            { label: 'Dispatched',        value: overview.current.dispatched,  trend: overview.trends?.dispatched,  border: 'border-t-gray-400',   num: 'text-gray-600' },
                            { label: 'In Progress',       value: overview.current.in_progress, trend: overview.trends?.in_progress, border: 'border-t-blue-400',   num: 'text-blue-600' },
                            { label: 'Completed',         value: overview.current.completed,   trend: overview.trends?.completed,   border: 'border-t-green-500',  num: 'text-green-600' },
                        ].map(s => (
                            <div key={s.label} className={`card p-4 sm:p-5 border-t-4 ${s.border}`}>
                                <p className="text-xs font-medium text-gray-500 mb-1.5 leading-tight">{s.label}</p>
                                <div className="flex items-end justify-between gap-1">
                                    <span className={`text-2xl sm:text-4xl font-bold ${s.num}`}>{s.value}</span>
                                    {daysFilter > 0 && <TrendIndicator trend={s.trend} />}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts + live feed */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left: Charts */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Bar chart replacement (Reliable CSS bars) */}
                            <div className="card p-4 sm:p-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4 border-b border-gray-100 pb-3">Issue Volume by Category</h3>
                                <div className="space-y-4 pt-2">
                                    {categories.length > 0 ? categories.map((cat, i) => {
                                        const maxVal = Math.max(...categories.map(c => c.value)) || 1;
                                        const percent = (cat.value / maxVal) * 100;
                                        const colors = [
                                            'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 
                                            'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'
                                        ];
                                        const color = colors[i % colors.length];
                                        return (
                                            <div key={i} className="space-y-1.5 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                                                <div className="flex justify-between text-xs font-semibold text-gray-600">
                                                    <span>{cat.name}</span>
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px]">{cat.value} Tickets</span>
                                                </div>
                                                <div className="h-3 w-full bg-gray-50 rounded-full border border-gray-100/50">
                                                    <div 
                                                        className={`h-full ${color} rounded-full shadow-sm transition-all duration-1000 ease-out`} 
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="text-center py-12">
                                            <p className="text-xs text-gray-400 italic">No category data recorded yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Distribution replacement (Visual grid) */}
                            <div className="card p-4 sm:p-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4 border-b border-gray-100 pb-3">Status Breakdown</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                    {statusData.map((s, i) => {
                                        const colors = {
                                            'Dispatched': 'bg-gray-100 text-gray-600 border-gray-200',
                                            'In Progress': 'bg-blue-50 text-blue-600 border-blue-200',
                                            'Completed': 'bg-green-50 text-green-600 border-green-200'
                                        };
                                        const colorClass = colors[s.name] || 'bg-gray-50';
                                        const total = overview?.current?.total || 1;
                                        const percent = Math.round((s.value / total) * 100);

                                        return (
                                            <div key={i} className={`p-4 rounded-2xl border ${colorClass} flex flex-col items-center justify-center text-center`}>
                                                <span className="text-2xl font-bold mb-0.5">{s.value}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80">{s.name}</span>
                                                <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full bg-current opacity-60 rounded-full`}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] mt-1.5 font-medium">{percent}% of total</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right: Live ticket stream */}
                        <div className="lg:col-span-1">
                            <div className="card p-6 h-full flex flex-col max-h-[680px]">
                                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                                    <h3 className="text-sm font-semibold text-gray-700">Live Ticket Stream</h3>
                                    <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full font-medium">Top 15</span>
                                </div>
                                <div className="overflow-y-auto flex-1 space-y-2.5 pr-1">
                                    {recent.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No recent activity.</p>}
                                    {recent.map(r => {
                                        const isEmergency = r.priority === 'emergency';
                                        const isUnresolved = r.status !== 'COMPLETED';
                                        const highlight = isEmergency && isUnresolved;

                                        const IconMap = { DISPATCHED: Send, IN_PROGRESS: Clock, COMPLETED: CheckCircle };
                                        const ColorMap = { DISPATCHED: 'text-gray-500', IN_PROGRESS: 'text-blue-500', COMPLETED: 'text-green-500' };
                                        const StatusIcon = IconMap[r.status] || Send;

                                        return (
                                            <div
                                                key={r.id}
                                                className={`p-3.5 rounded-xl border text-sm transition-all ${highlight
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'bg-gray-50 border-gray-100 hover:border-blue-100 hover:bg-white'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                                                            {highlight && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                                                            {r.category}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5">#{r.id} · {r.student_name}</p>
                                                    </div>
                                                    <StatusIcon className={`w-4 h-4 ${ColorMap[r.status]}`} />
                                                </div>
                                                <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-200">
                                                    <span className={`text-xs font-semibold capitalize ${isEmergency ? 'text-red-500' : 'text-gray-400'}`}>
                                                        {r.priority}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">UI Engine: Stable CSS v2.1</span>
            </div>
        </div>
    );
};

export default OfficialDashboard;
