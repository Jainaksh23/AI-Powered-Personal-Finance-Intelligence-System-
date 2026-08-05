import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AddTransactionModal } from './components/AddTransactionModal';
import { VoiceCopilotModal } from './components/VoiceCopilotModal';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { AutoDetectionPage } from './pages/AutoDetectionPage';
import { IncomePage } from './pages/IncomePage';
import { ExpensePage } from './pages/ExpensePage';
import { BudgetsPage } from './pages/BudgetsPage';
import { ReportsPage } from './pages/ReportsPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { FraudDetectionPage } from './pages/FraudDetectionPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { transactionAPI, aiAPI, autoDetectionAPI } from './api';

function MainApp() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiSubTab, setAiSubTab] = useState('predictions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null); // null = Landing, 'login', 'register'

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [pendingAutoDetections, setPendingAutoDetections] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const fetchAllData = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [expRes, incRes, anaRes, predRes, fraudRes, recRes, pendingRes] = await Promise.all([
        transactionAPI.getExpenses(),
        transactionAPI.getIncomes(),
        aiAPI.getAnalytics(),
        aiAPI.getPredictions(),
        aiAPI.getFraudAlerts(),
        aiAPI.getRecommendations(),
        autoDetectionAPI.getPending()
      ]);

      setExpenses(expRes.data);
      setIncomes(incRes.data);
      setAnalytics(anaRes.data);
      setPredictions(predRes.data);
      setFraudAlerts(fraudRes.data);
      setRecommendations(recRes.data);
      setPendingAutoDetections(pendingRes.data);
    } catch (err) {
      console.error("Error fetching intelligence data", err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', background: '#090d16', fontSize: '1.2rem', fontWeight: '600' }}>
        Initializing Personal Finance Intelligence System...
      </div>
    );
  }

  if (!user) {
    if (authMode) {
      return <AuthPage initialMode={authMode} onBackToLanding={() => setAuthMode(null)} />;
    }
    return <LandingPage onGoToAuth={(mode) => setAuthMode(mode)} />;
  }

  const handleResolveFraudAlert = async (id, status) => {
    try {
      await aiAPI.resolveFraudAlert(id, status);
      fetchAllData();
    } catch (err) {
      console.error("Failed to resolve alert", err);
    }
  };

  const activeFraudCount = fraudAlerts.filter(a => a.status === 'Pending').length;
  const pendingAutoCount = pendingAutoDetections.length;

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        fraudCount={activeFraudCount}
        pendingAutoCount={pendingAutoCount}
      />

      <div className="main-content">
        <Navbar 
          onOpenTransactionModal={() => setIsModalOpen(true)} 
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          activeAlertsCount={activeFraudCount} 
        />

        {dataLoading && !analytics ? (
          <div style={{ padding: '40px', color: '#9ca3af', textAlign: 'center' }}>
            Loading Intelligence System Analytics...
          </div>
        ) : (
          <main style={{ padding: '28px' }}>
            {activeTab === 'dashboard' && (
              <Dashboard
                analytics={analytics}
                predictions={predictions}
                fraudAlerts={fraudAlerts.filter(a => a.status === 'Pending')}
                recommendations={recommendations}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'auto-detection' && (
              <AutoDetectionPage onRefreshData={fetchAllData} />
            )}

            {activeTab === 'income' && (
              <IncomePage incomes={incomes} onRefresh={fetchAllData} />
            )}

            {activeTab === 'expenses' && (
              <ExpensePage expenses={expenses} onRefresh={fetchAllData} onOpenAddModal={() => setIsModalOpen(true)} />
            )}

            {activeTab === 'budgets' && (
              <BudgetsPage onRefreshData={fetchAllData} />
            )}

            {activeTab === 'ai-insights' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', gap: '12px' }}>
                  <button
                    className={`btn ${aiSubTab === 'predictions' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAiSubTab('predictions')}
                  >
                    Expense Predictions
                  </button>
                  <button
                    className={`btn ${aiSubTab === 'fraud' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAiSubTab('fraud')}
                  >
                    Fraud Alerts ({activeFraudCount})
                  </button>
                  <button
                    className={`btn ${aiSubTab === 'recommendations' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAiSubTab('recommendations')}
                  >
                    AI Advice Engine
                  </button>
                </div>

                {aiSubTab === 'predictions' && <PredictionsPage predictions={predictions} />}
                {aiSubTab === 'fraud' && <FraudDetectionPage fraudAlerts={fraudAlerts} onResolveAlert={handleResolveFraudAlert} />}
                {aiSubTab === 'recommendations' && <RecommendationsPage recommendations={recommendations} />}
              </div>
            )}

            {activeTab === 'reports' && (
              <ReportsPage />
            )}

            {activeTab === 'profile' && (
              <ProfilePage />
            )}

            {!['dashboard', 'auto-detection', 'income', 'expenses', 'budgets', 'ai-insights', 'reports', 'profile'].includes(activeTab) && (
              <NotFoundPage onGoHome={() => setActiveTab('dashboard')} />
            )}
          </main>
        )}
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchAllData}
      />

      <VoiceCopilotModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onRefreshData={fetchAllData}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
