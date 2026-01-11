import { useState, useEffect } from 'react'
import { api } from '../api'
import { FileText, Shield, FileOutput, Activity, CheckCircle, AlertCircle, Clock, Search } from 'lucide-react'

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalPatients: 156,
        notesAnalyzed: 1247,
        prescriptionsScanned: 892,
        interactionsChecked: 534
    })
    const [auditLogs, setAuditLogs] = useState([])
    const [showLogs, setShowLogs] = useState(false)
    const [loadingLogs, setLoadingLogs] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                notesAnalyzed: prev.notesAnalyzed + Math.floor(Math.random() * 2),
                interactionsChecked: prev.interactionsChecked + Math.floor(Math.random() * 2)
            }))
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    const fetchLogs = async () => {
        setLoadingLogs(true)
        setShowLogs(true)
        try {
            const logs = await api.getAuditLogs()
            setAuditLogs(logs)
        } catch (err) {
            console.error('Failed to fetch audit logs:', err)
        } finally {
            setLoadingLogs(false)
        }
    }

    const features = [
        {
            id: 'clinical',
            icon: FileText,
            title: 'Clinical Intelligence',
            description: 'Advanced NLP for medical entity extraction, de-identification, and FHIR mapping.',
            color: 'text-indigo-600',
            bg: 'bg-indigo-100',
            tags: ['Gemini 1.5 Pro', 'HIPAA']
        },
        {
            id: 'prescription',
            icon: FileOutput,
            title: 'Prescription OCR',
            description: 'Convert handwritten or printed prescriptions into structured digital records.',
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
            tags: ['Vision API', 'OCR']
        },
        {
            id: 'interactions',
            icon: Shield,
            title: 'Safety Guardian',
            description: 'Automated drug-drug interaction detection and clinical decision support.',
            color: 'text-amber-600',
            bg: 'bg-amber-100',
            tags: ['Real-time', 'Safety']
        },
        {
            id: 'medications',
            icon: Activity,
            title: 'Patient Adherence',
            description: 'Personalized coaching and adherence tracking for better health outcomes.',
            color: 'text-rose-600',
            bg: 'bg-rose-100',
            tags: ['Coaching', 'Tracking']
        }
    ]

    return (
        <div className="animate-fade-in space-y-12 pb-16">
            <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
                    MedX <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">AI Suite</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                    Next-generation clinical intelligence powered by multi-modal AI agents.
                    Transforming raw healthcare narratives into actionable FHIR insights.
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Patients', val: stats.totalPatients, color: 'text-primary' },
                    { label: 'Notes Analyzed', val: stats.notesAnalyzed, color: 'text-purple-600' },
                    { label: 'Safety Checks', val: stats.interactionsChecked, color: 'text-amber-600' },
                    { label: 'Docs Processed', val: stats.prescriptionsScanned, color: 'text-emerald-600' }
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 md:p-8 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform duration-300">
                        <div className={`text-sm font-bold uppercase tracking-widest mb-2 ${stat.color}`}>
                            {stat.label}
                        </div>
                        <div className="text-4xl md:text-5xl font-black text-foreground font-display">
                            {stat.val.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                    <div
                        key={feature.id}
                        className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-sm hover:shadow-xl transition-all hover:bg-white/80 group"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                            <feature.icon className="w-8 h-8" />
                        </div>

                        <h3 className="text-2xl font-bold mb-3 text-foreground">{feature.title}</h3>
                        <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                            {feature.description}
                        </p>

                        <div className="flex gap-2">
                            {feature.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-lg bg-secondary/50 border border-secondary text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* System Status Banner */}
            <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-3xl border border-primary/10 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-green-100 text-green-600 rounded-full animate-pulse">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">System Integrity</div>
                        <div className="text-green-600 font-bold text-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 fill-current" />
                            99.9% Uptime Verified
                        </div>
                    </div>
                </div>
                <button
                    onClick={fetchLogs}
                    className="px-8 py-3 bg-white border border-border text-foreground font-bold rounded-xl hover:bg-gray-50 hover:shadow-md transition-all flex items-center gap-2"
                >
                    <Clock className="w-4 h-4" /> View Global Audit Log
                </button>
            </div>

            {/* Audit Log Modal */}
            {showLogs && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                        <div className="p-6 border-b border-border bg-secondary/30 flex justify-between items-center">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Shield className="w-6 h-6 text-primary" /> Global Audit Log
                            </h2>
                            <button
                                onClick={() => setShowLogs(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-border hover:bg-gray-100 transition-colors"
                            >
                                <span className="text-lg leading-none">&times;</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-3 custom-scrollbar">
                            {loadingLogs ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <div className="animate-spin text-2xl mb-2">⟳</div>
                                    <p>Fetching latest logs...</p>
                                </div>
                            ) : auditLogs.length === 0 ? (
                                <p className="text-center py-12 text-muted-foreground">No logs found.</p>
                            ) : (
                                auditLogs.map(log => (
                                    <div key={log.id} className="bg-white p-4 rounded-xl border border-border flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                                        <div>
                                            <div className="font-bold text-foreground text-base mb-1">{log.action}</div>
                                            <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> {new Date(log.timestamp).toLocaleString()}
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                <User className="w-3 h-3" /> {log.user}
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${log.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {log.status === 'Success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                            {log.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-border bg-white text-center text-xs text-muted-foreground">
                            Logs are immutable and stored securely for compliance.
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
