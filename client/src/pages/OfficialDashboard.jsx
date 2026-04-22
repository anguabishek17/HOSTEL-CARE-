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
                            {/* Bar chart */}
                            <div className="card p-4 sm:p-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4 border-b border-gray-100 pb-3">Issue Volume by Category</h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={categories} margin={{ top: 5, right: 5, left: -20, bottom: 50 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={0} angle={-40} textAnchor="end" />
                                            <YAxis stroke="#94a3b8" allowDecimals={false} tick={{ fontSize: 11 }} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(59,130,246,0.05)' }}
                                                contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px' }}
                                            />
                                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                                {categories.map((_, i) => (
                                                    <Cell key={i} fill={['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16','#f97316','#6366f1'][i % 10]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Pie chart */}
                            <div className="card p-4 sm:p-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4 border-b border-gray-100 pb-3">Status Distribution</h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                                                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#4b5563' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
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
        </div>
    );
};

export default OfficialDashboard;
