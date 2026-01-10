import React, { useState, useRef } from 'react';
import { api } from '../api';

export default function LandingPage({ onEnter }) {
    const [mode, setMode] = useState('landing'); // 'landing', 'login', 'register', 'register-org'
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '', orgName: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const whoRef = useRef(null);
    const whatRef = useRef(null);

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let userData;
            if (mode === 'login' || mode === 'doctor-login') {
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
            action: () => setMode('doctor-login'),
            btnText: 'Doctor login',
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



    const renderWhoWeAre = () => (
        <div ref={whoRef} className="container fade-in" style={{ padding: '6rem 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', color: '#1F2937' }}>Who We Are</h2>
                <div style={{ width: '80px', height: '6px', background: 'var(--primary)', margin: '0 auto', borderRadius: '4px' }}></div>
            </div>

            <div className="grid grid-2" style={{ gap: '4rem', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1F2937' }}>
                        Bridging the Gap in Modern Healthcare
                    </h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                        At MedX, we believe that quality healthcare should be accessible, efficient, and intelligent. We are a team of innovators, doctors, and engineers dedicated to transforming the patient-provider experience.
                    </p>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', lineHeight: '1.8' }}>
                        By harnessing the power of advanced AI and intuitive design, we create solutions that empower patients to take control of their health and enable providers to focus on what matters most—caring for people.
                    </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                    {[
                        { title: 'Innovation', icon: '💡', desc: 'Pioneering AI solutions.' },
                        { title: 'Compassion', icon: '❤️', desc: 'Care at the core.' },
                        { title: 'Security', icon: '🔒', desc: 'Your data, protected.' },
                        { title: 'Speed', icon: '⚡', desc: 'Instant insights.' }
                    ].map((item, idx) => (
                        <div key={idx} style={{
                            padding: '2rem',
                            background: 'white',
                            borderRadius: '24px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                            transition: 'transform 0.3s ease',
                            cursor: 'default'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>{item.title}</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderWhatWeDo = () => (
        <div ref={whatRef} className="container fade-in" style={{ padding: '6rem 0', background: '#f9fafb', borderRadius: '40px', margin: '4rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', color: '#1F2937' }}>What We Do</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Comprehensive tools for every stakeholder in the healthcare ecosystem.
                </p>
            </div>

            <div className="grid grid-3" style={{ textAlign: 'left', gap: '2rem', padding: '0 2rem' }}>
                {features.map((f, i) => (
                    <div key={i} className="list-item" style={{
                        padding: '3rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        background: 'white',
                        border: 'none',
                        borderRadius: '32px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{
                            width: '70px', height: '70px',
                            background: i === 0 ? '#FEFCE8' : (i === 1 ? '#ECFDF5' : '#EFF6FF'),
                            borderRadius: '20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.5rem',
                            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
                        }}>
                            {f.icon}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem', color: '#1F2937' }}>{f.title}</h3>
                            <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, fontSize: '1.1rem' }}>{f.desc}</p>
                        </div>
                        <div style={{ marginTop: 'auto' }}>
                            <button
                                onClick={f.action}
                                style={{
                                    background: '#F3F4F6',
                                    color: 'var(--text-main)',
                                    border: 'none',
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '16px',
                                    fontWeight: 700,
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
                            >
                                {f.btnText} →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderHero = () => (
        <div className="container fade-in" style={{ padding: '8rem 0 4rem 0', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Hero Header */}
            <div style={{ textAlign: 'center', position: 'relative' }}>

                {/* Decorative Pill Shape (Abstract Image Placeholder) */}
                <div style={{
                    position: 'absolute',
                    top: '-100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(167, 243, 208, 0.4) 0%, rgba(255, 255, 255, 0) 70%)',
                    borderRadius: '50%',
                    zIndex: -1,
                    filter: 'blur(40px)'
                }}></div>

                <h1 style={{
                    fontSize: '6rem',
                    fontWeight: '800',
                    marginBottom: '1.5rem',
                    lineHeight: '0.9',
                    letterSpacing: '-2px',
                    color: '#1F2937'
                }}>
                    MedX
                    <span style={{ display: 'block', color: 'var(--primary)' }}>is Support.</span>
                </h1>

                <p style={{
                    fontSize: '1.5rem',
                    color: 'var(--text-dim)',
                    maxWidth: '600px',
                    margin: '0 auto 4rem auto',
                    lineHeight: '1.6',
                    fontWeight: 500
                }}>
                    Providing hope and help during challenging times with AI-powered care.
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                    <button className="btn-primary" style={{ fontSize: '1.25rem', padding: '1.25rem 3.5rem', borderRadius: '999px', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)' }} onClick={() => setMode('register')}>
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
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                        onClick={() => setMode('login')}
                    >
                        Sign In
                    </button>
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
                    {mode === 'login' ? 'Welcome Back' : (mode === 'doctor-login' ? 'Doctor Login' : (mode === 'register-org' ? 'New Partner' : 'Join Us'))}
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                    {mode === 'login' || mode === 'doctor-login' ? 'Continue your health journey.' : 'Create your account to get support.'}
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
                        {loading ? 'Processing...' : (mode === 'login' || mode === 'doctor-login' ? 'Sign In' : 'Create Account')}
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
                <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)', borderRadius: '0 0 20px 20px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-1px' }}>MedX</div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <span onClick={() => scrollToSection(whoRef)} style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}>Who We Are</span>
                        <span onClick={() => scrollToSection(whatRef)} style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}>What We Do</span>
                        <button onClick={() => setMode('login')} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', fontSize: '0.9rem', borderRadius: '999px', fontWeight: 700 }}>Login</button>
                    </div>
                </div>
            )}

            {mode === 'landing' ? (
                <>
                    {renderHero()}
                    {renderWhoWeAre()}
                    {renderWhatWeDo()}
                </>
            ) : renderAuthForm()}

            <footer style={{ marginTop: 'auto', padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', borderTop: '1px solid rgba(0,0,0,0.05)', background: '#F9FAFB' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', filter: 'grayscale(100%)', opacity: 0.6, marginBottom: '2rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>Google Cloud</span>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>FastAPI</span>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>React</span>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>Gemini</span>
                </div>
                <p style={{ fontWeight: 500 }}>&copy; 2026 MedX. All rights reserved.</p>
            </footer>
        </div>
    );
}
