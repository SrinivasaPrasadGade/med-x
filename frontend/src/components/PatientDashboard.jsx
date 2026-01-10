import React, { useState, useEffect } from 'react';
import { api } from '../api';
import DrugInteractionChecker from './DrugInteractionChecker';
import MedicationManager from './MedicationManager';
import PrescriptionScanner from './PrescriptionScanner';

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

    // Actions
    // handleSearchDocs removed as filtering is live/client-side now

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
        <div className="fade-in" style={{ padding: '0 0 4rem 0' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-header-title">
                        Welcome, {user.user_name}
                    </h1>
                    <p className="page-header-subtitle">
                        Your personal health command center.
                    </p>
                </div>
            </div>

            <div className="tabs-container" style={{ marginBottom: '2rem', padding: 0 }}>
                <button
                    className={`tab-button ${activeTab === 'findCare' ? 'active' : ''}`}
                    onClick={() => setActiveTab('findCare')}
                >
                    🔍 Find Care
                </button>
                <button
                    className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('appointments')}
                >
                    📅 My Appointments
                </button>
                <button
                    className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
                    onClick={() => setActiveTab('documents')}
                >
                    📂 My Docs
                </button>
                <button
                    className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    👤 Profile
                </button>
                <button
                    className={`tab-button ${activeTab === 'interactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('interactions')}
                >
                    🛡️ Safety Guard
                </button>
                <button
                    className={`tab-button ${activeTab === 'medications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('medications')}
                >
                    💊 My Meds
                </button>
                <button
                    className={`tab-button ${activeTab === 'scanner' ? 'active' : ''}`}
                    onClick={() => setActiveTab('scanner')}
                >
                    📸 Scanner Doc
                </button>
            </div>

            {activeTab === 'findCare' && (
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div className="section-title">Find a Doctor</div>

                    {/* Unique values for dropdowns */}
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
                                <div className="filter-grid" style={{ marginBottom: '2rem' }}>
                                    <div>
                                        <label className="form-label">Search Name</label>
                                        <div className="input-icon-wrapper">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                            </svg>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={filters.search}
                                                onChange={e => setFilters({ ...filters, search: e.target.value })}
                                                placeholder="Dr. Name..."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label">Specialization</label>
                                        <div className="input-icon-wrapper">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                                            </svg>
                                            <select
                                                className="form-select"
                                                value={filters.specialization}
                                                onChange={e => setFilters({ ...filters, specialization: e.target.value })}
                                            >
                                                <option value="">All Specializations</option>
                                                {uniqueSpecs.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label">Hospital</label>
                                        <div className="input-icon-wrapper">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <select
                                                className="form-select"
                                                value={filters.hospital}
                                                onChange={e => setFilters({ ...filters, hospital: e.target.value })}
                                            >
                                                <option value="">All Hospitals</option>
                                                {uniqueHospitals.map(h => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label">Rating</label>
                                        <div className="input-icon-wrapper">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                            </svg>
                                            <select
                                                className="form-select"
                                                value={filters.minRating}
                                                onChange={e => setFilters({ ...filters, minRating: e.target.value })}
                                            >
                                                <option value="0">Any Rating</option>
                                                <option value="3.5">3.5+ ⭐</option>
                                                <option value="4.0">4.0+ ⭐</option>
                                                <option value="4.5">4.5+ ⭐</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-list">
                                    {filteredDoctors.map(doc => (
                                        <div key={doc.id} className="list-item">
                                            <div className="list-item-header">
                                                <div>
                                                    <div className="list-item-title">{doc.full_name}</div>
                                                    <div className="list-item-subtitle">{doc.specialization || 'General Practice'}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--warning)', marginTop: '0.2rem' }}>
                                                        ⭐ {doc.rating} / 5.0
                                                    </div>
                                                </div>
                                                <button
                                                    className="btn-primary"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                                    onClick={() => setSelectedDoctor(doc)}
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                            <div className="list-item-meta">
                                                🏥 {doc.organization_name}
                                            </div>
                                            <div className="list-item-meta">
                                                🕒 {doc.availability || 'Contact for hours'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {filteredDoctors.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No doctors found matching criteria.</p>}
                            </>
                        );
                    })()}
                </div>
            )}

            {activeTab === 'appointments' && (
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 className="section-title">My Appointment History</h3>
                    <div className="card-list">
                        {appointments.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No appointment history.</p>
                        ) : (
                            appointments.map(appt => (
                                <div key={appt.id} className="list-item" style={{
                                    borderLeft: `4px solid ${appt.status === 'Completed' ? 'var(--success)' : appt.status === 'Cancelled' ? 'var(--danger)' : 'var(--primary)'}`
                                }}>
                                    <div className="list-item-header">
                                        <div>
                                            <div className="list-item-title">{new Date(appt.date_time).toLocaleString()}</div>
                                            <div className="list-item-subtitle">Dr. {appt.doctor_name} <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>({appt.specialization})</span></div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span className={`badge badge-${appt.status === 'Completed' ? 'success' : appt.status === 'Cancelled' ? 'error' : 'warning'}`}>
                                                {appt.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="list-item-meta" style={{ fontStyle: 'italic' }}>Reason: "{appt.reason}"</div>

                                    {appt.status === 'Completed' && (
                                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                            <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>DIAGNOSIS</div>
                                            <div style={{ marginBottom: '0.5rem' }}>{appt.diagnosis}</div>
                                            <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Rx Notes: {appt.treatment_notes}</div>
                                        </div>
                                    )}

                                    {appt.status === 'Scheduled' && (
                                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleCancelAppointment(appt.id)}
                                                style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
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

            {activeTab === 'documents' && (
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 className="section-title">My Documents</h3>
                    <div className="card-list">
                        <div className="list-item">
                            <div className="list-item-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🪪</span>
                                    <div>
                                        <div className="list-item-title">Medical Card</div>
                                        <div className="list-item-subtitle">ID: HB-8829-221</div>
                                    </div>
                                </div>
                                <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>View</button>
                            </div>
                        </div>
                        <div className="list-item">
                            <div className="list-item-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                                    <div>
                                        <div className="list-item-title">Insurance Details</div>
                                        <div className="list-item-subtitle">Provider: HealthSure Inc.</div>
                                    </div>
                                </div>
                                <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>View</button>
                            </div>
                            <div className="list-item-meta">Policy #: 99281102 | Valid thru: 12/2026</div>
                        </div>
                        <div className="list-item">
                            <div className="list-item-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📋</span>
                                    <div>
                                        <div className="list-item-title">Previous Illness Record</div>
                                        <div className="list-item-subtitle">Updated: Nov 10, 2025</div>
                                    </div>
                                </div>
                                <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>View</button>
                            </div>
                        </div>
                        <div className="list-item">
                            <div className="list-item-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>💉</span>
                                    <div>
                                        <div className="list-item-title">Vaccination History</div>
                                        <div className="list-item-subtitle">All up to date</div>
                                    </div>
                                </div>
                                <button className="btn-primary" style={{ padding: '0.5rem 1rem' }}>View</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
                    <h3 className="section-title">Edit Profile</h3>
                    <form onSubmit={handleUpdateProfile} className="form-container">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={profileData.fullName}
                                onChange={e => setProfileData({ ...profileData, fullName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password (Optional)</label>
                            <input
                                type="password"
                                value={profileData.password}
                                onChange={e => setProfileData({ ...profileData, password: e.target.value })}
                                placeholder="Leave blank to keep current"
                                autoComplete="new-password"
                            />
                        </div>

                        {msg && (
                            <div className={msg.type === 'error' ? 'error-message' : 'success-message'}>
                                {msg.text}
                            </div>
                        )}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'interactions' && (
                <div className="fade-in">
                    <DrugInteractionChecker />
                </div>
            )}

            {activeTab === 'medications' && (
                <div className="fade-in">
                    <MedicationManager />
                </div>
            )}

            {activeTab === 'scanner' && (
                <div className="fade-in">
                    <PrescriptionScanner />
                </div>
            )}

            {/* Booking Modal */}
            {selectedDoctor && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Book Appointment</h2>
                            <p style={{ color: 'var(--text-dim)' }}>
                                with Dr. {selectedDoctor.full_name}
                            </p>
                            <div className="badge badge-primary" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                                Availability: {selectedDoctor.availability}
                            </div>
                        </div>

                        <form onSubmit={handleBookAppointment} className="form-container">
                            <div className="form-group">
                                <label>Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={bookingData.dateTime}
                                    onChange={e => setBookingData({ ...bookingData, dateTime: e.target.value })}
                                    required
                                />
                                <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '0.25rem' }}>
                                    * Please ensure time matches doctor availability.
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Reason for Visit</label>
                                <input
                                    type="text"
                                    value={bookingData.reason}
                                    onChange={e => setBookingData({ ...bookingData, reason: e.target.value })}
                                    placeholder="e.g. Checkup, Fever"
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setSelectedDoctor(null)} className="tab-button" style={{ flex: 1, border: '1px solid var(--glass-border)' }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
                                    {loading ? 'Booking...' : 'Confirm Booking'}
                                </button>
                            </div>
                        </form>
                        {msg && msg.type === 'error' && (
                            <div className="error-message" style={{ marginTop: '1rem' }}>
                                {msg.text}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
