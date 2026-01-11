import { useState } from 'react'
import { api } from '../api'
import { FileText, Search, Shield, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Activity, Info, FileJson } from 'lucide-react'

export default function ClinicalNoteAnalyzer() {
    const [formData, setFormData] = useState({
        patientId: '',
        noteText: '',
        noteDate: ''
    })
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showRawFhir, setShowRawFhir] = useState(false);

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
        <div className="animate-fade-in max-w-5xl mx-auto pb-16">
            <div className="text-center mb-10 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Clinical Note Analyzer</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Extract medical entities, conditions, medications, and generate FHIR resources from clinical notes using advanced AI.
                </p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 p-6 md:p-8 shadow-sm mb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="patientId" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                Patient ID <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    id="patientId"
                                    type="text"
                                    required
                                    placeholder="e.g., PT-12345"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    value={formData.patientId}
                                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="noteDate" className="text-sm font-semibold text-foreground">Note Date</label>
                            <input
                                id="noteDate"
                                type="date"
                                className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.noteDate}
                                onChange={(e) => setFormData({ ...formData, noteDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="noteText" className="text-sm font-semibold text-foreground flex items-center gap-2">
                            Clinical Note <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="noteText"
                            required
                            placeholder="Enter clinical note text here...&#10;Example: Patient presents with chest pain..."
                            className="w-full h-48 px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-base leading-relaxed"
                            value={formData.noteText}
                            onChange={(e) => setFormData({ ...formData, noteText: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="animate-spin text-xl">⟳</div> : <Search className="w-5 h-5" />}
                            {loading ? 'Analyzing...' : 'Analyze Clinical Note'}
                        </button>

                        <button
                            type="button"
                            onClick={handleDeIdentify}
                            disabled={loading || !formData.noteText}
                            className="px-8 py-3 bg-white border border-border text-foreground font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Shield className="w-5 h-5" /> De-identify (HIPAA)
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold block">Error Processing Note</strong>
                            <p>{error}</p>
                        </div>
                    </div>
                )}
            </div>

            {result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="flex items-center gap-4 border-b border-border pb-4">
                        <h2 className="text-2xl font-bold text-foreground">Analysis Results</h2>
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide">
                            AI Processing Complete
                        </span>
                    </div>

                    {/* Clinical Summary */}
                    {result.clinical_summary && (
                        <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="w-5 h-5 text-blue-700" />
                                <h3 className="text-lg font-bold text-blue-800">Professional Summary</h3>
                            </div>
                            <p className="text-blue-900 leading-relaxed text-lg">
                                {result.clinical_summary}
                            </p>
                        </div>
                    )}

                    {/* Extracted Entities */}
                    {result.extracted_entities && (
                        <div className="space-y-6">
                            {/* Conditions */}
                            {result.extracted_entities.conditions?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Conditions identified</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {result.extracted_entities.conditions.map((cond, i) => (
                                            <div key={i} className="bg-white p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <strong className="text-lg font-semibold text-foreground">{cond.clinical_text}</strong>
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">
                                                        {cond.confidence}%
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground flex flex-col gap-1">
                                                    <span>ICD-10: <span className="font-mono text-foreground bg-gray-100 px-1 rounded">{cond.icd_10}</span></span>
                                                    <span className="capitalize text-yellow-600 font-medium">{cond.severity}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Medications */}
                            {result.extracted_entities.medications?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Medications identified</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {result.extracted_entities.medications.map((med, i) => (
                                            <div key={i} className="bg-white p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <strong className="text-lg font-semibold text-foreground">{med.drug_name}</strong>
                                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">
                                                        {med.confidence}%
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {med.dosage} • {med.frequency}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Safety Flags */}
                    {result.clinical_validations && (
                        <div>
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Clinical Safety</h4>
                            {result.clinical_validations.safety_flags?.yellow_flags?.length > 0 ? (
                                <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
                                    <div className="flex items-center gap-2 mb-2 text-yellow-800 font-bold">
                                        <AlertTriangle className="w-5 h-5" /> Safety Warnings Detected
                                    </div>
                                    <ul className="list-disc list-inside text-yellow-900 space-y-1 ml-1">
                                        {result.clinical_validations.safety_flags.yellow_flags.map((f, i) => (
                                            <li key={i}>{f}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="bg-green-50 rounded-xl border border-green-200 p-4 flex items-center gap-3 text-green-800 font-medium">
                                    <CheckCircle className="w-5 h-5" /> No safety flags detected.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Adherence Insights */}
                    {result.adherence_insights && (
                        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" /> Adherence Insights
                            </h4>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground font-medium mb-1">Regimen Complexity</div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500 to-red-500"
                                                style={{ width: `${(result.adherence_insights.complexity_score / 5) * 100}%` }}
                                            />
                                        </div>
                                        <span className="font-bold text-foreground">{result.adherence_insights.complexity_score}/5</span>
                                    </div>
                                </div>
                                {result.adherence_insights.barriers_identified?.length > 0 && (
                                    <div className="bg-secondary/30 rounded-xl p-4">
                                        <div className="text-sm font-bold text-foreground mb-2">Identified Barriers</div>
                                        <div className="flex flex-wrap gap-2">
                                            {result.adherence_insights.barriers_identified.map((b, i) => (
                                                <span key={i} className="px-3 py-1 rounded-lg bg-white border border-border text-sm font-medium text-muted-foreground">
                                                    {b}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* FHIR Bundle */}
                    {result.fhir_resources && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold flex items-center gap-2">
                                <FileJson className="w-5 h-5 text-primary" /> FHIR Interoperability Data
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {result.fhir_resources.entry?.map((entry, i) => {
                                    const res = entry.resource;
                                    let typeConfig = { icon: '📄', color: 'bg-gray-100 text-gray-800', border: 'border-gray-200' };

                                    if (res.resourceType === 'Condition') typeConfig = { icon: '🩺', color: 'bg-red-50 text-red-900', border: 'border-red-100' };
                                    else if (['MedicationStatement', 'MedicationRequest'].includes(res.resourceType)) typeConfig = { icon: '💊', color: 'bg-blue-50 text-blue-900', border: 'border-blue-100' };
                                    else if (res.resourceType === 'Patient') typeConfig = { icon: '👤', color: 'bg-green-50 text-green-900', border: 'border-green-100' };
                                    else if (res.resourceType === 'AllergyIntolerance') typeConfig = { icon: '⚠️', color: 'bg-yellow-50 text-yellow-900', border: 'border-yellow-100' };

                                    return (
                                        <div key={i} className={`p-4 rounded-xl border ${typeConfig.color} ${typeConfig.border} flex items-start gap-3`}>
                                            <span className="text-2xl">{typeConfig.icon}</span>
                                            <div className="overflow-hidden">
                                                <div className="text-xs font-bold uppercase opacity-70 mb-0.5">{res.resourceType}</div>
                                                <div className="font-semibold truncate">
                                                    {res.code?.text || res.medicationCodeableConcept?.text || (res.resourceType === 'Patient' ? `ID: ${res.id}` : 'N/A')}
                                                </div>
                                                <div className="text-xs opacity-60 font-mono mt-1 truncate">ID: {res.id}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setShowRawFhir(!showRawFhir)}
                                className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                                {showRawFhir ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                {showRawFhir ? 'Hide Raw JSON' : 'View Raw FHIR JSON'}
                            </button>

                            {showRawFhir && (
                                <div className="bg-gray-900 rounded-xl p-6 overflow-hidden">
                                    <div className="flex items-start gap-3 mb-4 p-4 rounded-lg bg-blue-900/20 border border-blue-500/20 text-blue-200 text-sm">
                                        <Info className="w-5 h-5 flex-shrink-0 text-blue-400" />
                                        <div>
                                            <strong className="text-blue-400 block mb-1">About FHIR R4</strong>
                                            This is the standard code used by hospitals and health apps to exchange patient data safely and accurately.
                                        </div>
                                    </div>
                                    <pre className="text-xs font-mono text-gray-300 overflow-x-auto custom-scrollbar">
                                        {JSON.stringify(result.fhir_resources, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    {/* De-identified Text */}
                    {result.deIdentifiedText && (
                        <div className="bg-green-50 rounded-2xl border border-green-100 p-6">
                            <h4 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5" /> De-identified Note
                            </h4>
                            <pre className="whitespace-pre-wrap font-sans text-green-900 bg-transparent">
                                {result.deIdentifiedText}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
