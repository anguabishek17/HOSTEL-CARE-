import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, ClipboardList, Activity, User, KeyRound, Users, Building2, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const roleConfig = {
    student:  { icon: User,     color: 'text-blue-600',   bg: 'bg-blue-50',   label: 'Student Portal' },
    warden:   { icon: KeyRound, color: 'text-violet-600', bg: 'bg-violet-50', label: 'Warden Portal' },
    staff:    { icon: Users,    color: 'text-emerald-600',bg: 'bg-emerald-50',label: 'Staff Portal' },
    official: { icon: Activity, color: 'text-amber-600',  bg: 'bg-amber-50',  label: 'Official Portal' },
};

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        document.body.classList.remove('dark-mode');
        document.body.style.background = 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 50%, #eef2ff 100%)';
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    const handleLogout = () => { logout(); navigate('/login'); };

    const role = user?.role || 'student';
    const cfg = roleConfig[role] || roleConfig.student;
    const RoleIcon = cfg.icon;

    const navItem = (to, Icon, label) => {
        const active = location.pathname === to;
        return (
            <a
                key={to}
                href={to}
                onClick={e => { e.preventDefault(); navigate(to); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
            >
                <Icon className="w-4 h-4" />
                {label}
            </a>
        );
    };

    const SidebarContent = () => (
        <>
            {/* Top */}
            <div className="p-6 flex-1 overflow-y-auto">
                {/* Brand */}
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-800 leading-tight">HostelCare</h2>
                        <span className="text-xs text-gray-400 capitalize">{cfg.label}</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="space-y-1">
                    {navItem('/', Home, 'Dashboard')}
                    {/* Warden: complaints managed on dashboard; other roles get a Complaints link */}
                    {role !== 'warden' && navItem('/complaints', ClipboardList, 'Complaints')}
                    {/* Warden-only: Student Management */}
                    {role === 'warden' && (
                        <>
                            <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 px-3 pt-4 pb-1">Management</p>
                            {navItem('/students', Users, 'Student Management')}
                        </>
                    )}
                </nav>
            </div>

            {/* Bottom — user info + logout */}
            <div className="p-4 border-t border-gray-100">
                <div className={`flex items-center gap-3 p-3 rounded-xl ${cfg.bg} mb-3`}>
                    <div className={`w-9 h-9 rounded-lg ${cfg.bg} border border-gray-200 flex items-center justify-center shadow-sm`}>
                        <RoleIcon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate capitalize">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 font-medium text-sm transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="sm:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm"
                aria-label="Open menu"
            >
                <Menu className="w-4 h-4 text-gray-600" />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="sm:hidden fixed inset-0 bg-black/30 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar panel */}
            <div className={`sm:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-xl flex flex-col z-50 transition-transform duration-300 ${
                mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex justify-end p-3">
                    <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
                <SidebarContent />
            </div>

            {/* Desktop sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-sm hidden sm:flex flex-col z-50">
                <SidebarContent />
            </div>
        </>
    );
};

export default Sidebar;
