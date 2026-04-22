import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { getCategoryData } from '../constants/categories';
import { Send, Clock, CheckCircle, Filter, KeyRound } from 'lucide-react';

const StatusBadge = ({ status }) => {
    switch (status) {
        case 'DISPATCHED': return <span className="badge-dispatched"><Send className="w-3 h-3" />Dispatched</span>;
        case 'IN_PROGRESS': return <span className="badge-progress"><Clock className="w-3 h-3" />In Progress</span>;
        case 'COMPLETED':  return <span className="badge-completed"><CheckCircle className="w-3 h-3" />Completed</span>;
        default: return <span className="badge-dispatched">{status}</span>;
    }
};

const priorityBadge = (p) => {
    const map = {
        low:       'bg-gray-100 text-gray-600',
        medium:    'bg-yellow-50 text-yellow-700',
        high:      'bg-orange-50 text-orange-700',
        emergency: 'bg-red-50 text-red-700',
    };
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${map[p] || map.medium}`}>{p === 'emergency' ? '🚨 ' : ''}{p}</span>;
};

const WardenDashboard = () => {
    const { token } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [filterCat, setFilterCat] = useState('All');

    const fetchData = async () => {
        try {
            const [resC, resS] = await Promise.all([
                axios.get('http://localhost:5000/api/complaints', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/complaints/staff', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setComplaints(resC.data);
            setStaffList(resS.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchData();
        const socket = io('http://localhost:5000');
        socket.on('new_complaint', fetchData);
        socket.on('complaint_updated', fetchData);
        return () => socket.close();
    }, [token]);

    const assignStaff = async (id, staffId) => {
        if (!staffId) return;
        try {
            await axios.put(`http://localhost:5000/api/complaints/${id}/assign`,
                { staff_id: staffId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (err) { console.error(err); }
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await axios.put(
                `http://localhost:5000/api/complaints/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.status === 200) fetchData();
        } catch (err) { console.error('Failed to update status', err); }
    };

    const uniqueCategories = ['All', ...new Set(complaints.map(c => c.category))];
    const filtered = filterCat === 'All' ? complaints : complaints.filter(c => c.category === filterCat);

    // Quick stats
    const stats = {
        total: complaints.length,
        dispatched: complaints.filter(c => c.status === 'DISPATCHED').length,
        progress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
        completed: complaints.filter(c => c.status === 'COMPLETED').length,
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pt-10 sm:pt-0 px-2">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow">
                    <KeyRound className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Warden Command Center</h1>
                    <p className="text-xs text-gray-500">Monitor and manage all hostel complaints</p>
                </div>
            </div>

            {/* Quick stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' },
                    { label: 'Dispatched', value: stats.dispatched, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
                    { label: 'In Progress', value: stats.progress, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                    { label: 'Completed', value: stats.completed, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                ].map(s => (
                    <div key={s.label} className={`card p-4 flex flex-col gap-1 border ${s.border}`}>
                        <p className="text-xs font-medium text-gray-500">{s.label}</p>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Complaints grid */}
            <div className="card p-6">
                {/* Filter row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3 border-b border-gray-100 pb-4">
                    <h2 className="text-base font-semibold text-gray-700">All Live Complaints</h2>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterCat}
                            onChange={(e) => setFilterCat(e.target.value)}
                            className="field py-1.5 px-3 text-sm w-auto"
                        >
                            {uniqueCategories.map(cat => <option key={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-gray-400">
                        <CheckCircle className="w-10 h-10 mb-3 text-green-300" />
                        <p className="font-medium">No complaints matching the selected filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(c => {
                            const catData = getCategoryData(c.category);
                            const CatIcon = catData.icon;
                            return (
                                <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-blue-100 transition-all duration-200 flex flex-col gap-3">
                                    {/* Card header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                                                <CatIcon className={`w-4 h-4 ${catData.color}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-sm text-gray-800">{c.category}</h3>
                                                <p className="text-xs text-gray-400">#{c.id}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={c.status} />
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{c.description}</p>

                                    {/* Meta */}
                                    <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1.5 border border-gray-100">
                                        <div className="flex justify-between">
                                            <span>Student</span>
                                            <span className="font-semibold text-gray-700">{c.student_name || 'N/A'}</span>
                                        </div>
                                        {c.room_number && (
                                            <div className="flex justify-between">
                                                <span>Room</span>
                                                <span className="font-semibold text-gray-700">{c.room_number}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span>Priority</span>
                                            {priorityBadge(c.priority)}
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Date</span>
                                            <span>{new Date(c.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Attached image */}
                                    {c.image_url && (
                                        <div className="rounded-xl overflow-hidden border border-gray-100">
                                            <img
                                                src={`http://localhost:5000${c.image_url}`}
                                                alt="Attachment"
                                                className="w-full max-h-36 object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="pt-2 border-t border-gray-100 space-y-2.5">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Assign Staff</label>
                                            <select
                                                value={c.assigned_to || ''}
                                                onChange={(e) => assignStaff(c.id, e.target.value)}
                                                className="field text-sm py-2"
                                            >
                                                <option value="" disabled>Select staff member…</option>
                                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Update Status</label>
                                            <select
                                                value={c.status}
                                                onChange={(e) => updateStatus(c.id, e.target.value)}
                                                className="field text-sm py-2"
                                            >
                                                <option value="DISPATCHED">Dispatched</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="COMPLETED">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WardenDashboard;
