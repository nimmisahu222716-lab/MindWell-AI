import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import './DashboardPage.css';

export const DashboardPage = () => {
  const { 
    user, 
    logout, 
    theme, 
    toggleTheme, 
    profileImage, 
    uploadProfileImage, 
    deleteProfileImage, 
    getApiClient 
  } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState('mood-tracker');

  // Common notifications
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Loaders
  const [loadingAction, setLoadingAction] = useState(false);

  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: '', message: '' }), 5000);
  };

  // ==========================================
  // TAB 1: MOOD TRACKER & HISTORY
  // ==========================================
  const [mood, setMood] = useState('Calm');
  const [stressLevel, setStressLevel] = useState('Low');
  const [moodNote, setMoodNote] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);

  const moodsList = [
    { name: 'Happy', iconClass: 'fa-regular fa-face-smile', color: '#5b8772' },
    { name: 'Calm', iconClass: 'fa-regular fa-face-laugh', color: '#7b8eb5' },
    { name: 'Anxious', iconClass: 'fa-regular fa-face-grimace', color: '#d9a752' },
    { name: 'Sad', iconClass: 'fa-regular fa-face-sad-tear', color: '#b87a7a' },
    { name: 'Stressed', iconClass: 'fa-regular fa-face-tired', color: '#a59cc5' },
    { name: 'Tired', iconClass: 'fa-regular fa-face-dizzy', color: '#90a398' }
  ];

  const fetchMoodHistory = async () => {
    try {
      const client = getApiClient();
      const response = await client.get('/mood/history');
      setMoodHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch mood history:', err);
    }
  };

  const handleSaveMood = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const client = getApiClient();
      await client.post('/mood/', {
        mood: mood,
        stress_level: stressLevel,
        note: moodNote
      });
      setMoodNote('');
      triggerAlert('success', 'Mood recorded successfully!');
      fetchMoodHistory();
    } catch (err) {
      triggerAlert('error', err.response?.data?.detail || 'Failed to save mood');
    } finally {
      setLoadingAction(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'mood-tracker' || activeTab === 'mood-analytics') {
      fetchMoodHistory();
    }
  }, [activeTab]);

  // ==========================================
  // TAB 2: MOOD ANALYTICS
  // ==========================================
  const [analyticsData, setAnalyticsData] = useState({
    total_entries: 0,
    stress_distribution: {},
    mood_distribution: {}
  });
  const [stressTrendData, setStressTrendData] = useState([]);

  const fetchAnalytics = async () => {
    try {
      const client = getApiClient();
      const res = await client.get('/mood/analytics');
      setAnalyticsData(res.data);

      const trendRes = await client.get('/mood/stress-trend');
      // Map Low->1, Moderate->2, High->3 for Recharts line rendering
      const mappedTrend = trendRes.data.map(item => {
        let value = 1;
        if (item.stress_level === 'Medium' || item.stress_level === 'Moderate') value = 2;
        if (item.stress_level === 'High' || item.stress_level === 'Very High') value = 3;
        return {
          date: item.date,
          levelName: item.stress_level,
          'Stress Index': value
        };
      });
      setStressTrendData(mappedTrend);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'mood-analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  const COLORS = ['#5b8772', '#8a7ea3', '#c58f8f', '#4a90e2', '#d9a752', '#7fb0a6'];

  // Prepare chart formats
  const moodChartData = Object.entries(analyticsData.mood_distribution).map(([name, value]) => ({
    name,
    value
  }));

  const stressChartData = Object.entries(analyticsData.stress_distribution).map(([name, value]) => ({
    name,
    value
  }));

  // Custom tooltips
  const CustomStressTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip glass-card">
          <p className="label">{`Date: ${payload[0].payload.date}`}</p>
          <p className="desc">{`Stress: ${payload[0].payload.levelName}`}</p>
        </div>
      );
    }
    return null;
  };

  // ==========================================
  // TAB 3: MENTAL HEALTH PREDICTOR
  // ==========================================
  const [predictInputs, setPredictInputs] = useState({
    Study_Hours: 4,
    Age: 20,
    Avg_Daily_Usage_Hours: 3,
    Daily_Unlocks: 30,
    Physical_Activity_Hours: 1.5,
    Sleep_Hours_Per_Night: 7,
    Stress_Level: 'Low',
    Gender: 'Female',
    Academic_Level: 'Undergraduate',
    Most_Used_Platform: 'Instagram',
    Purpose_Of_Use: 'Entertainment',
    Grouped_country: 'India'
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);

  const fetchPredictionHistory = async () => {
    try {
      const client = getApiClient();
      const res = await client.get('/predict/history');
      setPredictionHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch prediction history:', err);
    }
  };

  const handlePredictSubmit = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const client = getApiClient();
      const res = await client.post('/predict/', predictInputs);
      setPredictionResult(res.data);
      triggerAlert('success', 'Mental health score predicted successfully!');
      fetchPredictionHistory();
    } catch (err) {
      triggerAlert('error', err.response?.data?.detail || 'Prediction failed. Check input formats.');
    } finally {
      setLoadingAction(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'predictor') {
      fetchPredictionHistory();
    }
  }, [activeTab]);

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'Low': return 'badge-success';
      case 'Moderate': return 'badge-warning';
      case 'High': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  // ==========================================
  // TAB 4: PROFILE & PHOTO UPLOADS
  // ==========================================
  const [profileName, setProfileName] = useState('');
  const [profileAge, setProfileAge] = useState('');
  const [profileGender, setProfileGender] = useState('');

  useEffect(() => {
    if (user) {
      setProfileName(user.full_name || '');
      setProfileAge(user.age || '');
      setProfileGender(user.gender || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const client = getApiClient();
      await client.put('/profile/', {
        full_name: profileName,
        age: profileAge ? parseInt(profileAge) : null,
        gender: profileGender || null
      });
      triggerAlert('success', 'Profile updated successfully!');
    } catch (err) {
      triggerAlert('error', err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoadingAction(false);
    }
  };

  // File Upload base64 Conversion helper
  const handlePhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      triggerAlert('error', 'Profile photo must be smaller than 1.5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      uploadProfileImage(reader.result);
      triggerAlert('success', 'Profile photo updated!');
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // TAB 5: REPORTS GENERATION
  // ==========================================
  const handleDownloadPDF = async () => {
    setLoadingAction(true);
    try {
      const client = getApiClient();
      const response = await client.get('/report/pdf', {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MindWell_Wellness_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      triggerAlert('success', 'PDF Report downloaded successfully!');
    } catch (err) {
      console.error('Failed to download PDF:', err);
      triggerAlert('error', 'Failed to generate PDF Report. Ensure prediction and mood records exist.');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="dashboard-grid">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar glass-card animate-fade-in">
        <div className="sidebar-brand">
          <span className="sidebar-logo-icon-fa text-accent">
            <i className="fa-solid fa-brain"></i>
          </span>
          <h2 className="sidebar-title">MindWell AI</h2>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item-fa ${activeTab === 'mood-tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('mood-tracker')}
          >
            <i className="fa-solid fa-heart"></i>
            <span>Mood Tracker</span>
          </button>
          <button
            className={`nav-item-fa ${activeTab === 'mood-analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('mood-analytics')}
          >
            <i className="fa-solid fa-chart-pie"></i>
            <span>Wellness Analytics</span>
          </button>
          <button
            className={`nav-item-fa ${activeTab === 'predictor' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictor')}
          >
            <i className="fa-solid fa-microchip"></i>
            <span>AI Predictor</span>
          </button>
          <button
            className={`nav-item-fa ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fa-solid fa-user"></i>
            <span>My Profile</span>
          </button>
          <button
            className={`nav-item-fa ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <i className="fa-solid fa-file-pdf"></i>
            <span>PDF Reports</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'light' ? (
              <>
                <i className="fa-solid fa-moon"></i> <span>Dark Mode</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-sun"></i> <span>Light Mode</span>
              </>
            )}
          </button>

          <div className="user-details-card">
            <div className="user-avatar-image-container">
              {profileImage ? (
                <img src={profileImage} alt="Avatar" className="user-avatar-img" />
              ) : (
                <div className="user-avatar-placeholder-fa">
                  <i className="fa-solid fa-user"></i>
                </div>
              )}
            </div>
            <div className="user-info-text">
              <p className="user-name">{profileName || 'MindWell User'}</p>
              <p className="user-email">{user?.email || ''}</p>
            </div>
          </div>

          <button className="logout-btn" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Exit Session</span>
          </button>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <main className="dashboard-main-content">
        {/* Floating Alert banner */}
        {alert.message && (
          <div className={`alert-banner ${alert.type} animate-fade-in`}>
            {alert.type === 'error' ? (
              <i className="fa-solid fa-circle-exclamation"></i>
            ) : (
              <i className="fa-solid fa-circle-check"></i>
            )}
            <span>{alert.message}</span>
          </div>
        )}

        {/* ==========================================
            TAB: MOOD TRACKER
        ========================================== */}
        {activeTab === 'mood-tracker' && (
          <div className="tab-pane animate-tab-fade-in">
            <div className="tab-header-section animate-slide-up">
              <h1>Daily Mood Sanctuary</h1>
              <p>Take a deep breath and record how your mind is resting today.</p>
            </div>

            <div className="mood-tracker-layout animate-slide-up">
              {/* Logging Panel */}
              <div className="glass-card logger-card">
                <h3>Log Your Mood</h3>
                <form onSubmit={handleSaveMood}>
                  <div className="form-group">
                    <label className="form-label">How do you feel?</label>
                    <div className="mood-buttons">
                      {moodsList.map((m) => (
                        <button
                          key={m.name}
                          type="button"
                          className={`mood-btn ${mood === m.name ? 'active' : ''}`}
                          onClick={() => setMood(m.name)}
                        >
                          <i className={`${m.iconClass} mood-emoji-fa`} style={{ color: mood === m.name ? 'var(--accent-color)' : m.color }}></i>
                          <span className="mood-name">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stress Level Indicator</label>
                    <div className="stress-toggle-row">
                      {['Low', 'Medium', 'High'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          className={`stress-btn-toggle ${stressLevel === level ? 'active' : ''}`}
                          onClick={() => setStressLevel(level)}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reflections / Notes</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="Write a few lines about your day or thoughts..."
                      rows="4"
                      value={moodNote}
                      onChange={(e) => setMoodNote(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-primary flex-center-btn" disabled={loadingAction}>
                    <i className="fa-solid fa-floppy-disk"></i> {loadingAction ? 'Recording...' : 'Save Reflections'}
                  </button>
                </form>
              </div>

              {/* History Panel */}
              <div className="glass-card history-card">
                <h3>Reflection Logs</h3>
                <div className="mood-history-list">
                  {moodHistory.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-emoji-fa text-accent">
                        <i className="fa-solid fa-file-signature"></i>
                      </span>
                      <p>Your sanctuary is clean. No mood logs recorded yet.</p>
                    </div>
                  ) : (
                    moodHistory.map((item, idx) => {
                      const dateObj = new Date(item.created_at);
                      const formattedDate = dateObj.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                      const formattedTime = dateObj.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      const moodMeta = moodsList.find(m => m.name === item.mood);
                      const iconClass = moodMeta?.iconClass || 'fa-regular fa-face-smile';

                      return (
                        <div key={idx} className="history-item glass-card animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                          <div className="history-header">
                            <span className="history-emoji-badge">
                              <i className={`${iconClass} mr-2`} style={{ color: moodMeta?.color }}></i> {item.mood}
                            </span>
                            <span className={`stress-tag ${item.stress_level.toLowerCase()}`}>
                              Stress: {item.stress_level}
                            </span>
                          </div>
                          <p className="history-notes">"{item.note}"</p>
                          <div className="history-footer">
                            <i className="fa-solid fa-calendar-days"></i>
                            <span>{formattedDate} at {formattedTime}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: MOOD ANALYTICS
        ========================================== */}
        {activeTab === 'mood-analytics' && (
          <div className="tab-pane animate-tab-fade-in">
            <div className="tab-header-section animate-slide-up">
              <h1>Wellness Analytics</h1>
              <p>Visual trends to understand your emotional patterns over time.</p>
            </div>

            {moodHistory.length === 0 ? (
              <div className="glass-card empty-analytics-card animate-slide-up">
                <div className="empty-state">
                  <span className="empty-emoji-fa text-accent">
                    <i className="fa-solid fa-chart-column"></i>
                  </span>
                  <h3>Awaiting Data</h3>
                  <p>Log a few daily moods in the Mood Tracker tab to generate your wellness dashboards.</p>
                  <button className="btn-primary mt-4" onClick={() => setActiveTab('mood-tracker')}>
                    Go to Mood Tracker
                  </button>
                </div>
              </div>
            ) : (
              <div className="analytics-grid animate-slide-up">
                {/* Metric Summary */}
                <div className="glass-card summary-card-analytics">
                  <h3>Insight Overview</h3>
                  <div className="analytics-stats-row">
                    <div className="stat-circle-box animate-pulse-glow">
                      <span className="stat-number">{analyticsData.total_entries}</span>
                      <span className="stat-label">Reflections</span>
                    </div>
                    <div className="stat-description-para">
                      <p>
                        Consistent tracking is the first step towards mindfulness. By reflecting on your emotional status, you are building cognitive resilience. Keep it up!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stress Trend Line Chart */}
                <div className="glass-card chart-large-card">
                  <h3>Stress Trend Over Time</h3>
                  <p className="chart-subtitle">Tracks your stress levels sorted chronologically (1: Low, 2: Medium/Moderate, 3: High/Very High)</p>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stressTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="date" stroke="var(--text-secondary)" />
                        <YAxis ticks={[1, 2, 3]} tickFormatter={(v) => v === 1 ? 'Low' : v === 2 ? 'Medium' : 'High'} stroke="var(--text-secondary)" />
                        <Tooltip content={<CustomStressTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="Stress Index"
                          stroke="var(--accent-color)"
                          strokeWidth={3}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Mood Distribution */}
                <div className="glass-card chart-small-card">
                  <h3>Mood Share</h3>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={moodChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {moodChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Stress Distribution */}
                <div className="glass-card chart-small-card">
                  <h3>Stress Distribution</h3>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={stressChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" />
                        <YAxis stroke="var(--text-secondary)" />
                        <Tooltip />
                        <Bar dataKey="value" fill="var(--accent-purple)">
                          {stressChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB: AI PREDICTOR
        ========================================== */}
        {activeTab === 'predictor' && (
          <div className="tab-pane animate-tab-fade-in">
            <div className="tab-header-section animate-slide-up">
              <h1>AI Mental Health Predictor</h1>
              <p>Provide key metrics of your daily lifestyle to evaluate your wellness score using machine learning.</p>
            </div>

            <div className="predictor-split-layout animate-slide-up">
              {/* Questionnaire Form */}
              <div className="glass-card form-predict-card">
                <h3>Evaluate Lifestyle Metrics</h3>
                <form onSubmit={handlePredictSubmit}>
                  <div className="form-row-two">
                    <div className="form-group">
                      <label className="form-label">Age</label>
                      <input
                        type="number"
                        className="form-input"
                        value={predictInputs.Age}
                        onChange={(e) => setPredictInputs({ ...predictInputs, Age: parseInt(e.target.value) || 20 })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-input select-styled"
                        value={predictInputs.Gender}
                        onChange={(e) => setPredictInputs({ ...predictInputs, Gender: e.target.value })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row-two">
                    <div className="form-group">
                      <label className="form-label">Daily Unlocks</label>
                      <input
                        type="number"
                        className="form-input"
                        value={predictInputs.Daily_Unlocks}
                        onChange={(e) => setPredictInputs({ ...predictInputs, Daily_Unlocks: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Avg Social Media Hours/Day</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-input"
                        value={predictInputs.Avg_Daily_Usage_Hours}
                        onChange={(e) => setPredictInputs({ ...predictInputs, Avg_Daily_Usage_Hours: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-three">
                    <div className="form-group">
                      <label className="form-label">Study Hours/Day</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-input"
                        value={predictInputs.Study_Hours}
                        onChange={(e) => setPredictInputs({ ...predictInputs, Study_Hours: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Physical Activity Hours/Day</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-input"
                        value={predictInputs.Physical_Activity_Hours}
                        onChange={(e) => setPredictInputs({ ...predictInputs, Physical_Activity_Hours: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sleep Hours/Night</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-input"
                        value={predictInputs.Sleep_Hours_Per_Night}
                        onChange={(e) => setPredictInputs({ ...predictInputs, Sleep_Hours_Per_Night: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-two">
                    <div className="form-group">
                      <label className="form-label">Current Academic Level</label>
                      <select
                        className="form-input select-styled"
                        value={predictInputs.Academic_Level}
                        onChange={(e) => setPredictInputs({ ...predictInputs, Academic_Level: e.target.value })}
                      >
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Graduate">Graduate</option>
                        <option value="High School">High School</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Current Country Category</label>
                      <select
                        className="form-input select-styled"
                        value={predictInputs.Grouped_country}
                        onChange={(e) => setPredictInputs({ ...predictInputs, Grouped_country: e.target.value })}
                      >
                        <option value="India">India</option>
                        <option value="USA">USA</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="UK">UK</option>
                        <option value="Germany">Germany</option>
                        <option value="Mexico">Mexico</option>
                        <option value="Turkey">Turkey</option>
                        <option value="France">France</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row-three">
                    <div className="form-group">
                      <label className="form-label">Stress Level</label>
                      <select
                        className="form-input select-styled"
                        value={predictInputs.Stress_Level}
                        onChange={(e) => setPredictInputs({ ...predictInputs, Stress_Level: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Very High">Very High</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Most Used Platform</label>
                      <select
                        className="form-input select-styled"
                        value={predictInputs.Most_Used_Platform}
                        onChange={(e) => setPredictInputs({ ...predictInputs, Most_Used_Platform: e.target.value })}
                      >
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="YouTube">YouTube</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Snapchat">Snapchat</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Twitter">Twitter</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="LINE">LINE</option>
                        <option value="KakaoTalk">KakaoTalk</option>
                        <option value="WeChat">WeChat</option>
                        <option value="VKontakte">VKontakte</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Primary Purpose of Use</label>
                      <select
                        className="form-input select-styled"
                        value={predictInputs.Purpose_Of_Use}
                        onChange={(e) => setPredictInputs({ ...predictInputs, Purpose_Of_Use: e.target.value })}
                      >
                        <option value="Entertainment">Entertainment</option>
                        <option value="Education">Education</option>
                        <option value="Networking">Networking</option>
                        <option value="News">News</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={loadingAction}>
                    {loadingAction ? 'Evaluating Model...' : 'Calculate Mental Health Index'}
                  </button>
                </form>
              </div>

              {/* Evaluation Results */}
              <div className="predict-results-panel">
                {predictionResult ? (
                  <div className="glass-card result-card animate-fade-in">
                    <h3>AI Evaluation Result</h3>
                    <div className="result-metric-display">
                      <span className="result-score">{predictionResult.prediction.toFixed(1)}</span>
                      <span className="score-max">/ 10.0</span>
                    </div>

                    <div className="result-risk-section">
                      <span className="risk-label">Wellness Risk Index:</span>
                      <span className={`risk-badge ${getRiskBadgeColor(predictionResult.risk_level)}`}>
                        {predictionResult.risk_level}
                      </span>
                    </div>

                    <div className="result-suggestions-section">
                      <h4>Self-Care Recommendations:</h4>
                      <ul className="suggestions-list-ul">
                        {predictionResult.suggestions.map((suggestion, index) => (
                          <li key={index} className="suggestion-bullet">
                            <span className="bullet-point text-accent">
                              <i className="fa-solid fa-leaf"></i>
                            </span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card prediction-placeholder-card">
                    <div className="empty-state">
                      <span className="empty-emoji-fa text-accent animate-pulse-glow">
                        <i className="fa-solid fa-robot"></i>
                      </span>
                      <h3>Ready for Assessment</h3>
                      <p>Complete the lifestyle questionnaire on the left to trigger the AI mental health evaluation pipeline.</p>
                    </div>
                  </div>
                )}

                {/* History list */}
                <div className="glass-card predict-history-card">
                  <h3>Evaluation History</h3>
                  <div className="predict-history-scroll-box">
                    {predictionHistory.length === 0 ? (
                      <p className="empty-text">No prediction records available.</p>
                    ) : (
                      predictionHistory.map((pred, i) => (
                        <div key={i} className="pred-history-item animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                          <div className="pred-hist-top">
                            <span className="pred-hist-score">Index: {pred.prediction.toFixed(1)}/10</span>
                            <span className={`risk-badge-sm ${getRiskBadgeColor(pred.risk_level)}`}>
                              {pred.risk_level}
                            </span>
                          </div>
                          <p className="pred-hist-time">
                            {new Date(pred.created_at).toLocaleDateString()} at {new Date(pred.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: PROFILE
        ========================================== */}
        {activeTab === 'profile' && (
          <div className="tab-pane animate-tab-fade-in">
            <div className="tab-header-section animate-slide-up">
              <h1>Personal Metrics</h1>
              <p>Configure details and profile photo used to personalize wellness recommendations.</p>
            </div>

            <div className="profile-center-layout animate-slide-up">
              {/* Photo Upload Card */}
              <div className="glass-card profile-photo-upload-card">
                <h3>Profile Photo</h3>
                <div className="profile-photo-management-zone">
                  <div className="profile-photo-large-preview">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="profile-large-img" />
                    ) : (
                      <div className="profile-large-placeholder-fa">
                        <i className="fa-solid fa-user-tie"></i>
                      </div>
                    )}
                  </div>
                  <div className="profile-photo-actions-row">
                    <label className="btn-secondary file-upload-label-btn">
                      <i className="fa-solid fa-camera"></i> Choose Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoFileChange} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                    {profileImage && (
                      <button type="button" className="btn-secondary delete-photo-btn" onClick={deleteProfileImage}>
                        <i className="fa-solid fa-trash-can"></i> Remove
                      </button>
                    )}
                  </div>
                  <p className="upload-tip-text">Accepts JPG, PNG formats. Max file size: 1.5MB.</p>
                </div>
              </div>

              {/* Profile Details Form Card */}
              <div className="glass-card profile-details-card">
                <h3>Profile Details</h3>
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address (Registered)</label>
                    <input
                      type="email"
                      className="form-input"
                      value={user?.email || ''}
                      disabled
                      style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    />
                  </div>

                  <div className="form-row-two">
                    <div className="form-group">
                      <label className="form-label">Age</label>
                      <input
                        type="number"
                        className="form-input"
                        value={profileAge}
                        onChange={(e) => setProfileAge(e.target.value)}
                        placeholder="Enter age"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender Identity</label>
                      <select
                        className="form-input select-styled"
                        value={profileGender}
                        onChange={(e) => setProfileGender(e.target.value)}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary flex-center-btn" disabled={loadingAction}>
                    <i className="fa-solid fa-floppy-disk"></i> {loadingAction ? 'Saving Settings...' : 'Save Profile Details'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: REPORTS
        ========================================== */}
        {activeTab === 'reports' && (
          <div className="tab-pane animate-tab-fade-in">
            <div className="tab-header-section animate-slide-up">
              <h1>Generate PDF Report</h1>
              <p>Export a formatted mental wellness summary document compiled from your logs.</p>
            </div>

            <div className="glass-card report-download-center animate-slide-up">
              <div className="report-graphic-box-fa text-accent animate-pulse-glow">
                <i className="fa-solid fa-file-pdf"></i>
              </div>
              <h3>Consolidated Wellness Report</h3>
              <p className="report-desc-text">
                Your report compiles recorded daily mood history, stress level distributions, registered user profile parameters, and AI-predicted risk levels with suggestions into a single, printable PDF document.
              </p>
              
              <div className="report-alert-notice">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>Ensure you have registered at least one mood log and run one AI evaluation to populate the document metrics.</span>
              </div>

              <button className="btn-primary flex-center-btn download-large-btn" onClick={handleDownloadPDF} disabled={loadingAction}>
                <i className="fa-solid fa-cloud-arrow-down"></i> {loadingAction ? 'Compiling PDF...' : 'Download PDF Document'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
