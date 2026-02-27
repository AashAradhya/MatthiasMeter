import React, { useState } from 'react';
import axios from 'axios';

function AddCharge({ onChargeAdded, onCancel }) {
  const [category, setCategory] = useState('Missed Message');
  const [description, setDescription] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [delayHours, setDelayHours] = useState('');
  const [minutesLate, setMinutesLate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateAmount = () => {
    switch (category) {
      case 'Missed Message':
        // $10 for every 2 hours
        return delayHours ? (parseFloat(delayHours) / 2) * 10 : 0;
      case 'Late to Meeting':
        // $2 per minute
        return minutesLate ? parseFloat(minutesLate) * 2 : 0;
      case 'Failed Notebook Action':
        // 1 unit of SPDR Gold Trust per action
        return 1;
      default:
        return 0;
    }
  };

  const getUnits = () => {
    return category === 'Failed Notebook Action' ? 'SPDR Gold' : 'USD';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const amount = customAmount ? parseFloat(customAmount) : calculateAmount();

    if (amount <= 0) {
      setError('Please enter valid delay/late time or custom amount');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/charges', {
        category,
        description: description || getDefaultDescription(),
        amount,
        units: getUnits(),
        delay_hours: delayHours ? parseFloat(delayHours) : null,
        minutes_late: minutesLate ? parseInt(minutesLate) : null
      });

      onChargeAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add charge');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultDescription = () => {
    switch (category) {
      case 'Missed Message':
        return `Message delayed by ${delayHours} hours`;
      case 'Late to Meeting':
        return `Joined meeting ${minutesLate} minutes late`;
      case 'Failed Notebook Action':
        return 'Notebook action not completed';
      default:
        return '';
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setDelayHours('');
              setMinutesLate('');
              setCustomAmount('');
            }}
            disabled={loading}
          >
            <option value="Missed Message">Missed Message</option>
            <option value="Late to Meeting">Late to Meeting</option>
            <option value="Failed Notebook Action">Failed Notebook Action</option>
          </select>
        </div>

        {category === 'Missed Message' && (
          <div className="form-group">
            <label>Delay in Hours ($10 per 2 hours)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={delayHours}
              onChange={(e) => setDelayHours(e.target.value)}
              disabled={loading}
              placeholder="e.g., 4 hours"
            />
            {delayHours && (
              <p style={{ color: '#667eea', fontSize: '14px', marginTop: '5px' }}>
                Calculated: ${calculateAmount().toFixed(2)}
              </p>
            )}
          </div>
        )}

        {category === 'Late to Meeting' && (
          <div className="form-group">
            <label>Minutes Late ($2 per minute)</label>
            <input
              type="number"
              min="0"
              value={minutesLate}
              onChange={(e) => setMinutesLate(e.target.value)}
              disabled={loading}
              placeholder="e.g., 15 minutes"
            />
            {minutesLate && (
              <p style={{ color: '#667eea', fontSize: '14px', marginTop: '5px' }}>
                Calculated: ${calculateAmount().toFixed(2)}
              </p>
            )}
          </div>
        )}

        {category === 'Failed Notebook Action' && (
          <p style={{ color: '#667eea', fontSize: '14px', margin: '10px 0' }}>
            This will add 1 unit of SPDR Gold Trust
          </p>
        )}

        <div className="form-group">
          <label>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows="3"
            placeholder="Add details about this charge..."
          />
        </div>

        <div className="form-group">
          <label>Custom Amount (override calculated amount)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            disabled={loading}
            placeholder="Leave empty to use calculated amount"
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Adding...' : 'Add Charge'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default AddCharge;
