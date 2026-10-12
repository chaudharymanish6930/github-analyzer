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

  // Check karo ki kya user logged-in hai ya nahi
  useEffect(() => {
    axios.get('http://localhost:5000/api/current-user', { withCredentials: true })
      .then(res => {
        if (res.data.success) {
          setUser(res.data.user);
          // Agar user login hai, toh uska khud ka username daalkar profile fetch kar lo
          fetchProfile(res.data.user.username);
        }
      })
      .catch(err => console.log("User not logged in"));
  }, []);

  const fetchProfile = async (targetUser) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/github/${targetUser}`);
      setProfileData(response.data.data);
    } catch (err) {
      setError('Profile data load karne me error aa gaya!');
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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    fetchProfile(username);
  };

  const chartData = profileData ? [
    { name: 'Repos', count: profileData.public_repos },
    { name: 'Followers', count: profileData.followers },
    { name: 'Following', count: profileData.following }
  ] : [];

  return (
    <div className="app-container">
      
      {/* Top Navbar / Auth Section */}
      <div style={{ width: '100%', maxWidth: '500px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#38bdf8', fontSize: '1rem', margin: 0 }}>
          {user ? `Welcome, ${user.displayName || user.username}! 🎉` : 'Guest Mode'}
        </h3>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1e293b', padding: '6px 12px', borderRadius: '12px', border: '1px solid #334155' }}>
            <img src={user.avatarUrl} alt="avatar" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
            <button onClick={handleLogout} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Logout</button>
          </div>
        ) : (
          <button onClick={handleLogin} style={{ background: '#24292e', color: '#fff', border: '1px solid #475569', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Login with GitHub
          </button>
        )}
      </div>

      <h1 className="main-title">GitHub Profile Analyzer</h1>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter GitHub Username to search..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>

      {loading && <p style={{ color: '#38bdf8' }}>Analyzing profile & loading graphs...</p>}
      {error && <p className="error-msg">{error}</p>}

      {profileData && (
        <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
          <div className="profile-card">
            <div className="profile-header">
              <img src={profileData.avatar_url} alt="Avatar" className="avatar" />
              <div className="profile-info">
                <h2>{profileData.name || profileData.login}</h2>
                <p>@{profileData.login}</p>
              </div>
            </div>

            <p className="bio">{profileData.bio || 'No bio available for this profile.'}</p>

            <div className="stats-grid">
              <div className="stat-item">
                <span>Followers</span>
                <strong>{profileData.followers}</strong>
              </div>
              <div className="stat-item">
                <span>Following</span>
                <strong>{profileData.following}</strong>
              </div>
              <div className="stat-item">
                <span>Repositories</span>
                <strong>{profileData.public_repos}</strong>
              </div>
            </div>

            <a href={profileData.html_url} target="_blank" rel="noreferrer" className="visit-btn">
              View GitHub Profile
            </a>
          </div>

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '20px', width: '100%' }}>
            <h3 style={{ color: '#f8fafc', marginBottom: '15px', fontSize: '1.1rem', textAlign: 'center' }}>Profile Overview Chart</h3>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
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