import React, { useState, useEffect } from 'react';
import { api } from '../api';
import DrugInteractionChecker from './DrugInteractionChecker';
import MedicationManager from './MedicationManager';
import PrescriptionScanner from './PrescriptionScanner';
import { Search, MapPin, Star, Calendar, Clock, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function PatientDashboard({ user, setUser }) {
    const [activeTab, setActiveTab] = useState('findCare');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    // Find Care State
    const [doctors, setDoctors] = useState([]);
    // Filter State
    const [filters, setFilters] = useState({
        search: '',
        specialization: '',
        hospital: '',
        minRating: 0
    });
    const [selectedDoctor, setSelectedDoctor] = useState(null); // For booking modal
    const [bookingData, setBookingData] = useState({ dateTime: '', reason: '' });

    // My Health State
    const [appointments, setAppointments] = useState([]);

    // Profile State
    const [profileData, setProfileData] = useState({ fullName: user.user_name, password: '' });

    useEffect(() => {
        setMsg(null); // Clear messages on tab change
        if (activeTab === 'findCare') {
            loadDoctors();
        } else if (activeTab === 'appointments') {
            loadAppointments();
        }
    }, [activeTab]);

    const loadDoctors = async () => {
        try {
            // Fetch all doctors to allow client-side filtering
            const data = await api.getAllDoctors();
            setDoctors(data);
        } catch (e) {
            console.error("Failed to load doctors", e);
        }
    };

    const loadAppointments = async () => {
        try {
            const data = await api.getMyAppointments(user.user_id);
            setAppointments(data);
        } catch (e) {
            console.error("Failed to load appointments", e);
        }
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        try {
            await api.bookAppointment({
                doctor_id: selectedDoctor.id,
                organization_id: selectedDoctor.organization_id,
                patient_id: user.user_id,
                patient_name: user.user_name,
                date_time: bookingData.dateTime,
                reason: bookingData.reason
            });
            setMsg({ type: 'success', text: 'Appointment booked successfully!' });
            setBookingData({ dateTime: '', reason: '' });
            setSelectedDoctor(null);
        } catch (e) {
            setMsg({ type: 'error', text: e.message });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async (id) => {
        if (!confirm("Are you sure you want to cancel?")) return;
        try {
            await api.cancelMyAppointment(id);
            loadAppointments();
        } catch (e) {
            alert(e.message);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        try {
            await api.updateProfile(user.user_id, {
                full_name: profileData.fullName,
                password: profileData.password || undefined
            });
            setMsg({ type: 'success', text: 'Profile updated. Please re-login to see changes.' });
        } catch (e) {
            setMsg({ type: 'error', text: e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Welcome, {user.user_name}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Your personal health command center.
                    </p>
                </div>
            </div>

            {/* Sub-Navigation for Dashboard */}
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                {[
                    { id: 'findCare', label: 'Find Care', icon: '🔍' },
                    { id: 'appointments', label: 'My Appointments', icon: '📅' },
                    { id: 'medications', label: 'My Medications', icon: '💊' },
                    { id: 'scanner', label: 'Smart Scanner', icon: '📸' },
                    { id: 'interactions', label: 'Drug Safety', icon: '🛡️' },
                    { id: 'documents', label: 'Documents', icon: '📂' },
                    { id: 'profile', label: 'Profile', icon: '👤' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap border
                            ${activeTab === tab.id
                                ? 'bg-white text-primary border-primary/20 shadow-sm'
                                : 'bg-transparent text-muted-foreground border-transparent hover:bg-secondary/50'}
                        `}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'findCare' && (
                    <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 p-6 md:p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">Find a Doctor</h2>

                        {/* Filters */}
                        {(() => {
                            const uniqueSpecs = [...new Set(doctors.map(d => d.specialization || 'General Practice'))];
                            const uniqueHospitals = [...new Set(doctors.map(d => d.organization_name))];

                            const filteredDoctors = doctors.filter(doc => {
                                const nameMatch = doc.full_name.toLowerCase().includes(filters.search.toLowerCase());
                                const specMatch = filters.specialization ? (doc.specialization || 'General Practice') === filters.specialization : true;
                                const hospitalMatch = filters.hospital ? doc.organization_name === filters.hospital : true;
                                const ratingMatch = filters.minRating ? (doc.rating || 0) >= parseFloat(filters.minRating) : true;
                                return nameMatch && specMatch && hospitalMatch && ratingMatch;
                            });

                            return (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                value={filters.search}
                                                onChange={e => setFilters({ ...filters, search: e.target.value })}
                                                placeholder="Dr. Name..."
                                            />
                                        </div>
                                        <select
                                            className="w-full px-4 py-2.5 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={filters.specialization}
                                            onChange={e => setFilters({ ...filters, specialization: e.target.value })}
                                        >
                                            <option value="">All Specializations</option>
                                            {uniqueSpecs.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <select
                                            className="w-full px-4 py-2.5 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={filters.hospital}
                                            onChange={e => setFilters({ ...filters, hospital: e.target.value })}
                                        >
                                            <option value="">All Hospitals</option>
                                            {uniqueHospitals.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                        <select
                                            className="w-full px-4 py-2.5 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={filters.minRating}
                                            onChange={e => setFilters({ ...filters, minRating: e.target.value })}
                                        >
                                            <option value="0">Any Rating</option>
                                            <option value="3.5">3.5+ Stars</option>
                                            <option value="4.0">4.0+ Stars</option>
                                            <option value="4.5">4.5+ Stars</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {filteredDoctors.map(doc => (
                                            <div key={doc.id} className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group">
                                                <div>
                                                    <div className="block text-sm font-semibold text-primary mb-1">{doc.specialization || 'General Practice'}</div>
                                                    <h3 className="text-lg font-bold text-foreground">{doc.full_name}</h3>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {doc.organization_name}</span>
                                                        <span className="flex items-center gap-1 text-yellow-500 font-medium"><Star className="w-3.5 h-3.5 fill-current" /> {doc.rating}/5.0</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                                        <Clock className="w-3.5 h-3.5" /> {doc.availability || 'Contact for hours'}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedDoctor(doc)}
                                                    className="w-full md:w-auto px-6 py-2.5 bg-secondary text-foreground font-semibold rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95 whitespace-nowrap"
                                                >
                                                    Book Visit
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {filteredDoctors.length === 0 && (
                                        <div className="text-center py-20 text-muted-foreground">
                                            <p className="text-lg">No doctors found matching criteria.</p>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )}

                {activeTab === 'appointments' && (
                    <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 p-6 md:p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">My Appointments</h2>
                        <div className="space-y-4">
                            {appointments.length === 0 ? (
                                <p className="text-center py-12 text-muted-foreground">No appointment history found.</p>
                            ) : (
                                appointments.map(appt => (
                                    <div key={appt.id} className={`
                                        bg-white p-6 rounded-2xl border-l-[6px] shadow-sm relative overflow-hidden
                                        ${appt.status === 'Completed' ? 'border-l-green-500' : appt.status === 'Cancelled' ? 'border-l-red-500' : 'border-l-blue-500'}
                                    `}>
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-semibold text-foreground">{new Date(appt.date_time).toLocaleString()}</span>
                                                </div>
                                                <div className="text-lg font-bold text-foreground">Dr. {appt.doctor_name} <span className="text-sm font-normal text-muted-foreground">({appt.specialization})</span></div>
                                            </div>
                                            <span className={`
                                                px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                                ${appt.status === 'Completed' ? 'bg-green-100 text-green-700' : appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}
                                            `}>
                                                {appt.status}
                                            </span>
                                        </div>

                                        <div className="bg-secondary/30 p-4 rounded-xl mb-4">
                                            <p className="text-sm text-muted-foreground font-medium italic">Reason for visit: "{appt.reason}"</p>
                                        </div>

                                        {appt.status === 'Completed' && (
                                            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                                                <div className="text-xs font-bold text-green-700 uppercase mb-2">Diagnosis</div>
                                                <p className="text-foreground font-medium mb-1">{appt.diagnosis}</p>
                                                <p className="text-sm text-muted-foreground">Rx: {appt.treatment_notes}</p>
                                            </div>
                                        )}

                                        {appt.status === 'Scheduled' && (
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() => handleCancelAppointment(appt.id)}
                                                    className="text-sm text-red-500 hover:text-red-700 hover:underline font-medium"
                                                >
                                                    Cancel Appointment
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="max-w-2xl mx-auto bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 text-center">Update Profile</h2>
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={profileData.fullName}
                                    onChange={e => setProfileData({ ...profileData, fullName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">New Password <span className="text-muted-foreground font-normal">(Optional)</span></label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={profileData.password}
                                    onChange={e => setProfileData({ ...profileData, password: e.target.value })}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                            </div>

                            {msg && (
                                <div className={`p-4 rounded-xl text-center font-medium ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                    {msg.text}
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50">
                                {loading ? 'Saving Changes...' : 'Save Profile'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Integration with other components */}
                {activeTab === 'medications' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <MedicationManager />
                    </div>
                )}

                {activeTab === 'scanner' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <PrescriptionScanner />
                    </div>
                )}

                {activeTab === 'interactions' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <DrugInteractionChecker />
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedDoctor && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                        <div className="p-6 border-b border-border bg-secondary/30">
                            <h2 className="text-xl font-bold">Book Appointment</h2>
                            <p className="text-muted-foreground">with Dr. {selectedDoctor.full_name}</p>
                            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                {selectedDoctor.availability}
                            </div>
                        </div>

                        <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={bookingData.dateTime}
                                    onChange={e => setBookingData({ ...bookingData, dateTime: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-yellow-600 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Please ensure time matches doctor availability.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Reason for Visit</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={bookingData.reason}
                                    onChange={e => setBookingData({ ...bookingData, reason: e.target.value })}
                                    placeholder="e.g. Annual Checkup"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setSelectedDoctor(null)} className="flex-1 py-3 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:bg-primary/90 transition-all">
                                    {loading ? 'Confirming...' : 'Confirm Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
