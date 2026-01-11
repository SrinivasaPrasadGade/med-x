import { QrCode, Shield, Activity, Calendar } from 'lucide-react'

export default function MedXCard({ user }) {
    if (!user) return null

    // Fallbacks or formatting
    const memberSince = new Date().getFullYear() // Default to current year for demo if not in DB
    const allergies = user.allergies || 'None known'
    const bloodType = user.blood_type || 'Unknown'

    return (
        <div className="relative overflow-hidden w-full max-w-md aspect-[1.586] rounded-3xl text-white shadow-2xl transition-transform hover:scale-[1.01] duration-300">
            {/* Background with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#d946ef]"></div>

            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

            {/* Content */}
            <div className="relative h-full p-6 flex flex-col justify-between z-10">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight tracking-wide">MedX</h3>
                            <p className="text-[10px] text-white/50 font-medium tracking-widest uppercase">Universal Health ID</p>
                        </div>
                    </div>
                    {/* Chip */}
                    <div className="w-12 h-9 rounded-lg bg-gradient-to-tr from-yellow-200 to-yellow-500 border border-yellow-400/50 shadow-inner flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-50 border-[0.5px] border-black/20 rounded-lg"></div>
                    </div>
                </div>

                {/* Patient Details Middle */}
                <div className="space-y-4">
                    <div className="flex gap-8">
                        <div>
                            <p className="text-[10px] text-white/60 uppercase tracking-wider font-semibold mb-0.5">Blood Type</p>
                            <p className="font-mono font-bold text-lg">{bloodType}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-white/60 uppercase tracking-wider font-semibold mb-0.5">Allergies</p>
                            <p className="font-medium text-sm max-w-[150px] truncate">{allergies}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end">
                    <div>
                        <p className="font-mono text-xl tracking-widest text-white/90 shadow-black drop-shadow-sm mb-1">
                            {user.full_name || user.email}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-white/70 font-medium">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> SINCE {memberSince}</span>
                            <span>•</span>
                            <span>ID: {user.id ? String(user.id).padStart(8, '0') : '00000000'}</span>
                        </div>
                    </div>
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <QrCode className="w-10 h-10 text-black" />
                    </div>
                </div>
            </div>
        </div>
    )
}
