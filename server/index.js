const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }

        const token = jwt.sign(
          { id: this.lastID, username, email },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: this.lastID, username, email }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
});

// Add charge endpoint
app.post('/api/charges', authenticateToken, (req, res) => {
  const { category, description, amount, units, delay_hours, minutes_late } = req.body;
  const userId = req.user.id;

  if (!category || !description || !amount || !units) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO charges (user_id, category, description, amount, units, delay_hours, minutes_late) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, category, description, amount, units, delay_hours, minutes_late],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error adding charge' });
      }

      res.status(201).json({
        message: 'Charge added successfully',
        charge: {
          id: this.lastID,
          category,
          description,
          amount,
          units,
          delay_hours,
          minutes_late
        }
      });
    }
  );
});

// Get all charges for the authenticated user
app.get('/api/charges', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT * FROM charges WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, charges) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching charges' });
      }

      res.json({ charges });
    }
  );
});

// Get summary/totals for the authenticated user
app.get('/api/charges/summary', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT category, SUM(amount) as total, units, COUNT(*) as count FROM charges WHERE user_id = ? GROUP BY category, units',
    [userId],
    (err, summary) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching summary' });
      }

      res.json({ summary });
    }
  );
});

// Delete charge endpoint
app.delete('/api/charges/:id', authenticateToken, (req, res) => {
  const chargeId = req.params.id;
  const userId = req.user.id;

  db.run(
    'DELETE FROM charges WHERE id = ? AND user_id = ?',
    [chargeId, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error deleting charge' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Charge not found' });
      }

      res.json({ message: 'Charge deleted successfully' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
