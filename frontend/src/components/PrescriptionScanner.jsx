import { useState, useRef } from 'react'
import { api } from '../api'
import { Upload, FileText, X, Search, CheckCircle, AlertCircle, FileSearch } from 'lucide-react'

export default function PrescriptionScanner() {
    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const fileInputRef = useRef(null)

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) handleFile(file)
    }

    const handleFile = (file) => {
        setSelectedFile(file)
        setError(null)
        const reader = new FileReader()
        reader.onloadend = () => setPreview(reader.result)
        reader.readAsDataURL(file)
    }

    const handleDragOver = (e) => e.preventDefault()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedFile) return
        setLoading(true)
        setError(null)
        setResult(null)
        try {
            const data = await api.scanPrescription(selectedFile)
            setResult(data)
        } catch (err) {
            setError(err.message || String(err))
        } finally {
            setLoading(false)
        }
    }

    const clearFile = () => {
        setSelectedFile(null)
        setPreview(null)
        setResult(null)
        setError(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const [savedMeds, setSavedMeds] = useState(new Set())

    const handleAddMedication = async (med) => {
        try {
            await api.addMedication({
                name: med.name,
                dosage: med.dosage || 'As directed',
                frequency: med.frequency || 'As directed'
            })
            setSavedMeds(prev => new Set([...prev, med.name]))
        } catch (err) {
            console.error(err)
            // Optional: show error toast
        }
    }

    return (
        <div className="animate-fade-in max-w-7xl mx-auto pb-16">
            <div className="text-center mb-10 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Prescription OCR Scanner</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Upload a prescription image to instantly extract medication details, dosage, and instructions using AI vision.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="space-y-6">
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden
                            ${preview ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary hover:bg-secondary/30'}
                            h-[400px] flex flex-col items-center justify-center p-8 text-center
                        `}
                    >
                        {preview ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                    src={preview}
                                    alt="Prescription preview"
                                    className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                    <p className="text-white font-medium flex items-center gap-2">
                                        <Upload className="w-5 h-5" /> Change Image
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary group-hover:scale-110 transition-transform">
                                    <Upload className="w-10 h-10" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-foreground">Drag & drop your prescription</p>
                                    <p className="text-muted-foreground mt-2">or click to browse</p>
                                </div>
                                <div className="text-xs text-muted-foreground pt-4">Supports JPG, PNG, WEBP</div>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {selectedFile && (
                        <div className="flex gap-4 animate-in fade-in slide-in-from-top-2">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <div className="animate-spin text-xl">⟳</div> : <Search className="w-5 h-5" />}
                                {loading ? 'Analyzing Image...' : 'Process Prescription'}
                            </button>
                            <button
                                onClick={clearFile}
                                disabled={loading}
                                className="px-6 py-4 bg-secondary text-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-all"
                            >
                                Reset
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-3 animate-in shake">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 p-6 md:p-8 shadow-sm h-fit min-h-[400px]">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <FileSearch className="w-6 h-6 text-primary" /> Extraction Results
                    </h3>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground space-y-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p>AI is reading the prescription...</p>
                        </div>
                    ) : result ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-5 duration-500">
                            {/* Medications */}
                            <div>
                                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Medications Found</h4>
                                {result.medications?.length > 0 ? (
                                    <div className="space-y-4">
                                        {result.medications.map((med, i) => (
                                            <div key={i} className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                                    <CheckCircle className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h5 className="text-lg font-bold text-foreground">{med.name}</h5>
                                                        <button
                                                            onClick={() => handleAddMedication(med)}
                                                            disabled={savedMeds.has(med.name)}
                                                            className={`
                                                                text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1
                                                                ${savedMeds.has(med.name)
                                                                    ? 'bg-green-100 text-green-700 cursor-default'
                                                                    : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}
                                                            `}
                                                        >
                                                            {savedMeds.has(med.name) ? (
                                                                <>Saved <CheckCircle className="w-3 h-3" /></>
                                                            ) : (
                                                                <>+ Add to Meds</>
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                                                        {med.dosage && (
                                                            <div className="text-muted-foreground">
                                                                <span className="font-semibold text-foreground">Dosage:</span> {med.dosage}
                                                            </div>
                                                        )}
                                                        {med.frequency && (
                                                            <div className="text-muted-foreground">
                                                                <span className="font-semibold text-foreground">Freq:</span> {med.frequency}
                                                            </div>
                                                        )}
                                                        {med.duration && (
                                                            <div className="text-muted-foreground col-span-2">
                                                                <span className="font-semibold text-foreground">Duration:</span> {med.duration}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
                                        No specific medications identified.
                                    </div>
                                )}
                            </div>

                            {/* Raw Text Toggle */}
                            {result.raw_text && (
                                <details className="group">
                                    <summary className="flex items-center gap-2 text-sm font-medium text-primary cursor-pointer hover:text-primary/80 transition-colors select-none">
                                        <FileText className="w-4 h-4" /> View Raw OCR Text
                                    </summary>
                                    <div className="mt-3 p-4 bg-secondary/30 rounded-xl border border-border text-xs font-mono text-muted-foreground whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar">
                                        {result.raw_text}
                                    </div>
                                </details>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground text-center border-2 border-dashed border-border rounded-2xl bg-secondary/10">
                            <Upload className="w-12 h-12 mb-4 opacity-20" />
                            <p>Upload a prescription to see extracted details here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
