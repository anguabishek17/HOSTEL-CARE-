import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { getCategoryData } from '../constants/categories';
import { Send, Clock, CheckCircle, Users } from 'lucide-react';

const StatusBadge = ({ status }) => {
    switch (status) {
        case 'DISPATCHED': return <span className="badge-dispatched"><Send className="w-3 h-3" />Dispatched</span>;
        case 'IN_PROGRESS': return <span className="badge-progress"><Clock className="w-3 h-3" />In Progress</span>;
        case 'COMPLETED':  return <span className="badge-completed"><CheckCircle className="w-3 h-3" />Completed</span>;
        default: return <span className="badge-dispatched">{status}</span>;
    }
};

const StaffDashboard = () => {
    const { token } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/complaints', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchData();
        const socket = io('http://localhost:5000');
        socket.on('staff_assigned', fetchData);
        socket.on('complaint_updated', fetchData);
        return () => socket.close();
    }, [token]);

    const updateStatus = async (id, status) => {
        try {
            await axios.put(
                `http://localhost:5000/api/complaints/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="page-wrapper max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow">
                    <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Staff Action Queue</h1>
                    <p className="text-xs text-gray-500">Tasks assigned to you for resolution</p>
                </div>
            </div>

            <div className="card p-6 min-h-[500px]">
                <h2 className="text-base font-semibold text-gray-700 mb-5 border-b border-gray-100 pb-3">My Assignments</h2>
                <div className="space-y-4">
                    {complaints.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-gray-400">
                            <CheckCircle className="w-10 h-10 mb-3 text-green-300" />
                            <p className="font-medium">No tasks assigned right now — great job!</p>
                        </div>
                    ) : complaints.map(c => {
                        const catData = getCategoryData(c.category);
                        const CatIcon = catData.icon;
                        return (
                            <div
                                key={c.id}
                                className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-blue-100 transition-all duration-200 flex flex-col md:flex-row gap-4"
                            >
                                {/* Category icon + info */}
                                <div className="flex gap-4 flex-1">
                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 self-start">
                                        <CatIcon className={`w-6 h-6 ${catData.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                                            <h3 className="font-semibold text-gray-800">{c.category}</h3>
                                            <StatusBadge status={c.status} />
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{c.description}</p>
                                        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                            <span>Priority: <strong className={c.priority === 'emergency' ? 'text-red-600' : 'text-gray-600'}>{c.priority}</strong></span>
                                            <span>Student: <strong className="text-gray-600">{c.student_name}</strong></span>
                                            <span>{new Date(c.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action button */}
                                <div className="flex-shrink-0 flex items-center md:border-l md:border-gray-100 md:pl-4 pt-3 md:pt-0 border-t border-gray-100 md:border-t-0">
                                    {c.status === 'COMPLETED' ? (
                                        <div className="flex items-center gap-2 text-green-600 font-semibold text-sm px-4 py-2.5 bg-green-50 rounded-xl border border-green-200 w-full md:w-40 justify-center">
                                            <CheckCircle className="w-4 h-4" /> Resolved
                                        </div>
                                    ) : c.status === 'IN_PROGRESS' ? (
                                        <button
                                            onClick={() => updateStatus(c.id, 'COMPLETED')}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02] shadow-sm flex items-center gap-2 w-full md:w-40 justify-center"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Mark Done
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => updateStatus(c.id, 'IN_PROGRESS')}
                                            className="btn-primary w-full md:w-40 py-2.5"
                                        >
                                            <Clock className="w-4 h-4" /> Start Work
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
