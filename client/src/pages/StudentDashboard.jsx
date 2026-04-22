import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { CATEGORIES, getCategoryData } from '../constants/categories';
import { ChevronDown, Send, Clock, CheckCircle, PlusCircle, ImagePlus, X, Home } from 'lucide-react';

const StatusBadge = ({ status }) => {
    switch (status) {
        case 'DISPATCHED': return <span className="badge-dispatched"><Send className="w-3 h-3" />Dispatched</span>;
        case 'IN_PROGRESS': return <span className="badge-progress"><Clock className="w-3 h-3" />In Progress</span>;
        case 'COMPLETED':  return <span className="badge-completed"><CheckCircle className="w-3 h-3" />Completed</span>;
        default: return <span className="badge-dispatched">{status}</span>;
    }
};

const priorityConfig = {
    low:       { cls: 'bg-gray-100 text-gray-600' },
    medium:    { cls: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
    high:      { cls: 'bg-orange-50 text-orange-700 border border-orange-200' },
    emergency: { cls: 'bg-red-50 text-red-700 border border-red-200' },
};

const StudentDashboard = () => {
    const { token } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [formData, setFormData] = useState({
        category: 'Electrical',
        description: '',
        priority: 'medium',
        room_number: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const socket = io('http://localhost:5000');
        socket.on('complaint_updated', (upd) =>
            setComplaints(prev => prev.map(c => c.id === upd.id ? upd : c))
        );
        return () => socket.close();
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/complaints', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchComplaints(); }, [token]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Use FormData so multer can parse the file
            const data = new FormData();
            data.append('category', formData.category);
            data.append('description', formData.description);
            data.append('priority', formData.priority);
            data.append('room_number', formData.room_number);
            if (imageFile) data.append('image', imageFile);

            const res = await axios.post('http://localhost:5000/api/complaints', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            setComplaints([res.data, ...complaints]);
            setFormData({ ...formData, description: '', room_number: '' });
            clearImage();
        } catch (err) { console.error(err); }
        finally { setSubmitting(false); }
    };

    const selectedCat = getCategoryData(formData.category);
    const SelectedIcon = selectedCat.icon;

    return (
        <div className="page-wrapper max-w-6xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow">
                    <PlusCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Raise a Complaint</h1>
                    <p className="text-xs text-gray-500">Submit and track your hostel maintenance requests</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Form ── */}
                <div className="lg:col-span-1">
                    <div className="card p-6">
                        <h2 className="text-base font-semibold text-gray-700 mb-5 border-b border-gray-100 pb-3">New Complaint</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Room Number */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Room Number <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.room_number}
                                        onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                        className="field pl-9"
                                        placeholder="e.g. A-204"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div className="relative" ref={dropdownRef}>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category <span className="text-red-400">*</span></label>
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="field flex justify-between items-center text-left w-full"
                                >
                                    <span className="flex items-center gap-2">
                                        <SelectedIcon className={`w-4 h-4 ${selectedCat.color}`} />
                                        <span className="text-gray-800 text-sm">{formData.category}</span>
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto z-50 animate-fade-in">
                                        {CATEGORIES.map((cat, i) => {
                                            const CatIcon = cat.icon;
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => { setFormData({ ...formData, category: cat.name }); setIsDropdownOpen(false); }}
                                                    className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left hover:bg-blue-50 transition-colors ${formData.category === cat.name ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                                >
                                                    <CatIcon className={`w-4 h-4 ${cat.color}`} />
                                                    {cat.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="field"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="emergency">🚨 Emergency</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description <span className="text-red-400">*</span></label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="field min-h-[100px] resize-none"
                                    placeholder="Describe the issue in detail…"
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Attach Photo <span className="text-gray-400 font-normal">(optional)</span></label>
                                {imagePreview ? (
                                    <div className="relative rounded-xl overflow-hidden border border-gray-200">
                                        <img src={imagePreview} alt="Preview" className="w-full h-36 object-cover" />
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 transition-colors"
                                        >
                                            <X className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                                        <ImagePlus className="w-6 h-6 text-gray-400" />
                                        <span className="text-xs text-gray-500">Click to upload image (max 5MB)</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>

                            <button type="submit" disabled={submitting} className="btn-gradient w-full py-2.5 disabled:opacity-60">
                                {submitting ? 'Submitting…' : 'Submit Complaint'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ── Complaints list ── */}
                <div className="lg:col-span-2">
                    <div className="card p-6 min-h-[500px]">
                        <h2 className="text-base font-semibold text-gray-700 mb-5 border-b border-gray-100 pb-3">Your Complaints</h2>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                            {complaints.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                    <CheckCircle className="w-10 h-10 mb-3 text-green-300" />
                                    <p className="font-medium">No complaints yet — you're all clear!</p>
                                </div>
                            ) : complaints.map(c => {
                                const catData = getCategoryData(c.category);
                                const CatIcon = catData.icon;
                                const pCfg = priorityConfig[c.priority] || priorityConfig.medium;
                                return (
                                    <div key={c.id} className="p-4 border border-gray-100 rounded-xl bg-white hover:shadow-md transition-all duration-200 hover:border-blue-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                                                    <CatIcon className={`w-4 h-4 ${catData.color}`} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-sm text-gray-800">{c.category}</h3>
                                                    <p className="text-xs text-gray-400">
                                                        #{c.id} · {new Date(c.created_at).toLocaleDateString()}
                                                        {c.room_number && <span> · Room {c.room_number}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge status={c.status} />
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2 mb-3 leading-relaxed">{c.description}</p>

                                        {/* Attached image */}
                                        {c.image_url && (
                                            <div className="mb-3 rounded-xl overflow-hidden border border-gray-100">
                                                <img
                                                    src={`http://localhost:5000${c.image_url}`}
                                                    alt="Complaint attachment"
                                                    className="w-full max-h-48 object-cover"
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${pCfg.cls}`}>
                                                {c.priority === 'emergency' ? '🚨 ' : ''}{c.priority}
                                            </span>
                                            {c.assigned_staff_name && (
                                                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Assigned: {c.assigned_staff_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
