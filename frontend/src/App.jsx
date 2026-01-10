import { useState, useEffect } from 'react'
import { api } from './api'
import './App.css'
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
    { id: 'dashboard', label: 'Executive Overview', component: Dashboard },
    { id: 'clinical', label: 'Clinical Intelligence', component: ClinicalNoteAnalyzer },
    { id: 'prescription', label: 'Smart Scanner', component: PrescriptionScanner },
    { id: 'interactions', label: 'Safety Guard', component: DrugInteractionChecker },
    { id: 'medications', label: 'Patient Care', component: MedicationManager }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard

  if (showLanding) {
    return <LandingPage onEnter={(u) => { setUser(u); setShowLanding(false); }} />
  }

  // Org Admin View
  if (user?.role === 'org_admin') {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <h1 className="app-title">MedX</h1>
              <button
                onClick={() => { setUser(null); setShowLanding(true); }}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--danger)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem'
                }}
              >
                Logout (Org Admin)
              </button>
            </div>
          </div>
        </header>
        <main className="main-content">
          <div className="container">
            <OrgDashboard user={user} />
          </div>
        </main>
      </div>
    )
  }

  // Doctor View
  if (user?.role === 'doctor') {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <h1 className="app-title">MedX</h1>
              <button
                onClick={() => { setUser(null); setShowLanding(true); }}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--danger)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem'
                }}
              >
                Logout (Doctor)
              </button>
            </div>
          </div>
        </header>
        <main className="main-content">
          <div className="container">
            <DoctorDashboard user={user} />
          </div>
        </main>
      </div>
    )
  }

  // Patient View
  if (user?.role === 'patient') {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <h1 className="app-title">MedX</h1>
              <button
                onClick={() => { setUser(null); setShowLanding(true); }}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--danger)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="main-content">
          <div className="container">
            <PatientDashboard user={user} setUser={setUser} />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 className="app-title">MedX {user ? `| ${user.user_name}` : ''}</h1>
            <button
              onClick={() => { setUser(null); setShowLanding(true); }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--danger)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem'
              }}
            >
              Logout
            </button>
          </div>
          <div className="service-status">
            <div className="status-indicator">
              <div className={`status-dot ${serviceStatus.patient}`}></div>
              <span>Patient</span>
            </div>
            <div className="status-indicator">
              <div className={`status-dot ${serviceStatus.clinical}`}></div>
              <span>Clinical</span>
            </div>
            <div className="status-indicator">
              <div className={`status-dot ${serviceStatus.ai}`}></div>
              <span>AI</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="nav-tabs">
        <div className="tabs-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          <ActiveComponent />
        </div>
      </main>
    </div>
  )
}

export default App
