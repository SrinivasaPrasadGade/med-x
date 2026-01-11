import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ChevronRight,
    Shield,
    Activity,
    Clock,
    Stethoscope,
    Building2,
    User,
    ArrowRight,
    Database,
    Lock,
    Zap
} from 'lucide-react';
import { api } from '../api';

const FadeIn = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
        {children}
    </motion.div>
);

export default function LandingPage({ onEnter }) {
    const [mode, setMode] = useState('landing');
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '', orgName: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

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

    if (mode !== 'landing') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden z-10"
                >
                    <div className="p-8">
                        <button
                            onClick={() => setMode('landing')}
                            className="text-muted-foreground hover:text-foreground transition-colors mb-6 flex items-center gap-2 text-sm font-medium"
                        >
                            <ArrowRight className="rotate-180 w-4 h-4" /> Back to Home
                        </button>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                                {mode === 'login' ? 'Welcome Back' :
                                    mode === 'doctor-login' ? 'Provider Portal' :
                                        mode === 'register-org' ? 'Partner Access' : 'Join MedX'}
                            </h2>
                            <p className="text-muted-foreground">
                                {mode.includes('login') ? 'Securely access your healthcare dashboard.' : 'Start your journey to better health management.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {mode === 'register-org' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground ml-1">Organization</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                        type="text"
                                        placeholder="Organization Name"
                                        required
                                        value={formData.orgName}
                                        onChange={e => setFormData({ ...formData, orgName: e.target.value })}
                                    />
                                </div>
                            )}

                            {(mode === 'register' || mode === 'register-org') && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground ml-1">Full Name</label>
                                    <input
                                        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                        type="text"
                                        placeholder="John Doe"
                                        required
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground ml-1">Email</label>
                                <input
                                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground ml-1">Password</label>
                                <input
                                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Continue'}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-border flex flex-col gap-2 text-center text-sm text-muted-foreground">
                            {mode === 'login' ? (
                                <>
                                    <p>New here? <button onClick={() => setMode('register')} className="text-primary font-semibold hover:underline">Create Patient Account</button></p>
                                    <p>Healthcare Provider? <button onClick={() => setMode('register-org')} className="text-foreground font-semibold hover:underline">Register Organization</button></p>
                                </>
                            ) : (
                                <p>Already registered? <button onClick={() => setMode('login')} className="text-primary font-semibold hover:underline">Sign In</button></p>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary">
            {/* Navigation */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-full px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">M</div>
                            <span className="text-xl font-bold tracking-tight text-foreground">MedX</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                            <a href="#features" className="hover:text-primary transition-colors">Features</a>
                            <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
                            <a href="#about" className="hover:text-primary transition-colors">About</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setMode('login')} className="px-5 py-2 text-sm font-semibold text-foreground hover:bg-secondary rounded-full transition-colors">
                                Log in
                            </button>
                            <button onClick={() => setMode('register')} className="px-5 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-full hover:shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95">
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-6">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <FadeIn>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-8 border border-blue-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Waitlist access now open for Enterprise
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.1}>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground mb-8 leading-[1.1]">
                            Healthcare <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Reimagined.</span>
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                            Experience the future of medical care with AI-driven insights,
                            instant clinical analysis, and seamless patient-provider connection.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.3}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button onClick={() => setMode('register')} className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all">
                                Start Free Trial
                            </button>
                            <button onClick={() => setMode('doctor-login')} className="w-full sm:w-auto px-8 py-4 bg-white text-foreground border border-border rounded-full font-bold text-lg hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2">
                                Provider Access <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </FadeIn>
                </div>

                {/* Abstract Shapes */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-blue-100/50 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl -z-10 pointer-events-none" />
            </section>

            {/* Features Bentials */}
            <section id="features" className="py-24 px-6 relative bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <FadeIn>
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-foreground mb-4">Everything needed for <br />modern healthcare.</h2>
                            <p className="text-xl text-muted-foreground">Powerful tools for patients, doctors, and organizations.</p>
                        </div>
                    </FadeIn>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: User,
                                title: "For Patients",
                                desc: "Track medications, check interactions, and connect with top specialists instantly.",
                                color: "bg-blue-50 text-blue-600",
                                action: () => setMode('register')
                            },
                            {
                                icon: Stethoscope,
                                title: "For Doctors",
                                desc: "AI-powered clinical notes, patient insights, and streamlined workflow management.",
                                color: "bg-green-50 text-green-600",
                                action: () => setMode('doctor-login')
                            },
                            {
                                icon: Building2,
                                title: "For Organizations",
                                desc: "Enterprise-grade analytics, staff management, and operational efficiency tools.",
                                color: "bg-purple-50 text-purple-600",
                                action: () => setMode('register-org')
                            }
                        ].map((feature, i) => (
                            <FadeIn delay={i * 0.1} key={i}>
                                <div className="group relative bg-white p-8 rounded-[2rem] border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-start">
                                    <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                                        <feature.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground mb-8 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                    <button onClick={feature.action} className="mt-auto flex items-center gap-2 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                        Learn more <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* Capabilities Grid */}
            <section id="solutions" className="py-24 px-6 bg-secondary/30">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        <FadeIn>
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-border h-full flex flex-col justify-center">
                                <Activity className="w-12 h-12 text-primary mb-6" />
                                <h3 className="text-3xl font-bold mb-4">Real-time Analytics</h3>
                                <p className="text-lg text-muted-foreground mb-8">
                                    Monitor health trends with precision. Our AI analyzes data points to provide actionable insights for better outcomes.
                                </p>
                                <div className="bg-secondary/50 rounded-2xl p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-sm font-semibold text-foreground">System Operational</span>
                                    </div>
                                    <div className="h-32 bg-white rounded-xl w-full relative overflow-hidden flex items-end gap-1 p-2">
                                        {[40, 70, 45, 90, 60, 80, 50, 75, 65, 85].map((h, i) => (
                                            <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary transition-colors cursor-crosshair" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </FadeIn>

                        <div className="space-y-8">
                            {[
                                { icon: Database, title: "Secure Records", desc: "HIPAA-compliant encrypted storage for all medical history." },
                                { icon: Zap, title: "Instant OCR", desc: "Convert handwritten prescriptions to digital data in seconds." },
                                { icon: Lock, title: "Privacy First", desc: "Your health data belongs to you. Full control and transparency." }
                            ].map((item, i) => (
                                <FadeIn delay={i * 0.1} key={i}>
                                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-border flex items-start gap-6 hover:shadow-md transition-shadow">
                                        <div className="p-4 rounded-2xl bg-secondary text-primary">
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                                            <p className="text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-border pt-20 pb-10 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">M</div>
                                <span className="text-xl font-bold text-foreground">MedX</span>
                            </div>
                            <p className="text-muted-foreground max-w-sm">
                                Empowering better health decisions through technology and compassion.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground mb-6">Platform</h4>
                            <ul className="space-y-4 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Enterprise</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground mb-6">Company</h4>
                            <ul className="space-y-4 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                        <p>&copy; 2026 MedX Inc. All rights reserved.</p>
                        <div className="flex items-center gap-8">
                            <a href="#" className="hover:text-primary">Privacy Policy</a>
                            <a href="#" className="hover:text-primary">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
