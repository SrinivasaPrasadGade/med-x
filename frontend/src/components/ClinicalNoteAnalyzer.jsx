import { useState } from 'react'
import { api } from '../api'

export default function ClinicalNoteAnalyzer() {
    const [formData, setFormData] = useState({
        patientId: '',
        noteText: '',
        noteDate: ''
    })
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const data = await api.analyzeNote({
                patient_id: formData.patientId,
                note_text: formData.noteText,
                note_date: formData.noteDate || null
            })
            setResult(data)
            if (data.extracted_entities?.medications?.length > 0) {
                fetchCoaching(data)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchCoaching = async (analysisData) => {
        try {
            const coachingData = await api.generateCoaching({
                age: 45,
                medications: analysisData.extracted_entities.medications,
                barriers: analysisData.adherence_insights?.barriers_identified || []
            })
            setResult(prev => ({ ...prev, coaching: coachingData.coaching_messages }))
        } catch (err) {
            console.error('Coaching fetch failed:', err)
        }
    }

    const handleDeIdentify = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await api.deIdentify({
                patient_id: formData.patientId,
                note_text: formData.noteText
            })
            setResult(prev => ({ ...prev, deIdentifiedText: data.de_identified_text }))
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fade-in" style={{ paddingBottom: '4rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'left' }}>
            <div className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="page-title">Clinical Note Analyzer</h1>
                <p className="page-description" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    Extract medical entities, conditions, medications, and generate FHIR resources from clinical notes
                </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <form onSubmit={handleSubmit} className="form-container">
                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="patientId" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Patient ID *</label>
                            <input
                                id="patientId"
                                type="text"
                                required
                                placeholder="e.g., PT-12345"
                                value={formData.patientId}
                                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    backgroundColor: 'white',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="noteDate" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Note Date</label>
                            <input
                                id="noteDate"
                                type="date"
                                value={formData.noteDate}
                                onChange={(e) => setFormData({ ...formData, noteDate: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    backgroundColor: 'white',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label htmlFor="noteText" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Clinical Note *</label>
                        <textarea
                            id="noteText"
                            required
                            placeholder="Enter clinical note text here... 

Example:
Patient presents with chest pain and shortness of breath. History of hypertension. 
Prescribed Lisinopril 10mg daily and Aspirin 81mg daily."
                            value={formData.noteText}
                            onChange={(e) => setFormData({ ...formData, noteText: e.target.value })}
                            style={{
                                width: '100%',
                                minHeight: '200px',
                                padding: '1rem',
                                borderRadius: '16px',
                                border: '1px solid #e5e7eb',
                                backgroundColor: 'white',
                                fontSize: '1rem',
                                lineHeight: '1.6',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {loading ? 'Processing...' : <><span style={{ fontSize: '1.2em' }}>🔍</span> Analyze Clinical Note</>}
                        </button>

                        <button
                            type="button"
                            onClick={handleDeIdentify}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '999px',
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            disabled={loading || !formData.noteText}
                        >
                            <span style={{ fontSize: '1.2em' }}>🛡️</span> De-identify (HIPAA)
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="error-message" style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        borderRadius: '12px',
                        backgroundColor: '#FEE2E2',
                        color: '#991B1B',
                        border: '1px solid #FECACA'
                    }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {result && (
                    <div className="result-section fade-in" style={{ marginTop: '3rem', textAlign: 'left' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem', display: 'inline-block' }}>Analysis Results</h3>

                        {/* Clinical Summary */}
                        {result.clinical_summary && (
                            <div style={{
                                padding: '1.5rem',
                                marginBottom: '2rem',
                                background: '#EFF6FF',
                                border: '1px solid #DBEAFE',
                                borderRadius: '16px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>📋</span>
                                    <h4 style={{ margin: 0, color: '#1E40AF', fontSize: '1.1rem' }}>Professional Summary</h4>
                                </div>
                                <p style={{ lineHeight: '1.6', color: '#1F2937', fontSize: '1.05rem', margin: 0 }}>
                                    {result.clinical_summary}
                                </p>
                            </div>
                        )}

                        {/* Extracted Entities */}
                        {result.extracted_entities && (
                            <div style={{ marginBottom: '3rem' }}>
                                <h4 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Medical Intelligence Extracted</h4>

                                {/* Conditions */}
                                {result.extracted_entities.conditions?.length > 0 && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h5 style={{ color: '#6B7280', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Conditions</h5>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                            {result.extracted_entities.conditions.map((cond, i) => (
                                                <div key={i} style={{
                                                    padding: '1rem',
                                                    background: 'white',
                                                    border: '1px solid #E5E7EB',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                        <strong style={{ fontSize: '1.1rem' }}>{cond.clinical_text}</strong>
                                                        <span className="badge" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>{cond.confidence}%</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                                                        <span style={{ fontWeight: 600 }}>ICD-10:</span> {cond.icd_10} &bull; <span style={{ textTransform: 'capitalize' }}>{cond.severity}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Medications */}
                                {result.extracted_entities.medications?.length > 0 && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h5 style={{ color: '#6B7280', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Medications</h5>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                            {result.extracted_entities.medications.map((med, i) => (
                                                <div key={i} style={{
                                                    padding: '1rem',
                                                    background: 'white',
                                                    border: '1px solid #E5E7EB',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                        <strong style={{ fontSize: '1.1rem' }}>{med.drug_name}</strong>
                                                        <span className="badge" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>{med.confidence}%</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                                                        {med.dosage} {med.frequency}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Clinical Validations */}
                        {result.clinical_validations && (
                            <div style={{ marginBottom: '3rem' }}>
                                <h4 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Clinical Validations & Safety</h4>
                                {result.clinical_validations.safety_flags?.yellow_flags?.length > 0 ? (
                                    <div style={{ padding: '1rem', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '12px' }}>
                                        <strong style={{ color: '#92400E', display: 'block', marginBottom: '0.5rem' }}>Warnings:</strong>
                                        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#92400E' }}>
                                            {result.clinical_validations.safety_flags.yellow_flags.map((f, i) => <li key={i}>{f}</li>)}
                                        </ul>
                                    </div>
                                ) : (
                                    <p style={{ color: '#059669', fontStyle: 'italic' }}>No safety flags detected.</p>
                                )}
                            </div>
                        )}

                        {/* Adherence Insights */}
                        {result.adherence_insights && (
                            <div style={{ marginBottom: '3rem' }}>
                                <h4 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Adherence Insights</h4>
                                <div style={{
                                    padding: '1.5rem',
                                    background: 'white',
                                    border: '1px solid #E5E7EB',
                                    borderLeft: '4px solid var(--primary)',
                                    borderRadius: '8px'
                                }}>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        <strong>Complexity Score:</strong> {result.adherence_insights.complexity_score}/5
                                    </p>
                                    {result.adherence_insights.barriers_identified?.length > 0 && (
                                        <p style={{ margin: 0 }}>
                                            <strong>Identified Barriers:</strong> {result.adherence_insights.barriers_identified.join(', ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* FHIR Bundle Visualizer */}
                        {result.fhir_resources && (
                            <div style={{ marginBottom: '3rem' }}>
                                <h4 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>FHIR R4 Interoperability Data</h4>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                    {result.fhir_resources.entry?.map((entry, i) => {
                                        const res = entry.resource;
                                        let icon = '📄';
                                        let title = res.resourceType;
                                        let details = res.id;
                                        let color = '#F3F4F6';
                                        let txColor = '#374151';

                                        // Customize based on Resource Type
                                        if (res.resourceType === 'Condition') {
                                            icon = '🩺';
                                            title = 'Condition';
                                            details = res.code?.text || res.code?.coding?.[0]?.display || 'Unknown Condition';
                                            color = '#FEF2F2'; // Light Red
                                            txColor = '#991B1B';
                                        } else if (res.resourceType === 'MedicationStatement' || res.resourceType === 'MedicationRequest') {
                                            icon = '💊';
                                            title = 'Medication';
                                            details = res.medicationCodeableConcept?.text || res.medicationCodeableConcept?.coding?.[0]?.display || 'Unknown Medication';
                                            color = '#EFF6FF'; // Light Blue
                                            txColor = '#1E40AF';
                                        } else if (res.resourceType === 'Patient') {
                                            icon = '👤';
                                            title = 'Patient';
                                            details = `ID: ${res.id}`;
                                            color = '#F0FDF4'; // Light Green
                                            txColor = '#166534';
                                        } else if (res.resourceType === 'AllergyIntolerance') {
                                            icon = '⚠️';
                                            title = 'Allergy';
                                            details = res.code?.text || 'Unknown Allergy';
                                            color = '#FFFBEB'; // Light Yellow
                                            txColor = '#92400E';
                                        } else if (res.resourceType === 'Observation') {
                                            icon = '🔬';
                                            title = 'Observation';
                                            details = res.code?.text || 'Lab/Vital';
                                            color = '#F5F3FF'; // Light Purple
                                            txColor = '#5B21B6';
                                        }

                                        return (
                                            <div key={i} style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '1rem',
                                                padding: '1rem',
                                                backgroundColor: color,
                                                borderRadius: '12px',
                                                border: '1px solid transparent',
                                                borderColor: color === '#F3F4F6' ? '#E5E7EB' : 'transparent'
                                            }}>
                                                <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{icon}</div>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: txColor, opacity: 0.8, marginBottom: '0.25rem' }}>
                                                        {title}
                                                    </div>
                                                    <div style={{ fontWeight: 600, color: '#1F2937', fontSize: '0.95rem' }}>
                                                        {details}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                                                        ID: {res.id?.slice(0, 8)}...
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <details style={{
                                    background: '#1F2937',
                                    borderRadius: '12px',
                                    overflow: 'hidden'
                                }}>
                                    <summary style={{
                                        padding: '0.75rem 1rem',
                                        cursor: 'pointer',
                                        color: '#D1D5DB',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        userSelect: 'none',
                                        outline: 'none'
                                    }}>
                                        View Raw FHIR JSON
                                    </summary>
                                    <div style={{
                                        padding: '1rem',
                                        borderTop: '1px solid #374151',
                                        overflowX: 'auto'
                                    }}>
                                        <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.8rem', color: '#F9FAFB' }}>
                                            {JSON.stringify(result.fhir_resources, null, 2)}
                                        </pre>
                                    </div>
                                </details>
                            </div>
                        )}

                        {/* De-identified Text */}
                        {result.deIdentifiedText && (
                            <div style={{ marginBottom: '3rem' }}>
                                <h4 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>De-identified Note (HIPAA Safe Harbor)</h4>
                                <div style={{
                                    padding: '1.5rem',
                                    background: '#F0FDF4',
                                    border: '1px solid #BBF7D0',
                                    borderRadius: '12px',
                                    color: '#166534'
                                }}>
                                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '1rem', margin: 0 }}>
                                        {result.deIdentifiedText}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Adherence Coaching */}
                        {result.coaching && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Personalized Patient Coaching</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {result.coaching.map((card, i) => (
                                        <div key={i} style={{
                                            padding: '1.5rem',
                                            background: 'white',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '16px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                            borderLeft: `5px solid ${card.importance === 'high' ? '#EF4444' : '#F59E0B'}`
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <span style={{ fontWeight: 700, color: '#1F2937', fontSize: '1.1rem' }}>
                                                    {card.medication}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '999px',
                                                    backgroundColor: card.importance === 'high' ? '#FEE2E2' : '#FEF3C7',
                                                    color: card.importance === 'high' ? '#991B1B' : '#92400E'
                                                }}>
                                                    {card.importance.toUpperCase()} PRIORITY
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.95rem', color: '#4B5563', marginBottom: '1rem', lineHeight: 1.5 }}>
                                                {card.message}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                                                <span>🕒</span> {card.timing}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
