import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    Users, UserPlus, Upload, Trash2, CheckCircle, AlertCircle,
    X, FileText, Download, Search, Mail, Home
} from 'lucide-react';

const API = 'http://localhost:5000/api/students';

const StudentManagement = () => {
    const { token } = useContext(AuthContext);
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // Add student form
    const [form, setForm] = useState({ name: '', email: '', room_number: '' });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // CSV upload
    const [csvFile, setCsvFile] = useState(null);
    const [csvResult, setCsvResult] = useState(null);
    const [uploading, setUploading] = useState(false);
    const csvRef = useRef(null);

    // Delete confirm
    const [deleteId, setDeleteId] = useState(null);

    const headers = { Authorization: `Bearer ${token}` };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API, { headers });
            setStudents(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchStudents(); }, []);

    // Add single student
    const handleAdd = async (e) => {
        e.preventDefault();
        setFormError(''); setFormSuccess(''); setSubmitting(true);
        try {
            const res = await axios.post(API, form, { headers });
            setFormSuccess(`Student added! Default password: ${res.data.defaultPassword}`);
            setForm({ name: '', email: '', room_number: '' });
            fetchStudents();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Failed to add student');
        } finally { setSubmitting(false); }
    };

    // CSV upload
    const handleCSV = async () => {
        if (!csvFile) return;
        setUploading(true); setCsvResult(null);
        try {
            const data = new FormData();
            data.append('csv', csvFile);
            const res = await axios.post(`${API}/upload`, data, {
                headers: { ...headers, 'Content-Type': 'multipart/form-data' }
            });
            setCsvResult(res.data);
            fetchStudents();
        } catch (err) {
            setCsvResult({ error: err.response?.data?.error || 'Upload failed' });
        } finally { setUploading(false); setCsvFile(null); if (csvRef.current) csvRef.current.value = ''; }
    };

    // Delete student
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API}/${id}`, { headers });
            setStudents(prev => prev.filter(s => s.id !== id));
            setDeleteId(null);
        } catch (err) { console.error(err); }
    };

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.room_number || '').toLowerCase().includes(search.toLowerCase())
    );

    // Download sample CSV template
    const downloadTemplate = () => {
        const csv = 'name,email,room_number\nJohn Doe,john@college.edu,A-101\nJane Smith,jane@college.edu,B-202';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'students_template.csv'; a.click();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pt-10 sm:pt-0 px-2 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
                        <p className="text-xs text-gray-500">Add, import, and manage student accounts</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span><strong className="text-blue-700">{students.length}</strong> students registered</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Left column: Add + CSV ── */}
                <div className="space-y-5">

                    {/* Add Student Form */}
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                            <UserPlus className="w-4 h-4 text-violet-600" />
                            <h2 className="text-base font-semibold text-gray-700">Add Student</h2>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name <span className="text-red-400">*</span></label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="field"
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="field pl-9"
                                        placeholder="student@college.edu"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Room Number</label>
                                <div className="relative">
                                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        value={form.room_number}
                                        onChange={e => setForm({ ...form, room_number: e.target.value })}
                                        className="field pl-9"
                                        placeholder="e.g. A-204"
                                    />
                                </div>
                            </div>

                            {formError && (
                                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                    <CheckCircle className="w-4 h-4 flex-shrink-0" /> {formSuccess}
                                </div>
                            )}

                            <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5 disabled:opacity-60">
                                {submitting ? 'Adding…' : <><UserPlus className="w-4 h-4" /> Add Student</>}
                            </button>
                        </form>
                    </div>

                    {/* CSV Upload */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Upload className="w-4 h-4 text-blue-600" />
                                <h2 className="text-base font-semibold text-gray-700">Bulk CSV Upload</h2>
                            </div>
                            <button onClick={downloadTemplate} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
                                <Download className="w-3.5 h-3.5" /> Template
                            </button>
                        </div>

                        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100">
                            CSV must have columns: <code className="font-mono text-blue-600">name, email, room_number</code>
                        </div>

                        {csvFile ? (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span className="text-xs text-blue-700 font-medium truncate flex-1">{csvFile.name}</span>
                                <button onClick={() => { setCsvFile(null); if (csvRef.current) csvRef.current.value = ''; }}>
                                    <X className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all mb-3">
                                <Upload className="w-6 h-6 text-gray-400" />
                                <span className="text-xs text-gray-500">Click to select CSV file</span>
                                <input
                                    type="file"
                                    accept=".csv,text/csv"
                                    className="hidden"
                                    ref={csvRef}
                                    onChange={e => { setCsvFile(e.target.files[0]); setCsvResult(null); }}
                                />
                            </label>
                        )}

                        <button
                            onClick={handleCSV}
                            disabled={!csvFile || uploading}
                            className="btn-gradient w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Uploading…' : <><Upload className="w-4 h-4" /><span>Upload &amp; Import</span></>}
                        </button>

                        {/* CSV result */}
                        {csvResult && (
                            <div className={`mt-3 p-3 rounded-lg text-xs border ${csvResult.error ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-700'}`}>
                                {csvResult.error ? (
                                    <span className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{csvResult.error}</span>
                                ) : (
                                    <>
                                        <p className="flex items-center gap-1.5 font-semibold mb-1">
                                            <CheckCircle className="w-4 h-4" /> {csvResult.inserted} student{csvResult.inserted !== 1 ? 's' : ''} imported
                                        </p>
                                        <p>Default password: <code className="font-mono bg-green-100 px-1 rounded">{csvResult.defaultPassword}</code></p>
                                        {csvResult.errors?.length > 0 && (
                                            <p className="mt-1 text-orange-600">{csvResult.errors.length} row(s) skipped (missing data)</p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right column: Student table ── */}
                <div className="lg:col-span-2">
                    <div className="card p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-gray-100 pb-4">
                            <h2 className="text-base font-semibold text-gray-700">Registered Students</h2>
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="field pl-9 w-56 py-2 text-sm"
                                    placeholder="Search name, email, room…"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16 text-gray-400">
                                <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mr-2" />
                                Loading students…
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center py-16 text-gray-400">
                                <Users className="w-10 h-10 mb-3 text-gray-200" />
                                <p className="font-medium">{search ? 'No students match your search.' : 'No students registered yet.'}</p>
                                <p className="text-xs mt-1">Use the form or CSV upload to add students.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                                            <th className="text-left pb-3 pr-4">#</th>
                                            <th className="text-left pb-3 pr-4">Name</th>
                                            <th className="text-left pb-3 pr-4">Email</th>
                                            <th className="text-left pb-3 pr-4">Room</th>
                                            <th className="text-left pb-3 pr-4">Joined</th>
                                            <th className="pb-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filtered.map((s, i) => (
                                            <tr key={s.id} className="hover:bg-gray-50/70 transition-colors group">
                                                <td className="py-3 pr-4 text-gray-400 text-xs">{i + 1}</td>
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0">
                                                            {s.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-gray-800">{s.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4 text-gray-500">{s.email}</td>
                                                <td className="py-3 pr-4">
                                                    {s.room_number
                                                        ? <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2 py-0.5 rounded-full">{s.room_number}</span>
                                                        : <span className="text-gray-300 text-xs">—</span>
                                                    }
                                                </td>
                                                <td className="py-3 pr-4 text-gray-400 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                                                <td className="py-3">
                                                    {deleteId === s.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => handleDelete(s.id)} className="text-xs text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-lg transition-colors font-medium">Confirm</button>
                                                            <button onClick={() => setDeleteId(null)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg transition-colors">Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteId(s.id)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                            title="Remove student"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentManagement;
