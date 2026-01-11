import { useState, useEffect } from 'react'
import { api } from './api'
import config from './config'
import Dashboard from './components/Dashboard'
import ClinicalNoteAnalyzer from './components/ClinicalNoteAnalyzer'
import PrescriptionScanner from './components/PrescriptionScanner'
import DrugInteractionChecker from './components/DrugInteractionChecker'
import MedicationManager from './components/MedicationManager'

import LandingPage from './components/LandingPage'
import OrgDashboard from './components/OrgDashboard'
import DoctorDashboard from './components/DoctorDashboard'
import PatientDashboard from './components/PatientDashboard'

import { LogOut, Activity, LayoutDashboard, FileText, Scan, ShieldCheck, Pill } from 'lucide-react'

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [serviceStatus, setServiceStatus] = useState({
    patient: 'checking',
    clinical: 'checking',
    ai: 'checking'
  })

  // Check service health on mount
  useEffect(() => {
    const checkServices = async () => {
      const services = ['patient', 'clinical', 'ai'];
      const results = {};

      for (const service of services) {
        try {
          const status = await api.checkHealth(service);
          results[service] = status.status === 'healthy' ? 'healthy' : 'error';
        } catch (e) {
          results[service] = 'error';
        }
      }

      setServiceStatus(results);
    };

    checkServices();
  }, [])

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, component: Dashboard },
    { id: 'clinical', label: 'Clinical Intelligence', icon: FileText, component: ClinicalNoteAnalyzer },
    { id: 'prescription', label: 'Smart Scanner', icon: Scan, component: PrescriptionScanner },
    { id: 'interactions', label: 'Safety Guard', icon: ShieldCheck, component: DrugInteractionChecker },
    { id: 'medications', label: 'Patient Care', icon: Pill, component: MedicationManager }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard

  if (showLanding) {
    return <LandingPage onEnter={(u) => { setUser(u); setShowLanding(false); }} />
  }

  // Common Header Component
  const Header = ({ role }) => (
    <header className="sticky top-0 z-40 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">M</div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            MedX <span className="text-muted-foreground font-normal mx-2">|</span> {user?.user_name || 'User'}
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-secondary text-xs font-semibold text-muted-foreground uppercase">{role}</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Service Status Indicators */}
          <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-secondary/50 rounded-full border border-white/40">
            {Object.entries(serviceStatus).map(([service, status]) => (
              <div key={service} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
                <span className="capitalize">{service}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setUser(null); setShowLanding(true); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive bg-destructive/5 hover:bg-destructive/10 rounded-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  )

  // Org Admin View
  if (user?.role === 'org_admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header role="Admin" />
        <main className="p-6 max-w-[1400px] mx-auto">
          <OrgDashboard user={user} />
        </main>
      </div>
    )
  }

  // Doctor View
  if (user?.role === 'doctor') {
    return (
      <div className="min-h-screen bg-background">
        <Header role="Doctor" />
        <main className="p-6 max-w-[1400px] mx-auto">
          <DoctorDashboard user={user} />
        </main>
      </div>
    )
  }

  // Patient View
  if (user?.role === 'patient') {
    return (
      <div className="min-h-screen bg-background">
        <Header role="Patient" />
        <main className="p-6 max-w-[1400px] mx-auto">
          <PatientDashboard user={user} setUser={setUser} />
        </main>
      </div>
    )
  }

  // Default / Dashboard View (Legacy or General)
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header role="Dashboard" />

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-1 overflow-x-auto px-6 py-2 max-w-[1400px] mx-auto no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full">
        <div className="fade-in">
          <ActiveComponent />
        </div>
      </main>
    </div>
  )
}

export default App
