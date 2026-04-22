import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    const checkLoggedIn = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get('http://localhost:5000/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUser(res.data);
        } catch (error) {
            console.error(error);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkLoggedIn();
    }, [token]);

    const login = async (email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
    };

    const register = async (name, email, password) => {
        await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
        // Automatically login after successful registration or redirect to login.
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
