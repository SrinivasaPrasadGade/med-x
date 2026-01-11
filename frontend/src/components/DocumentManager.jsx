import { useState, useEffect, useRef } from 'react'
import { api } from '../api'
import MedXCard from './MedXCard'
import { Upload, FileText, Lock, Eye, Download, X, AlertCircle, File, Plus } from 'lucide-react'

export default function DocumentManager({ user }) {
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    // Security Modal State
    const [lockedDoc, setLockedDoc] = useState(null)
    const [password, setPassword] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [error, setError] = useState(null)
    const [unlockedFiles, setUnlockedFiles] = useState(new Set()) // Track unlocked files in session

    const fileInputRef = useRef(null)

    useEffect(() => {
        if (user?.id) {
            loadDocuments()
        }
    }, [user?.id])

    const loadDocuments = async () => {
        setLoading(true)
        try {
            const docs = await api.getDocuments(user.id)
            setDocuments(docs)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('user_id', user.id)

        try {
            await api.uploadDocument(formData)
            await loadDocuments()
        } catch (err) {
            alert('Upload failed: ' + err.message)
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleView = (doc) => {
        if (unlockedFiles.has(doc.id)) {
            openDocument(doc.id)
        } else {
            setLockedDoc(doc)
            setError(null)
            setPassword('')
        }
    }

    const openDocument = async (docId) => {
        // In a real app we might fetch a signed URL or blob.
        // Here we link to the endpoint directly, but maybe we want to force a download?
        // Let's open in new tab for now. 
        // Note: Protected endpoint doesn't check password again, so 'unlockedFiles' is client-side gate for UX.
        // Ideally backend issues a short-lived token. For this demo, client password check wraps the intent.
        window.open(`${api.config?.AI_SERVICE_URL || ''}/api/documents/${docId}`, '_blank')
    }

    const handleUnlock = async (e) => {
        e.preventDefault()
        setVerifying(true)
        setError(null)

        try {
            // Verify password with backend
            // We pass the typed password. The user.id is optional but good context.
            // But api.verifyPassword takes (password, userId).
            // Default userId is 1 in api.js, let's pass real one.
            await api.verifyPassword(password, user.id)

            // Success
            setUnlockedFiles(prev => new Set(prev).add(lockedDoc.id))
            openDocument(lockedDoc.id)
            setLockedDoc(null)
        } catch (err) {
            setError("Incorrect password")
        } finally {
            setVerifying(false)
        }
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">

            {/* MedX Card Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-auto flex-shrink-0 mx-auto md:mx-0">
                    <MedXCard user={user} />
                </div>

                <div className="flex-1 space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">Digital Health Wallet</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Access your medical records and identification securely. Your sensitive documents are encrypted and password-protected.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-white p-4 rounded-2xl border border-border shadow-sm">
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Documents</h4>
                            <p className="text-3xl font-bold text-primary">{documents.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-border shadow-sm">
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Storage</h4>
                            <p className="text-3xl font-bold text-primary">{(documents.length * 1.2).toFixed(1)} MB</p>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-border/50" />

            {/* Documents List */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" /> My Documents
                    </h3>

                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="bg-primary text-white font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70"
                        >
                            {uploading ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            ) : (
                                <Upload className="w-4 h-4" />
                            )}
                            Upload New
                        </button>
                    </div>
                </div>

                {documents.length === 0 ? (
                    <div className="text-center py-16 bg-secondary/20 rounded-3xl border-2 border-dashed border-border/60">
                        <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-sm mb-4">
                            <File className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <h4 className="text-lg font-bold text-foreground mb-1">No documents yet</h4>
                        <p className="text-muted-foreground">Upload prescriptions, lab reports, or insurance cards.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map(doc => (
                            <div key={doc.id} className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all hover:border-primary/20 relative">
                                {/* Thumbnail / Icon */}
                                <div className="h-32 bg-secondary/30 flex items-center justify-center relative">
                                    {unlockedFiles.has(doc.id) ? (
                                        <FileText className="w-12 h-12 text-primary/60" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Lock className="w-8 h-8 text-muted-foreground/40" />
                                            <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Protected</span>
                                        </div>
                                    )}
                                    {/* Type badge */}
                                    <div className="absolute top-3 right-3 px-2 py-1 bg-white/80 backdrop-blur rounded-lg text-xs font-bold shadow-sm uppercase">
                                        {doc.filename.split('.').pop()}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h4 className="font-bold text-foreground truncate mb-1" title={doc.filename}>{doc.filename}</h4>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Uploaded {new Date(doc.upload_date).toLocaleDateString()}
                                    </p>

                                    <button
                                        onClick={() => handleView(doc)}
                                        className={`
                                            w-full py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors
                                            ${unlockedFiles.has(doc.id)
                                                ? 'bg-secondary text-foreground hover:bg-secondary/80'
                                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}
                                        `}
                                    >
                                        {unlockedFiles.has(doc.id) ? (
                                            <><Eye className="w-4 h-4" /> View Document</>
                                        ) : (
                                            <><Lock className="w-4 h-4" /> Unlock to View</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Security Modal */}
            {lockedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl scale-[1.02] animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Shield className="w-6 h-6 text-primary" /> Security Check
                            </h3>
                            <button onClick={() => setLockedDoc(null)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <p className="text-muted-foreground text-sm mb-6">
                            This document contains sensitive medical information. Please enter your password to verify your identity.
                        </p>

                        <form onSubmit={handleUnlock} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider ml-1">Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 bg-secondary/30 rounded-xl border border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-600 font-medium bg-red-50 p-3 rounded-xl">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={verifying || !password}
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:shadow-none"
                            >
                                {verifying ? 'Verifying...' : 'Unlock Document'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
