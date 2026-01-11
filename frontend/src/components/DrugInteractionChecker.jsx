import { useState } from 'react'
import { api } from '../api'
import { Plus, X, Shield, AlertTriangle, CheckCircle, Search, Zap, Info } from 'lucide-react'

export default function DrugInteractionChecker() {
    const [medications, setMedications] = useState(['', '']) // Start with 2 empty fields
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const addMedication = () => {
        setMedications([...medications, ''])
    }

    const removeMedication = (index) => {
        setMedications(medications.filter((_, i) => i !== index))
    }

    const updateMedication = (index, value) => {
        const newMeds = [...medications]
        newMeds[index] = value
        setMedications(newMeds)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const validMeds = medications.filter(med => med.trim())
        if (validMeds.length < 2) {
            setError('Please enter at least 2 medications to check for interactions.')
            return
        }
        setLoading(true)
        setError(null)
        setResult(null)
        try {
            const data = await api.checkInteractions(validMeds)
            setResult(data)

            // Ensure result has at least empty arrays if null (API safety)
            if (!data.interactions) data.interactions = [];
            if (!data.warnings) data.warnings = [];

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const getSeverityStyles = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    }

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-16">
            <div className="text-center mb-10 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Drug Interaction Safety</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Real-time analysis of potential drug-drug interactions, contraindications, and safety warnings.
                </p>
            </div>

            <div className="grid md:grid-cols-5 gap-8">
                {/* Input Section */}
                <div className="md:col-span-2 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 p-6 shadow-sm h-fit">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" /> Active Regimen
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-3">
                            {medications.map((med, index) => (
                                <div key={index} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder={`Medication ${index + 1}`}
                                            className="w-full px-4 py-3 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                            value={med}
                                            onChange={(e) => updateMedication(index, e.target.value)}
                                            autoFocus={index === medications.length - 1 && index > 1} // Auto-focus new fields
                                        />
                                    </div>
                                    {medications.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMedication(index)}
                                            className="p-3 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Remove"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 flex gap-3 flex-wrap">
                            <button
                                type="button"
                                onClick={addMedication}
                                className="flex-1 py-3 px-4 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Plus className="w-4 h-4" /> Add Field
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    setLoading(true)
                                    try {
                                        const meds = await api.getMedications()
                                        if (meds && meds.length > 0) {
                                            setMedications(meds.map(m => m.name))
                                        } else {
                                            setError('No saved medications found.')
                                        }
                                    } catch (e) {
                                        setError('Failed to load medications.')
                                    } finally {
                                        setLoading(false)
                                    }
                                }}
                                className="flex-1 py-3 px-4 bg-blue-50 text-blue-700 font-semibold rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2 text-sm border border-blue-100"
                            >
                                <span className="text-lg">💊</span> Load My Meds
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm min-w-[120px]"
                            >
                                {loading ? 'Checking...' : 'Check Safety'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <div className="md:col-span-3">
                    {result ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-500">
                            {/* Interactions Found */}
                            {result.interactions && result.interactions.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-800 font-bold mb-2">
                                        <AlertTriangle className="w-6 h-6" />
                                        <div>
                                            {result.interactions.length} Interaction{result.interactions.length > 1 ? 's' : ''} Detected
                                            <div className="text-xs font-normal opacity-80 mt-1">Review carefully with a healthcare provider.</div>
                                        </div>
                                    </div>

                                    {result.interactions.map((interaction, index) => (
                                        <div key={index} className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start gap-4">
                                                <h4 className="text-lg font-bold text-foreground flex items-center gap-2 flex-wrap">
                                                    {interaction.drug_a} <Zap className="w-4 h-4 text-amber-500 fill-current" /> {interaction.drug_b}
                                                </h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getSeverityStyles(interaction.severity)}`}>
                                                    {interaction.severity || 'Unknown'}
                                                </span>
                                            </div>

                                            <p className="text-muted-foreground">
                                                {interaction.mechanism || 'Mechanism of interaction not specified.'}
                                            </p>

                                            {interaction.recommendation && (
                                                <div className="bg-blue-50/50 p-4 rounded-xl text-sm text-blue-900 border border-blue-100 flex gap-3">
                                                    <Info className="w-5 h-5 flex-shrink-0 text-blue-600" />
                                                    <div>
                                                        <strong>Clinical Recommendation:</strong>
                                                        <p className="mt-1">{interaction.recommendation}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-100 rounded-3xl p-8 text-center space-y-4">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-green-900">No Interactions Found</h3>
                                        <p className="text-green-800 mt-2">
                                            The selected medication combination appears safe based on our analysis.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* General Warnings */}
                            {result.warnings && result.warnings.length > 0 && (
                                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6">
                                    <h4 className="text-sm font-bold text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Additional Warnings
                                    </h4>
                                    <ul className="space-y-2">
                                        {result.warnings.map((warning, index) => (
                                            <li key={index} className="text-amber-900 text-sm flex items-start gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                                {warning}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white/30 border border-white/20 rounded-3xl p-12 text-center text-muted-foreground h-full flex flex-col items-center justify-center min-h-[400px]">
                            <Search className="w-16 h-16 mb-4 opacity-10" />
                            <h3 className="text-xl font-bold text-foreground/50 mb-2">Ready to Check</h3>
                            <p>Enter medications on the left to analyze safety.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
