import React, { useState } from 'react';
import { api } from '../api';

export default function LandingPage({ onEnter }) {
    const [mode, setMode] = useState('landing'); // 'landing', 'login', 'register', 'register-org'
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '', orgName: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let userData;
            if (mode === 'login') {
                userData = await api.login({ email: formData.email, password: formData.password });
            } else if (mode === 'register') {
                await api.register({ email: formData.email, password: formData.password, full_name: formData.fullName });
                userData = await api.login({ email: formData.email, password: formData.password });
            } else if (mode === 'register-org') {
                await api.registerOrg({
                    org_name: formData.orgName,
                    admin_email: formData.email,
                    admin_password: formData.password,
                    admin_name: formData.fullName
                });
                userData = await api.login({ email: formData.email, password: formData.password });
            }
            onEnter(userData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            icon: '🏥',
            title: 'For Patients',
            desc: 'Find specialists, book instantly, and check medication safety.',
            action: () => setMode('register'),
            btnText: 'Join Now'
        },
        {
            icon: '👨‍⚕️',
            title: 'For Doctors',
            desc: 'AI clinical notes, smart scheduling, and instant OCR.',
            action: () => setMode('register-org'),
            btnText: 'Provider Access',
            secondary: true
        },
        {
            icon: '🏢',
            title: 'For Partners',
            desc: 'Manage efficiency with organization-level tools.',
            action: () => setMode('register-org'),
            btnText: 'Partner Login'
        }
    ];

    const renderHero = () => (
        <div className="container fade-in" style={{ padding: '6rem 0' }}>
            {/* Hero Header */}
            <div style={{ textAlign: 'center', marginBottom: '8rem', position: 'relative' }}>

                {/* Decorative Pill Shape (Abstract Image Placeholder) */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '300px',
                    height: '150px',
                    background: 'linear-gradient(135deg, #A7F3D0 0%, #FDF8F0 100%)',
                    borderRadius: '100px',
                    zIndex: -1,
                    opacity: 0.8
                }}></div>

                <div className="badge badge-success" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
                    ✨ Powered by Gemini 1.5 Pro
                </div>

                <h1 style={{
                    fontSize: '6rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    lineHeight: '0.9',
                    letterSpacing: '-2px',
                    color: '#1F2937'
                }}>
                    MedX
                    <span style={{ display: 'block' }}>is Support.</span>
                </h1>

                <p style={{
                    fontSize: '1.5rem',
                    color: 'var(--text-dim)',
                    maxWidth: '600px',
                    margin: '2rem auto 4rem auto',
                    lineHeight: '1.6',
                    fontWeight: 500
                }}>
                    Providing hope and help during challenging times with AI-powered care.
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                    <button className="btn-primary" style={{ fontSize: '1.25rem', padding: '1.25rem 3.5rem', borderRadius: '999px' }} onClick={() => setMode('register')}>
                        Get Started
                    </button>
                    <button
                        style={{
                            fontSize: '1.25rem',
                            padding: '1.25rem 3.5rem',
                            background: 'white',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '999px',
                            color: 'var(--text-main)',
                            fontWeight: 600
                        }}
                        onClick={() => setMode('login')}
                    >
                        Sign In
                    </button>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-3" style={{ textAlign: 'left', gap: '2rem' }}>
                {features.map((f, i) => (
                    <div key={i} className="list-item" style={{
                        padding: '3rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        background: i === 0 ? '#FEFCE8' : (i === 1 ? '#ECFDF5' : 'white'), /* Subtle Tint */
                        border: 'none',
                        borderRadius: '32px'
                    }}>
                        <div style={{
                            width: '60px', height: '60px',
                            background: 'white',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                        }}>
                            {f.icon}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: '#1F2937' }}>{f.title}</h3>
                            <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, fontSize: '1.1rem' }}>{f.desc}</p>
                        </div>
                        <div style={{ marginTop: 'auto' }}>
                            <button
                                onClick={f.action}
                                style={{
                                    background: 'white',
                                    color: 'var(--text-main)',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '999px',
                                    fontWeight: 700
                                }}
                            >
                                {f.btnText} →
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Logos Strip */}
            <div style={{ marginTop: '8rem', textAlign: 'center', opacity: 0.5 }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', filter: 'grayscale(100%)' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.5rem' }}>Google Cloud</span>
                    <span style={{ fontWeight: 800, fontSize: '1.5rem' }}>FastAPI</span>
                    <span style={{ fontWeight: 800, fontSize: '1.5rem' }}>React</span>
                    <span style={{ fontWeight: 800, fontSize: '1.5rem' }}>Gemini</span>
                </div>
            </div>
        </div>
    );

    const renderAuthForm = () => (
        <div className="container fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '80vh' }}>
            <div className="modal-content" style={{ padding: '4rem', maxWidth: '500px' }}>
                <button
                    onClick={() => setMode('landing')}
                    style={{ position: 'absolute', top: '2rem', left: '2rem', background: 'none', color: 'var(--text-muted)', padding: 0, boxShadow: 'none' }}
                >
                    ← Back
                </button>

                <h2 style={{ textAlign: 'center', marginBottom: '0.75rem', fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>
                    {mode === 'login' ? 'Welcome Back' : (mode === 'register-org' ? 'New Partner' : 'Join Us')}
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                    {mode === 'login' ? 'Continue your health journey.' : 'Create your account to get support.'}
                </p>

                <form onSubmit={handleSubmit} className="form-container">
                    {mode === 'register-org' && (
                        <div className="form-group">
                            <label>Organization Name</label>
                            <input
                                type="text"
                                required
                                value={formData.orgName}
                                onChange={e => setFormData({ ...formData, orgName: e.target.value })}
                                placeholder="e.g. Health Corp"
                                autoFocus
                            />
                        </div>
                    )}

                    {(mode === 'register' || mode === 'register-org') && (
                        <div className="form-group">
                            <label>{mode === 'register-org' ? 'Admin Name' : 'Full Name'}</label>
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="John Doe"
                                autoFocus={mode !== 'register-org'}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>{mode === 'register-org' ? 'Admin Email' : 'Email Address'}</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="user@example.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.25rem', marginTop: '1rem', fontSize: '1.1rem' }} disabled={loading}>
                        {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-dim)', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '2rem' }}>
                    {mode === 'login' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div>
                                New Patient? <button onClick={() => { setMode('register'); setError(null); }} style={{ background: 'none', color: 'var(--primary)', padding: 0, boxShadow: 'none', fontWeight: 700 }}>Create Account</button>
                            </div>
                            <div>
                                Organization? <button onClick={() => { setMode('register-org'); setError(null); }} style={{ background: 'none', color: 'var(--text-main)', padding: 0, boxShadow: 'none', fontWeight: 600 }}>Partner Registration</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            Already have an account? <button onClick={() => { setMode('login'); setError(null); }} style={{ background: 'none', color: 'var(--primary)', padding: 0, boxShadow: 'none', fontWeight: 700 }}>Sign In</button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="error-message" style={{ marginTop: '2rem' }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar for Landing only */}
            {mode === 'landing' && (
                <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-1px' }}>MedX</div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Who We Are</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>What We Do</span>
                        <button onClick={() => setMode('login')} style={{ background: 'white', border: '1px solid rgba(0,0,0,0.1)', padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>Login</button>
                    </div>
                </div>
            )}

            {mode === 'landing' ? renderHero() : renderAuthForm()}

            <footer style={{ marginTop: 'auto', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <p style={{ fontWeight: 500 }}>&copy; 2026 MedX. All rights reserved.</p>
            </footer>
        </div>
    );
}
