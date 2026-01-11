import { useState, useEffect } from 'react'
import { api } from '../api'
import { Plus, Trash2, CheckCircle, XCircle, Pill, Calendar, Clock, AlertCircle, Activity } from 'lucide-react'

export default function MedicationManager() {
    const [medications, setMedications] = useState([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        frequency: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Load medications on mount
    useEffect(() => {
        loadMedications()
    }, [])

    const loadMedications = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await api.getMedications()
            setMedications(data)
        } catch (err) {
            setError(err.message || String(err))
        } finally {
            setLoading(false)
        }
    }

    const handleAddMedication = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await api.addMedication(formData)
            await loadMedications()
            setFormData({ name: '', dosage: '', frequency: '' })
            setShowAddForm(false)
        } catch (err) {
            setError(err.message || String(err))
        } finally {
            setLoading(false)
        }
    }

    const logAdherence = async (medId, status) => {
        try {
            await api.logAdherence({
                medication_id: medId,
                status: status,
                timestamp: new Date().toISOString()
            })
            // Optimistic update or refresh? Refreshing for now to be safe with stats
            loadMedications()
            // Optional: User feedback toast could go here
        } catch (err) {
            setError(String(err.message || err))
        }
    }

    const deleteMedication = async (medId) => {
        if (!window.confirm('Are you sure you want to remove this medication?')) return

        setLoading(true)
        setError(null)
        try {
            await api.deleteMedication(medId)
            await loadMedications()
        } catch (err) {
            setError(err.message || String(err))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in max-w-6xl mx-auto pb-16">
            <div className="text-center mb-10 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Medication Tracker</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Manage your daily prescriptions and track adherence for better health outcomes.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Medication List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Pill className="w-6 h-6 text-primary" /> My Prescriptions
                        </h2>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
                        >
                            {showAddForm ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {showAddForm ? 'Cancel' : 'Add New'}
                        </button>
                    </div>

                    {showAddForm && (
                        <div className="bg-white rounded-3xl border border-border p-6 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <h3 className="text-lg font-bold mb-4">Add Medication</h3>
                            <form onSubmit={handleAddMedication} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label htmlFor="medName" className="text-sm font-semibold text-muted-foreground">Name</label>
                                        <input
                                            id="medName"
                                            type="text"
                                            required
                                            placeholder="e.g., Atorvastatin"
                                            className="w-full px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="dosage" className="text-sm font-semibold text-muted-foreground">Dosage</label>
                                        <input
                                            id="dosage"
                                            type="text"
                                            required
                                            placeholder="e.g., 20mg"
                                            className="w-full px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                            value={formData.dosage}
                                            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="frequency" className="text-sm font-semibold text-muted-foreground">Frequency</label>
                                        <input
                                            id="frequency"
                                            type="text"
                                            required
                                            placeholder="e.g., Daily at bedtime"
                                            className="w-full px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                            value={formData.frequency}
                                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:shadow-lg hover:bg-primary/90 transition-all"
                                    >
                                        {loading ? 'Saving...' : 'Save Medication'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {medications.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-3xl bg-secondary/10">
                                <Pill className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No medications being tracked.</p>
                                <button onClick={() => setShowAddForm(true)} className="text-primary font-bold hover:underline mt-2">
                                    Add your first medication
                                </button>
                            </div>
                        ) : (
                            medications.map((med) => (
                                <div key={med.id} className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between group hover:shadow-md transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                            <Pill className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground">{med.name}</h3>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><span className="font-semibold text-foreground">Dosage:</span> {med.dosage}</span>
                                                <span className="flex items-center gap-1"><span className="font-semibold text-foreground">Freq:</span> {med.frequency}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => logAdherence(med.id, 'taken')}
                                            className="flex-1 sm:flex-none px-4 py-2 bg-green-50 text-green-700 font-bold rounded-xl border border-green-100 hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                                            title="Mark as Taken"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Taken
                                        </button>
                                        <button
                                            onClick={() => logAdherence(med.id, 'skipped')}
                                            className="flex-1 sm:flex-none px-4 py-2 bg-yellow-50 text-yellow-700 font-bold rounded-xl border border-yellow-100 hover:bg-yellow-100 transition-colors flex items-center justify-center gap-1"
                                            title="Mark as Skipped"
                                        >
                                            <XCircle className="w-4 h-4" /> Skipped
                                        </button>
                                        <button
                                            onClick={() => deleteMedication(med.id)}
                                            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ml-2"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Adherence Stats */}
                <div className="space-y-6">
                    <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 p-6 md:p-8 shadow-sm h-fit">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" /> Adherence Score
                        </h3>

                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-[6px] border-primary/20 bg-white relative">
                                <span className="text-3xl font-black text-foreground">92%</span>
                                <svg className="absolute inset-0 w-full h-full -rotate-90 text-primary" viewBox="0 0 100 100">
                                    <circle
                                        className="text-primary stroke-current"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        cx="50" cy="50" r="46"
                                        fill="transparent"
                                        strokeDasharray="289.02652413026095"
                                        strokeDashoffset="23.12"
                                    ></circle>
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-green-600 mt-2">Excellent! Keep it up.</p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest border-b border-border/50 pb-2">Recent Logs</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <div>
                                            <div className="font-bold text-foreground">Lisinopril</div>
                                            <div className="text-xs text-muted-foreground">Today, 8:00 AM</div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">Taken</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <div>
                                            <div className="font-bold text-foreground">Metformin</div>
                                            <div className="text-xs text-muted-foreground">Today, 8:30 AM</div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">Taken</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                        <div>
                                            <div className="font-bold text-foreground">Metformin</div>
                                            <div className="text-xs text-muted-foreground">Yesterday, 8:30 PM</div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-700">Skipped</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <p className="text-xs text-primary/80 font-medium leading-relaxed">
                                💡 <strong className="text-primary">Tip:</strong> Consider setting a daily alarm to improve your consistency.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
