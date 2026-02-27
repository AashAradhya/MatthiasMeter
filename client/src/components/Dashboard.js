import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddCharge from './AddCharge';

function Dashboard({ user, onLogout }) {
  const [charges, setCharges] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [chargesRes, summaryRes] = await Promise.all([
        axios.get('/api/charges'),
        axios.get('/api/charges/summary')
      ]);

      setCharges(chargesRes.data.charges);
      setSummary(summaryRes.data.summary);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChargeAdded = () => {
    setShowAddForm(false);
    fetchData();
  };

  const handleDelete = async (chargeId) => {
    if (!window.confirm('Are you sure you want to delete this charge?')) {
      return;
    }

    try {
      await axios.delete(`/api/charges/${chargeId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting charge:', error);
      alert('Failed to delete charge');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getTotalDollars = () => {
    return summary
      .filter(item => item.units === 'USD')
      .reduce((sum, item) => sum + item.total, 0);
  };

  const getTotalGold = () => {
    const goldItem = summary.find(item => item.units === 'SPDR Gold');
    return goldItem ? goldItem.total : 0;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>MatthiasMeter</h1>
        </div>
        <p style={{ color: 'white', textAlign: 'center' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>MatthiasMeter</h1>
        <div className="header-info">
          <span>Welcome, <strong>{user.username}</strong></span>
          <button onClick={onLogout} className="btn" style={{ width: 'auto', padding: '8px 20px' }}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard">
        {/* Rate Card Info */}
        <div className="card">
          <h2>Rate Card</h2>
          <div className="rate-card">
            <h3>Matthias's Accountability Rates:</h3>
            <ul>
              <li><strong>Missed Messages:</strong> $10 for every 2 hours of delay</li>
              <li><strong>Late to Meetings:</strong> $2 per minute joined late</li>
              <li><strong>Failed Notebook Actions:</strong> 1 unit of SPDR Gold Trust per action</li>
            </ul>
          </div>
        </div>

        {/* Summary */}
        <div className="card">
          <h2>What Matthias Owes You</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <h3>Total in USD</h3>
              <div className="amount">${getTotalDollars().toFixed(2)}</div>
              <div className="count">
                {summary.filter(s => s.units === 'USD').reduce((sum, s) => sum + s.count, 0)} charges
              </div>
            </div>
            <div className="summary-item">
              <h3>SPDR Gold Trust</h3>
              <div className="amount">{getTotalGold().toFixed(2)}</div>
              <div className="count">
                {summary.find(s => s.units === 'SPDR Gold')?.count || 0} actions
              </div>
            </div>
            {summary.map((item, idx) => (
              <div key={idx} className="summary-item">
                <h3>{item.category}</h3>
                <div className="amount">
                  {item.units === 'USD' ? `$${item.total.toFixed(2)}` : `${item.total.toFixed(2)} ${item.units}`}
                </div>
                <div className="count">{item.count} entries</div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Charge */}
        <div className="card">
          <h2>Add New Charge</h2>
          {!showAddForm ? (
            <button onClick={() => setShowAddForm(true)} className="btn">
              + Add Charge
            </button>
          ) : (
            <AddCharge
              onChargeAdded={handleChargeAdded}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </div>

        {/* All Charges */}
        <div className="card">
          <h2>All Charges ({charges.length})</h2>
          <div className="charges-list">
            {charges.length === 0 ? (
              <div className="no-charges">
                No charges yet. Start by adding your first charge above!
              </div>
            ) : (
              charges.map((charge) => (
                <div key={charge.id} className="charge-item">
                  <div className="charge-info">
                    <h4>{charge.category}</h4>
                    <p>{charge.description}</p>
                    {charge.delay_hours && (
                      <p style={{ fontSize: '12px', color: '#999' }}>
                        Delay: {charge.delay_hours} hours
                      </p>
                    )}
                    {charge.minutes_late && (
                      <p style={{ fontSize: '12px', color: '#999' }}>
                        Minutes late: {charge.minutes_late}
                      </p>
                    )}
                  </div>
                  <div className="charge-amount">
                    <div className="value">
                      {charge.units === 'USD' ? `$${charge.amount.toFixed(2)}` : `${charge.amount} ${charge.units}`}
                    </div>
                    <div className="date">{formatDate(charge.created_at)}</div>
                    <button
                      onClick={() => handleDelete(charge.id)}
                      className="btn btn-danger"
                      style={{ marginTop: '8px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
