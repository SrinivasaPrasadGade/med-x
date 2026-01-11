import React, { useState, useEffect } from 'react';
import { api } from '../api';
import ClinicalNoteAnalyzer from './ClinicalNoteAnalyzer';
import { Calendar, FileText, Search, Clock, CheckCircle, AlertTriangle, User, ClipboardList, PenTool } from 'lucide-react';

export default function DoctorDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('schedule');
    const [appointments, setAppointments] = useState([]);
    const [selectedAppt, setSelectedAppt] = useState(null); // For consultation modal
    const [consultationData, setConsultationData] = useState({ diagnosis: '', treatment_notes: '' });

    // History Search
    const [searchName, setSearchName] = useState('');
    const [historyResults, setHistoryResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        if (activeTab === 'schedule') {
            loadSchedule();
        }
    }, [activeTab]);

    const loadSchedule = async () => {
        try {
            const data = await api.getDoctorAppointments(user.user_id);
            setAppointments(data);
        } catch (e) {
            console.error("Failed to load schedule", e);
        }
    };

    const handleSearchHistory = async (e) => {
        e.preventDefault();
        if (!searchName.trim()) return;
        setLoading(true);
        try {
            const data = await api.getPatientHistory(searchName);
            setHistoryResults(data);
        } catch (e) {
            alert("No records found");
        } finally {
            setLoading(false);
        }
    };

    const openConsultation = (appt) => {
        setSelectedAppt(appt);
        setConsultationData({ diagnosis: appt.diagnosis || '', treatment_notes: appt.treatment_notes || '' });
    };

    const handleCompleteConsultation = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.completeAppointment(selectedAppt.id, consultationData);
            setMsg({ type: 'success', text: 'Consultation saved.' });
            setSelectedAppt(null); // Close modal
            loadSchedule(); // Refresh list
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        Dr. {user.user_name} <span className="text-primary text-sm font-bold uppercase px-3 py-1 bg-primary/10 rounded-full tracking-wider">Portal</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Manage appointments and patient records.
                    </p>
                </div>
            </div>

            {/* Sub-Navigation */}
            <div className="flex p-1 bg-secondary/50 backdrop-blur-sm rounded-2xl w-fit border border-white/20">
                {[
                    { id: 'schedule', label: 'My Schedule', icon: Calendar },
                    { id: 'history', label: 'Patient History', icon: ClipboardList },
                    { id: 'clinical', label: 'Clinical AI', icon: FileText }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
                            ${activeTab === tab.id
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/50'}
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === 'schedule' && (
                    <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 p-6 md:p-8 shadow-sm">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-primary" /> Upcoming Appointments
                        </h3>

                        <div className="space-y-4">
                            {appointments.length === 0 ? (
                                <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-border">
                                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground font-medium">No appointments scheduled for today.</p>
                                </div>
                            ) : (
                                appointments.map(appt => (
                                    <div key={appt.id} className={`
                                        bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all
                                        flex flex-col lg:flex-row lg:items-center justify-between gap-6
                                        ${appt.status === 'Completed' ? 'opacity-75 bg-secondary/30' : ''}
                                    `}>
                                        <div className="flex items-start gap-4">
                                            <div className={`
                                                w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
                                                ${appt.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}
                                            `}>
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-foreground">{appt.patient_name}</h4>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1 font-medium text-foreground">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(appt.date_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </span>
                                                    {appt.reason && <span>• Reason: "{appt.reason}"</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {appt.status === 'Scheduled' && (
                                                <button
                                                    onClick={() => openConsultation(appt)}
                                                    className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
                                                >
                                                    <PenTool className="w-4 h-4" /> Start Consultation
                                                </button>
                                            )}
                                            {appt.status === 'Completed' && (
                                                <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-xl flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" /> Completed
                                                </span>
                                            )}
                                            {appt.status === 'Cancelled' && (
                                                <span className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-xl flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4" /> Cancelled
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 p-6 md:p-8 shadow-sm">
                        <h3 className="text-2xl font-bold mb-6">Patient Records</h3>

                        <form onSubmit={handleSearchHistory} className="max-w-xl mb-8 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-border rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-lg"
                                value={searchName}
                                onChange={e => setSearchName(e.target.value)}
                                placeholder="Search patient name..."
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                {loading ? '...' : 'Search'}
                            </button>
                        </form>

                        <div className="space-y-4">
                            {historyResults.length === 0 && !loading && (
                                <div className="text-center py-12 text-muted-foreground bg-white/40 rounded-3xl border border-dashed border-border">
                                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Search for a patient to view their clinical history.</p>
                                </div>
                            )}
                            {historyResults.map((rec, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-48 flex-shrink-0">
                                        <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Date</div>
                                        <div className="font-semibold text-foreground">{new Date(rec.date).toLocaleDateString()}</div>
                                        <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded inline-block mt-2">Dr. {rec.doctor_name}</div>
                                    </div>
                                    <div className="flex-1 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                                        <div className="mb-4">
                                            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Diagnosis</div>
                                            <div className="text-lg font-bold text-foreground">{rec.diagnosis}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Treatment Plan</div>
                                            <p className="text-muted-foreground leading-relaxed">{rec.treatment_notes}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'clinical' && (
                    <div className="animate-fade-in">
                        <ClinicalNoteAnalyzer />
                    </div>
                )}
            </div>

            {/* Consultation Modal */}
            {selectedAppt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-border bg-secondary/30 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold">Consultation</h2>
                                <p className="text-muted-foreground">Patient: <span className="text-foreground font-semibold">{selectedAppt.patient_name}</span></p>
                            </div>
                            <div className="bg-white px-3 py-1 rounded-lg border border-border text-sm font-medium">
                                Visit #{selectedAppt.id}
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
                                <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-1">Reason for Visit</h4>
                                <p className="text-blue-900 font-medium text-lg">"{selectedAppt.reason}"</p>
                            </div>

                            <form id="consultForm" onSubmit={handleCompleteConsultation} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Diagnosis</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-lg font-medium"
                                        value={consultationData.diagnosis}
                                        onChange={e => setConsultationData({ ...consultationData, diagnosis: e.target.value })}
                                        placeholder="e.g. Acute Bronchitis"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Treatment Notes & Plan</label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[150px]"
                                        value={consultationData.treatment_notes}
                                        onChange={e => setConsultationData({ ...consultationData, treatment_notes: e.target.value })}
                                        placeholder="Detailed treatment notes, prescriptions, and follow-up instructions..."
                                        required
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-border bg-gray-50 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setSelectedAppt(null)}
                                className="flex-1 py-3 bg-white border border-border text-foreground font-semibold rounded-xl hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="consultForm"
                                disabled={loading}
                                className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:bg-primary/90 transition-all"
                            >
                                {loading ? 'Saving...' : 'Complete Visit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
