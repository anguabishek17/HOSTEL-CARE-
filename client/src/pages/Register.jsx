import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData.name, formData.email, formData.password);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="w-full max-w-md p-8 glassmorphism rounded-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-400 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>

            <h2 className="text-3xl font-bold mb-6 text-white text-center z-10 relative">Register Student</h2>
            {error && <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 px-4 py-2 rounded-lg mb-4">{error}</div>}
            
            <form onSubmit={handleSubmit} className="z-10 relative">
                <div className="mb-4">
                    <label className="block text-white mb-2 font-medium">Full Name</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full glass-input"
                        placeholder="Enter your name"
                        required 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-white mb-2 font-medium">Email</label>
                    <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full glass-input"
                        placeholder="Enter your email"
                        required 
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-white mb-2 font-medium">Password</label>
                    <input 
                        type="password" 
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full glass-input"
                        placeholder="Create a password"
                        required 
                    />
                </div>
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-green-400 to-cyan-500 hover:from-green-500 hover:to-cyan-600 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg">
                    Register
                </button>
            </form>
            <p className="mt-6 text-center text-gray-200 z-10 relative">
                Already have an account? <Link to="/login" className="text-cyan-300 font-bold hover:underline">Log In</Link>
            </p>
        </div>
    );
};

export default Register;
