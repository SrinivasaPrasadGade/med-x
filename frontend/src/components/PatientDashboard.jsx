import React, { useState, useEffect } from 'react';
import { api } from '../api';
import DrugInteractionChecker from './DrugInteractionChecker';
import MedicationManager from './MedicationManager';
import DocumentManager from './DocumentManager';
import PrescriptionScanner from './PrescriptionScanner';
import { Search, MapPin, Star, Calendar, Clock, FileText, AlertTriangle, CheckCircle, XCircle, User, Shield, Phone, Activity } from 'lucide-react';

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
        minRating: 0,
        gender: ''
    });
    const [apptTab, setApptTab] = useState('upcoming');
    const [selectedDoctor, setSelectedDoctor] = useState(null); // For booking modal
    const [bookingData, setBookingData] = useState({ date: '', time: '', reason: '' });

    // My Health State
    const [appointments, setAppointments] = useState([]);

    // Profile State
    const [profileData, setProfileData] = useState({ 
        fullName: user.user_name || '', 
        email: user.email || '',
        medx_id: user.medx_id || '-',
        profilePhoto: user.profile_photo_url || null,
        dob: user.dob || '',
        gender: user.gender || '',
        bloodType: user.blood_type || '',
        contactNumber: user.contact_number || '',
        emergencyContact: user.emergency_contact || '',
        address: user.address || '',
        allergies: user.allergies || '',
        medicalHistory: user.medical_history || '',
        password: '' 
    });

    useEffect(() => {
        setMsg(null); // Clear messages on tab change
        if (activeTab === 'findCare') {
            loadDoctors();
        } else if (activeTab === 'appointments') {
            loadAppointments();
        } else if (activeTab === 'profile') {
            loadProfile();
        }
    }, [activeTab]);

    const loadProfile = async () => {
        try {
            const data = await api.getPatientProfile(user.user_id);
            setProfileData(prev => ({
                ...prev,
                fullName: data.full_name || '',
                email: data.email || '',
                medx_id: data.medx_id || '-',
                profilePhoto: data.profile_photo_url || null,
                dob: data.dob || '',
                gender: data.gender || '',
                bloodType: data.blood_type || '',
                contactNumber: data.contact_number || '',
                emergencyContact: data.emergency_contact || '',
                address: data.address || '',
                allergies: data.allergies || '',
                medicalHistory: data.medical_history || '',
                password: ''
            }));
        } catch (e) {
            console.error("Failed to load profile", e);
        }
    };

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
                date_time: `${bookingData.date}T${bookingData.time}`,
                reason: bookingData.reason
            });
            setMsg({ type: 'success', text: 'Appointment booked successfully!' });
            setBookingData({ date: '', time: '', reason: '' });
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
                password: profileData.password || undefined,
                dob: profileData.dob || undefined,
                gender: profileData.gender || undefined,
                blood_type: profileData.bloodType || undefined,
                contact_number: profileData.contactNumber || undefined,
                emergency_contact: profileData.emergencyContact || undefined,
                address: profileData.address || undefined,
                allergies: profileData.allergies || undefined,
                medical_history: profileData.medicalHistory || undefined,
                profile_photo_url: profileData.profilePhoto || undefined
            });
            setMsg({ type: 'success', text: 'Profile updated successfully!' });
            setUser({ ...user, user_name: profileData.fullName });
            loadProfile();
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
                    { id: 'scanner', label: 'Scanner Doc', icon: '🖨️' },
                    { id: 'interactions', label: 'Drug Safety', icon: '🛡️' },
                    { id: 'documents', label: 'Documents', icon: '📂' },
                    { id: 'profile', label: 'Profile', icon: '👤' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap border ${activeTab === tab.id ? 'bg-white text-primary border-primary/20 shadow-sm' : 'bg-transparent text-muted-foreground border-transparent hover:bg-secondary/50'}`}
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
                                const genderMatch = filters.gender ? doc.gender === filters.gender : true;
                                return nameMatch && specMatch && hospitalMatch && ratingMatch && genderMatch;
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
                                        <select
                                            className="w-full px-4 py-2.5 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={filters.gender}
                                            onChange={e => setFilters({ ...filters, gender: e.target.value })}
                                        >
                                            <option value="">Any Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
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

                {activeTab === 'appointments' && (() => {
                    const upcomingApps = appointments.filter(a => a.status === 'Scheduled');
                    const pastApps = appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled');
                    const displayedApps = apptTab === 'upcoming' ? upcomingApps : pastApps;

                    return (
                        <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 p-6 md:p-8 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                <h2 className="text-2xl font-bold">My Appointments</h2>
                                <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl w-fit">
                                    <button 
                                        onClick={() => setApptTab('upcoming')} 
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${apptTab === 'upcoming' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Upcoming
                                    </button>
                                    <button 
                                        onClick={() => setApptTab('past')} 
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${apptTab === 'past' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Past
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {displayedApps.length === 0 ? (
                                    <p className="text-center py-12 text-muted-foreground">No {apptTab} appointments found.</p>
                                ) : (
                                    displayedApps.map(appt => (
                                        <div key={appt.id} className={`bg-white p-6 rounded-2xl border-l-[6px] shadow-sm relative overflow-hidden ${appt.status === 'Completed' ? 'border-l-green-500' : appt.status === 'Cancelled' ? 'border-l-red-500' : 'border-l-blue-500'}`}>
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                                        <span className="font-semibold text-foreground">{new Date(appt.date_time).toLocaleString()}</span>
                                                    </div>
                                                    <div className="text-lg font-bold text-foreground">Dr. {appt.doctor_name} <span className="text-sm font-normal text-muted-foreground">({appt.specialization})</span></div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${appt.status === 'Completed' ? 'bg-green-100 text-green-700' : appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
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

                                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border/50">
                                                {appt.status === 'Scheduled' && (
                                                    <button
                                                        onClick={() => handleCancelAppointment(appt.id)}
                                                        className="text-sm text-red-500 hover:text-red-700 hover:underline font-medium"
                                                    >
                                                        Cancel Appointment
                                                    </button>
                                                )}
                                                {(appt.status === 'Completed' || appt.status === 'Cancelled') && (
                                                    <button
                                                        onClick={() => setSelectedDoctor({
                                                            id: appt.doctor_id,
                                                            organization_id: appt.organization_id,
                                                            full_name: appt.doctor_name,
                                                            specialization: appt.specialization,
                                                            availability: 'Unknown'
                                                        })}
                                                        className="px-4 py-2 bg-secondary text-foreground text-sm font-semibold rounded-lg hover:bg-primary hover:text-white transition-all"
                                                    >
                                                        Book Again
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })()}

                {activeTab === 'profile' && (
                    <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-border/50 p-8 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-8 items-start mb-10 border-b border-border pb-8">
                            <div className="flex-shrink-0 relative group cursor-pointer inline-block">
                                <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-secondary flex items-center justify-center relative">
                                    {profileData.profilePhoto ? (
                                        <img src={profileData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-primary/50" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-bold">Edit Photo</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 mt-2">
                                <h2 className="text-3xl font-bold text-foreground mb-2">{profileData.fullName}</h2>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                    <Shield className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-bold text-primary tracking-wide">MedX ID: {profileData.medx_id}</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-8">
                            {/* Personal Details */}
                            <div>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><User className="text-blue-500 w-5 h-5"/> Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary/20 p-6 rounded-2xl">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={profileData.fullName}
                                            onChange={e => setProfileData({ ...profileData, fullName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent text-muted-foreground cursor-not-allowed"
                                            value={profileData.email}
                                            readOnly
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={profileData.dob}
                                            onChange={e => setProfileData({ ...profileData, dob: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Gender</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={profileData.gender}
                                            onChange={e => setProfileData({ ...profileData, gender: e.target.value })}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Phone className="text-green-500 w-5 h-5"/> Contact Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary/20 p-6 rounded-2xl">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={profileData.contactNumber}
                                            onChange={e => setProfileData({ ...profileData, contactNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground ml-1 flex justify-between items-center">
                                            Emergency Contact <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Critical</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Name - Phone"
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                                            value={profileData.emergencyContact}
                                            onChange={e => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold text-muted-foreground">Residential Address</label>
                                        <textarea
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                            rows="2"
                                            value={profileData.address}
                                            onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Profile */}
                            <div>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity className="text-purple-500 w-5 h-5"/> Medical Profile</h3>
                                <div className="grid grid-cols-1 gap-6 bg-secondary/20 p-6 rounded-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground">Blood Type</label>
                                            <select
                                                className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 outline-none"
                                                value={profileData.bloodType}
                                                onChange={e => setProfileData({ ...profileData, bloodType: e.target.value })}
                                            >
                                                <option value="">Select</option>
                                                <option value="A+">A+</option><option value="A-">A-</option>
                                                <option value="B+">B+</option><option value="B-">B-</option>
                                                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                                <option value="O+">O+</option><option value="O-">O-</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground">Known Allergies</label>
                                            <input
                                                type="text"
                                                placeholder="Peanuts, Penicillin..."
                                                className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 outline-none"
                                                value={profileData.allergies}
                                                onChange={e => setProfileData({ ...profileData, allergies: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Past Medical History (Conditions, Surgeries)</label>
                                        <textarea
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                            rows="3"
                                            placeholder="Detail significant medical history..."
                                            value={profileData.medicalHistory}
                                            onChange={e => setProfileData({ ...profileData, medicalHistory: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Security */}
                            <div>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">Security</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary/20 p-6 rounded-2xl">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-muted-foreground">Reset Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={profileData.password}
                                            onChange={e => setProfileData({ ...profileData, password: e.target.value })}
                                            placeholder="Enter new password to change..."
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>
                            </div>

                            {msg && (
                                <div className={`p-4 rounded-xl text-center font-bold ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                    {msg.text}
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={loading} className="px-8 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2">
                                    {loading ? 'Saving Changes...' : 'Save Profile Details'}
                                </button>
                            </div>
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

                {activeTab === 'documents' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4">
                        <DocumentManager user={user} />
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
                            <div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground">Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={bookingData.date}
                                            onChange={e => setBookingData({ ...bookingData, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground">Time</label>
                                        <input
                                            type="time"
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={bookingData.time}
                                            onChange={e => setBookingData({ ...bookingData, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-yellow-600 flex items-center gap-1 mt-2">
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
