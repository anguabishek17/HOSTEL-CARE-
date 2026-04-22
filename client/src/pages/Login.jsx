import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const logoSrc = new URL('../assets/college-logo.jpg', import.meta.url).href;
    const bgSrc   = new URL('../assets/clg-bg.jpg',       import.meta.url).href;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        /* ── Full-screen background image ── */
        <div
            className="fixed inset-0 w-full h-full"
            style={{
                backgroundImage: `url(${bgSrc})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Dark overlay so card text stays readable */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

            {/* ── Centered login card ── */}
            <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-[420px] bg-white/15 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden animate-fade-in">

                    {/* College logo */}
                    <div className="flex flex-col items-center pt-8 pb-2">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white shadow-xl border-4 border-white/80 transition-transform duration-300 hover:scale-105">
                            <img
                                src={logoSrc}
                                alt="College Logo"
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML =
                                        '<span class="flex items-center justify-center w-full h-full text-2xl font-extrabold text-blue-600">VSB</span>';
                                }}
                            />
                        </div>
                        <h1 className="mt-4 text-2xl font-bold text-white drop-shadow">Hostel Complaint Portal</h1>
                        <p className="text-sm text-white/70 mt-1">V.S.B. Engineering College</p>
                    </div>

                    {/* Divider */}
                    <div className="mx-8 mt-4 border-t border-white/20" />

                    {/* Form body */}
                    <div className="px-8 pt-6 pb-8">

                        {/* Error */}
                        {error && (
                            <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-400/50 text-red-100 rounded-xl text-sm text-center backdrop-blur-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-white/80 mb-1.5 tracking-wide">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-white/50
                                                   focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent
                                                   backdrop-blur-sm transition-all duration-200"
                                        placeholder="you@college.edu"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-semibold text-white/80 mb-1.5 tracking-wide">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-white/50
                                                   focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent
                                                   backdrop-blur-sm transition-all duration-200"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-2 py-3 rounded-xl font-semibold text-sm
                                           bg-gradient-to-r from-blue-500 to-purple-600
                                           hover:from-blue-600 hover:to-purple-700
                                           text-white shadow-lg shadow-blue-500/30
                                           transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                                           disabled:opacity-60 disabled:cursor-not-allowed
                                           flex items-center justify-center gap-2"
                            >
                                {loading ? 'Signing in…' : <>Access Portal <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-xs text-white/60">
                            Don&apos;t have an account?{' '}
                            <Link to="/register" className="text-blue-300 font-semibold hover:text-white transition-colors">
                                Register as Student
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
