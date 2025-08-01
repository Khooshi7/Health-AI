import React, { useState } from 'react';
import axios from 'axios';
import './MainApp.css';

function MainApp({ onBack }) {
  const [symptoms, setSymptoms] = useState('');
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/predict', {
        symptoms,
        pincode
      });
      setResult(res.data);
    } catch (err) {
      setError('Could not connect to backend. Make sure Flask is running!');
    }
  };

  // Helper to safely render plans
  const renderPlan = (plan, isWorkout = false) => {
    if (!plan || typeof plan !== 'object' || Array.isArray(plan)) return <p>No plan generated</p>;
    const days = Object.entries(plan);
    if (days.length === 0) return <p>No plan generated</p>;
    return days.map(([day, details]) => (
      <div key={day} className="day-plan">
        <h4>Day {day}</h4>
        {isWorkout ? (
          <p>🏋️ {details}</p>
        ) : (
          <ul>
            <li>🍳 Breakfast: {details.breakfast}</li>
            <li>🍲 Lunch: {details.lunch}</li>
            <li>🍛 Dinner: {details.dinner}</li>
          </ul>
        )}
      </div>
    ));
  };

  // Helper to safely map arrays
  const safeMap = (arr, fn) => Array.isArray(arr) ? arr.map(fn) : null;

  return (
    <div className="container">
      <button className="back-btn" onClick={onBack}>← Back to Home</button>
      <h1>💊 AI Health Recommendation</h1>
      
      <form onSubmit={handleSubmit} className="input-form">
        <input
          value={symptoms}
          onChange={e => setSymptoms(e.target.value)}
          placeholder="Enter symptoms (comma separated)..."
          required
        />
        <input
          value={pincode}
          onChange={e => setPincode(e.target.value)}
          placeholder="Enter your pincode..."
          required
        />
        <button type="submit">Get Recommendations</button>
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="results">
          <h2>🩺 Disease: {result.disease}</h2>
          <p className="description">{result.description}</p>

          <div className="section">
            <h3>💊 Recommended Medications</h3>
            <ul>
              {safeMap(result.medications, (med, i) => 
                <li key={i}>{med}</li>
              ) || <li>No medications recommended</li>}
            </ul>
          </div>

          <div className="section">
            <h3>⚠️ Precautions</h3>
            <ul>
              {safeMap(result.precautions, (prec, i) => 
                <li key={i}>{prec}</li>
              ) || <li>No precautions listed</li>}
            </ul>
          </div>

          <div className="section">
            <h3>🥗 AI-Generated Diet Plan</h3>
            <div className="plan-grid">
              {renderPlan(result.diet)}
            </div>
          </div>

          <div className="section">
            <h3>🏋️ AI-Generated Workout Plan</h3>
            <div className="plan-grid">
              {renderPlan(result.workout, true)}
            </div>
          </div>

          <div className="section">
            <h3>🗓️ Add to Calendar</h3>
            <div className="calendar-links">
              {safeMap(result.calendar_links, (link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="calendar-btn"
                >
                  Day {Math.ceil((index+1)/2)} {index % 2 === 0 ? '☀️ Morning' : '🍳 Breakfast'}
                </a>
              )) || <span>No calendar links</span>}
            </div>
          </div>

          <div className="section">
            <h3>🏪 Nearby Pharmacies</h3>
            <ul>
              {safeMap(result.pharmacies, (ph, i) => (
                <li key={i}>
                  <b>{ph["Medical Store Name"]}</b> - {ph.Address}
                </li>
              )) || <li>No pharmacies found</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainApp;
