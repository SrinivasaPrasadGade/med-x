import config from './config';

const apiRequest = async (service, endpoint, options = {}) => {
    const baseUrl = config[`${service.toUpperCase()}_SERVICE_URL`];
    const url = `${baseUrl}${endpoint}`;

    const headers = {
        'Authorization': 'Bearer valid_token',
        ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            let errorMessage = `API Error ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                // Pick the best available error message string
                const rawDetail = errorData.detail || errorData.message || errorData.error;
                errorMessage = typeof rawDetail === 'string' ? rawDetail : JSON.stringify(rawDetail || errorData);
            } catch (e) {
                try {
                    const text = await response.text();
                    if (text) errorMessage = text;
                } catch (e2) { }
            }
            throw new Error(errorMessage);
        }
        return await response.json();
    } catch (error) {
        console.error(`Fetch failure (${service}):`, error);
        if (error instanceof Error) throw error;
        throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
    }
};

export const api = {
    // Patient Service
    getMedications: () => apiRequest('patient', '/medications'),
    addMedication: (data) => apiRequest('patient', '/medications', { method: 'POST', body: JSON.stringify(data) }),
    deleteMedication: (id) => apiRequest('patient', `/medications/${id}`, { method: 'DELETE' }),
    logAdherence: (data) => apiRequest('patient', '/adherence', { method: 'POST', body: JSON.stringify(data) }),

    // AI Service
    analyzeNote: (data) => apiRequest('ai', '/analyze-note', { method: 'POST', body: JSON.stringify(data) }),
    scanPrescription: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiRequest('ai', '/scan-prescription', { method: 'POST', body: formData, headers: {} }); // Content-Type is auto-set for FormData
    },
    checkInteractions: (meds) => apiRequest('ai', '/check-interactions', { method: 'POST', body: JSON.stringify({ medications: meds }) }),
    deIdentify: (data) => apiRequest('ai', '/de-identify', { method: 'POST', body: JSON.stringify(data) }),
    generateCoaching: (context) => apiRequest('ai', '/generate-coaching', { method: 'POST', body: JSON.stringify(context) }),

    // Audit Logs
    getAuditLogs: () => apiRequest('ai', '/audit-log'),

    // Auth
    register: (data) => apiRequest('patient', '/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => apiRequest('patient', '/login', { method: 'POST', body: JSON.stringify(data) }),

    // Organization Management
    // Organization Management
    registerOrg: (data) => apiRequest('patient', '/org/register', { method: 'POST', body: JSON.stringify(data) }),
    // Doctor Management
    addDoctor: (data) => apiRequest('patient', '/org/doctors', { method: 'POST', body: JSON.stringify(data) }),
    getDoctors: (orgId, search = '') => apiRequest('patient', `/org/doctors?organization_id=${orgId}&search=${encodeURIComponent(search)}`),
    updateDoctor: (id, data) => apiRequest('patient', `/org/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteDoctor: (id) => apiRequest('patient', `/org/doctors/${id}`, { method: 'DELETE' }),

    // Appointment Management
    getAppointments: (orgId) => apiRequest('patient', `/org/appointments?organization_id=${orgId}`),
    createAppointment: (data) => apiRequest('patient', '/org/appointments', { method: 'POST', body: JSON.stringify(data) }),
    updateAppointment: (id, data) => apiRequest('patient', `/org/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    // Doctor Portal
    getDoctorAppointments: (doctorId) => apiRequest('patient', `/doctor/appointments?doctor_id=${doctorId}`),
    completeAppointment: (id, data) => apiRequest('patient', `/doctor/appointments/${id}/complete`, { method: 'PUT', body: JSON.stringify(data) }),
    getPatientHistory: (name) => apiRequest('patient', `/doctor/patients/${encodeURIComponent(name)}/history`),

    // Patient Portal
    getAllDoctors: (specialization = '') => apiRequest('patient', `/doctors?specialization=${encodeURIComponent(specialization)}`),
    getMyAppointments: (patientId) => apiRequest('patient', `/patient/appointments?patient_id=${patientId}`),
    bookAppointment: (data) => apiRequest('patient', '/patient/appointments', { method: 'POST', body: JSON.stringify(data) }),
    cancelMyAppointment: (apptId) => apiRequest('patient', `/patient/appointments/${apptId}/cancel`, { method: 'PUT' }),
    updateProfile: (patientId, data) => apiRequest('patient', `/patient/profile?patient_id=${patientId}`, { method: 'PUT', body: JSON.stringify(data) }),

    // Health checks
    checkHealth: (service) => apiRequest(service, '/health').catch(() => ({ status: 'error' })),
};

