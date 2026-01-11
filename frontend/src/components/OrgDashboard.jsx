import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Search, Plus, Trash2, Edit2, UserPlus, Calendar, Mail, User, Clock, CheckCircle, AlertTriangle, XCircle, Grid, Briefcase } from 'lucide-react';

export default function OrgDashboard({ user }) {
    const [activeTab, setActiveTab] = useState('doctors'); // 'doctors' or 'appointments'

    // Doctor State
    const [doctors, setDoctors] = useState([]);
    const [search, setSearch] = useState('');
    const [newDoc, setNewDoc] = useState({ fullName: '', email: '', password: '', specialization: '', availability: '' });
    const [editingDoc, setEditingDoc] = useState(null); // If set, showing edit modal

    // Appointment State
    const [appointments, setAppointments] = useState([]);
    const [newAppt, setNewAppt] = useState({ doctorId: '', patientName: '', dateTime: '', reason: '' });

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        loadDoctors();
        loadAppointments();
    }, [search]); // Reload doctors on search change

    const loadDoctors = async () => {
        try {
            const data = await api.getDoctors(user.organization_id, search);
            setDoctors(data);
        } catch (e) {
            console.error("Failed to load doctors", e);
        }
    };

    const loadAppointments = async () => {
        try {
            const data = await api.getAppointments(user.organization_id);
            setAppointments(data);
        } catch (e) {
            console.error("Failed to load appointments", e);
        }
    };

    // --- Doctor Actions ---
    const handleAddDoctor = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        try {
            await api.addDoctor({
                email: newDoc.email,
                password: newDoc.password,
                full_name: newDoc.fullName,
                specialization: newDoc.specialization,
                availability: newDoc.availability,
                organization_id: user.organization_id
            });
            setMsg({ type: 'success', text: 'Doctor added successfully!' });
            setNewDoc({ fullName: '', email: '', password: '', specialization: '', availability: '' });
            loadDoctors();
        } catch (e) {
            setMsg({ type: 'error', text: e.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDoctor = async (id) => {
        if (!confirm('Are you sure you want to remove this doctor?')) return;
        try {
            await api.deleteDoctor(id);
            loadDoctors();
        } catch (e) {
            alert(e.message);
        }
    };

    const handleUpdateDoctor = async (e) => {
        e.preventDefault();
        try {
            await api.updateDoctor(editingDoc.id, {
                full_name: editingDoc.full_name,
                specialization: editingDoc.specialization,
                availability: editingDoc.availability
            });
            setEditingDoc(null);
            loadDoctors();
        } catch (e) {
            alert(e.message);
        }
    };

    // --- Appointment Actions ---
    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        try {
            await api.createAppointment({
                doctor_id: parseInt(newAppt.doctorId),
                organization_id: user.organization_id,
                patient_name: newAppt.patientName,
                date_time: newAppt.dateTime,
                reason: newAppt.reason
            });
            setMsg({ type: 'success', text: 'Appointment scheduled!' });
            setNewAppt({ doctorId: '', patientName: '', dateTime: '', reason: '' });
            loadAppointments();
        } catch (e) {
            setMsg({ type: 'error', text: e.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateApptStatus = async (id, status) => {
        try {
            await api.updateAppointment(id, { status });
            loadAppointments();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        {user.organization_name} <span className="text-secondary-foreground text-sm font-bold uppercase px-3 py-1 bg-secondary rounded-full tracking-wider">Manager</span>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Comprehensive practice management dashboard.
                    </p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Search doctors..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Sub-Navigation */}
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                {[
                    { id: 'doctors', label: 'Medical Staff', icon: User },
                    { id: 'appointments', label: 'Appointments', icon: Calendar }
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
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[500px]">
                {activeTab === 'doctors' ? (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Doctor List */}
                        <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 p-6 md:p-8 shadow-sm h-fit">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold flex items-center gap-2">
                                    Staff Directory
                                    <span className="bg-primary/10 text-primary text-sm font-bold px-2 py-1 rounded-full">{doctors.length}</span>
                                </h3>
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {doctors.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-2xl">
                                        <p>No doctors found. Add one to get started.</p>
                                    </div>
                                ) : (
                                    doctors.map(doc => (
                                        <div key={doc.id} className="bg-white p-4 rounded-2xl border border-border shadow-sm flex justify-between items-start group hover:border-primary/30 transition-all">
                                            <div>
                                                <h4 className="font-bold text-foreground text-lg">{doc.full_name}</h4>
                                                <div className="text-secondary-foreground font-medium text-sm mb-1">{doc.specialization || 'General Practice'}</div>
                                                <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-2">
                                                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {doc.email}</span>
                                                    {doc.availability && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {doc.availability}</span>}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingDoc(doc)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteDoctor(doc.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Add Doctor Form */}
                        <div className="bg-white rounded-3xl border border-border p-6 md:p-8 shadow-sm h-fit sticky top-6">
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <UserPlus className="w-6 h-6 text-primary" /> Register New Doctor
                            </h3>
                            <form onSubmit={handleAddDoctor} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground">Full Name</label>
                                        <input
                                            className="w-full px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                            value={newDoc.fullName}
                                            onChange={e => setNewDoc({ ...newDoc, fullName: e.target.value })}
                                            required
                                            placeholder="Dr. Jane Smith"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground">Specialization</label>
                                        <input
                                            className="w-full px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                            value={newDoc.specialization}
                                            onChange={e => setNewDoc({ ...newDoc, specialization: e.target.value })}
                                            placeholder="Cardiology"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        value={newDoc.email}
                                        onChange={e => setNewDoc({ ...newDoc, email: e.target.value })}
                                        required
                                        placeholder="doctor@healthbridge.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Availability</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        value={newDoc.availability}
                                        onChange={e => setNewDoc({ ...newDoc, availability: e.target.value })}
                                        placeholder="Mon-Fri, 9am - 5pm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Temporary Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        value={newDoc.password}
                                        onChange={e => setNewDoc({ ...newDoc, password: e.target.value })}
                                        required
                                        placeholder="••••••••"
                                    />
                                </div>

                                {msg && (
                                    <div className={`p-4 rounded-xl text-center text-sm font-medium ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                        {msg.text}
                                    </div>
                                )}

                                <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-lg hover:bg-primary/90 transition-all">
                                    {loading ? 'Processing...' : 'Add Doctor'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Appointment List */}
                        <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 p-6 md:p-8 shadow-sm h-fit">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold">Appointments</h3>
                                <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full">
                                    {appointments.filter(a => a.status === 'Scheduled').length} Upcoming
                                </span>
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {appointments.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-2xl">
                                        <p>No appointments scheduled.</p>
                                    </div>
                                ) : (
                                    appointments.map(appt => (
                                        <div key={appt.id} className={`
                                            bg-white p-5 rounded-2xl border-l-[6px] shadow-sm relative overflow-hidden transition-all
                                             ${appt.status === 'Completed' ? 'border-l-green-500 opacity-75' : appt.status === 'Cancelled' ? 'border-l-red-500 opacity-60' : 'border-l-yellow-500'}
                                        `}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-foreground text-lg">{new Date(appt.date_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                                    <div className="font-medium text-primary">{appt.patient_name}</div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${appt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                        appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {appt.status}
                                                </span>
                                            </div>

                                            <div className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                                                <Briefcase className="w-3.5 h-3.5" /> w/ Dr. {appt.doctor_name}
                                            </div>

                                            {appt.reason && (
                                                <div className="bg-secondary/30 p-3 rounded-lg text-sm text-foreground italic mb-3">
                                                    "{appt.reason}"
                                                </div>
                                            )}

                                            {appt.status === 'Scheduled' && (
                                                <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                                                    <button
                                                        onClick={() => handleUpdateApptStatus(appt.id, 'Completed')}
                                                        className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                                                    >
                                                        <CheckCircle className="w-3 h-3" /> Complete
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateApptStatus(appt.id, 'Cancelled')}
                                                        className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                                                    >
                                                        <XCircle className="w-3 h-3" /> Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Create Appointment Form */}
                        <div className="bg-white rounded-3xl border border-border p-6 md:p-8 shadow-sm h-fit sticky top-6">
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Calendar className="w-6 h-6 text-primary" /> Schedule Visit
                            </h3>
                            <form onSubmit={handleCreateAppointment} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Patient Name</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        value={newAppt.patientName}
                                        onChange={e => setNewAppt({ ...newAppt, patientName: e.target.value })}
                                        required
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Select Doctor</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        value={newAppt.doctorId}
                                        onChange={e => setNewAppt({ ...newAppt, doctorId: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Choose Doctor --</option>
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.full_name} ({d.specialization || 'GP'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        value={newAppt.dateTime}
                                        onChange={e => setNewAppt({ ...newAppt, dateTime: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">Reason for Visit</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        value={newAppt.reason}
                                        onChange={e => setNewAppt({ ...newAppt, reason: e.target.value })}
                                        placeholder="Checkup, Symptoms..."
                                        required
                                    />
                                </div>

                                {msg && (
                                    <div className={`p-4 rounded-xl text-center text-sm font-medium ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                        {msg.text}
                                    </div>
                                )}

                                <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-lg hover:bg-primary/90 transition-all">
                                    {loading ? 'Scheduling...' : 'Confirm Booking'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Doctor Modal */}
            {editingDoc && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border bg-secondary/30">
                            <h3 className="text-xl font-bold">Edit Profile</h3>
                            <p className="text-muted-foreground">Dr. {editingDoc.full_name}</p>
                        </div>

                        <form onSubmit={handleUpdateDoctor} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Full Name</label>
                                <input
                                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={editingDoc.full_name || ''}
                                    onChange={e => setEditingDoc({ ...editingDoc, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Specialization</label>
                                <input
                                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={editingDoc.specialization || ''}
                                    onChange={e => setEditingDoc({ ...editingDoc, specialization: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Availability</label>
                                <input
                                    className="w-full px-4 py-2.5 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={editingDoc.availability || ''}
                                    onChange={e => setEditingDoc({ ...editingDoc, availability: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setEditingDoc(null)} className="flex-1 py-3 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-lg hover:bg-primary/90 transition-all">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
