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

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

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
                className={`flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
                    active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
            >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
            </a>
        );
    };

    const SidebarContent = () => (
        <>
            {/* Top */}
            <div className="p-5 flex-1 overflow-y-auto">
                {/* Brand */}
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-base font-bold text-gray-800 leading-tight">HostelCare</h2>
                        <span className="text-xs text-gray-400 capitalize truncate block">{cfg.label}</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="space-y-1">
                    {navItem('/', Home, 'Dashboard')}
                    {role !== 'warden' && navItem('/complaints', ClipboardList, 'Complaints')}
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
                    <div className={`w-9 h-9 rounded-lg ${cfg.bg} border border-gray-200 flex items-center justify-center shadow-sm flex-shrink-0`}>
                        <RoleIcon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate capitalize">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-3 sm:py-2.5 rounded-xl text-red-500 hover:bg-red-50 font-medium text-sm transition-all min-h-[44px]"
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    Sign Out
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* ── Mobile top bar ── */}
            <div className="sm:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 gap-3">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0"
                    aria-label="Open menu"
                >
                    <Menu className="w-4 h-4 text-gray-600" />
                </button>
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-bold text-gray-800 truncate">HostelCare</span>
                </div>
                <div className="ml-auto">
                    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${cfg.bg}`}>
                        <RoleIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                        <span className={`text-xs font-semibold ${cfg.color} capitalize`}>{role}</span>
                    </div>
                </div>
            </div>

            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    className="sm:hidden fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar panel */}
            <div className={`sm:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white border-r border-gray-200 shadow-2xl flex flex-col z-50 transition-transform duration-300 ease-in-out ${
                mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="text-sm font-bold text-gray-700">Navigation</span>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
                <SidebarContent />
            </div>

            {/* Desktop sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-sm hidden sm:flex flex-col z-40">
                <SidebarContent />
            </div>
        </>
    );
};

export default Sidebar;
