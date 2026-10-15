import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/current-user', { withCredentials: true })
      .then(res => {
        if (res.data.success && res.data.user) {
          const loggedInUser = res.data.user;
          setUser(loggedInUser);
          fetchProfileData(loggedInUser.username);
        }
      })
      .catch(err => console.log("Guest mode active"));
  }, []);

  const fetchProfileData = async (targetUsername) => {
    if (!targetUsername) return;
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/github/${targetUsername.trim().toLowerCase()}`);
      setProfileData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Profile load karne me error aa gaya!');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/github';
  };

  const handleLogout = () => {
    window.location.href = 'http://localhost:5000/auth/logout';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    fetchProfileData(username);
  };

  const chartData = profileData ? [
    { name: 'Repos', count: profileData.public_repos },
    { name: 'Followers', count: profileData.followers },
    { name: 'Following', count: profileData.following },
    { name: 'Stars', count: profileData.totalStars || 0 }
  ] : [];

  return (
    <div className="app-container">
      
      <header className="app-header">
        <div className="logo-area">
          <h2>⚡ GitPulse Dashboard</h2>
        </div>
        <div className="auth-area">
          {user ? (
            <div className="user-badge">
              <img src={user.avatarUrl} alt="avatar" className="user-avatar-sm" />
              <span>{user.displayName || user.username}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <button onClick={handleLogin} className="github-login-btn">
              <svg height="20" width="20" viewBox="0 0 16 16" fill="#fff"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
              Login with GitHub
            </button>
          )}
        </div>
      </header>

      <div className="hero-section">
        <h1>{user ? `Welcome to Your Dashboard, ${user.displayName || user.username}!` : 'GitHub Profile Analyzer'}</h1>
        <p>{user ? 'Here is your live GitHub analytics summary. You can also search any other developer profile below.' : 'Search any developer profile to inspect repositories, followers, and deep GitHub metrics instantly.'}</p>
        
        <form onSubmit={handleSearchSubmit} className="search-box-wrapper">
          <input
            type="text"
            placeholder={user ? "Search any other GitHub username..." : "Enter GitHub username (e.g., torvalds, octocat)..."}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="modern-search-input"
          />
          <button type="submit" className="modern-search-btn">
            {user ? 'Search Profile' : 'Analyze'}
          </button>
        </form>

        {user && (
          <div style={{ marginTop: '12px' }}>
            <button 
              onClick={() => fetchProfileData(user.username)} 
              style={{ background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              View My Dashboard Stats
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Fetching profile metrics...</p>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {profileData && (
        <div className="results-container">
          <div className="profile-card-modern">
            <div className="profile-top">
              <img src={profileData.avatar_url} alt="Avatar" className="profile-avatar-lg" />
              <div className="profile-meta">
                <h2>{profileData.name || profileData.login}</h2>
                <a href={profileData.html_url} target="_blank" rel="noreferrer" className="username-link">
                  @{profileData.login} ↗
                </a>
                <p className="profile-bio">{profileData.bio || 'No public bio provided for this profile.'}</p>
              </div>
            </div>

            <div className="stats-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="stat-box">
                <span className="stat-label">Repositories</span>
                <span className="stat-value">{profileData.public_repos}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Followers</span>
                <span className="stat-value">{profileData.followers}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Following</span>
                <span className="stat-value">{profileData.following}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Total Stars</span>
                <span className="stat-value">{profileData.totalStars || 0}</span>
              </div>
            </div>
          </div>

          <div className="chart-card-modern">
            <h3>GitHub Metrics Overview</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f8fafc' }} 
                  />
                  <Bar dataKey="count" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;