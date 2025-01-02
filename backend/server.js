const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'acedb'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Existing login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  console.log('Login attempt:', { username, password });

  const query = `
    SELECT u.*, f.id as faculty_id 
    FROM users u 
    LEFT JOIN faculty f ON u.id = f.user_id 
    WHERE u.username = ? AND u.password = ?
  `;

  db.query(query, [username, password], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error occurred',
        error: err.message
      });
    }

    console.log('Query result:', result);

    if (result.length > 0) {
      const response = {
        success: true,
        message: 'Login successful',
        role: result[0].role,
        user_id: result[0].id,
        faculty_id: result[0].faculty_id || null
      };
      console.log('Sending response:', response);
      res.json(response);
    } else {
      res.json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
  });
});

// New endpoint to get faculty events
app.get('/api/faculty-events/:facultyId', (req, res) => {
  const facultyId = req.params.facultyId;
  const query = 'SELECT * FROM events WHERE faculty_id = ?';
  
  db.query(query, [facultyId], (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ success: false, message: 'Error fetching events' });
    }
    res.json({ success: true, events: results });
  });
});

// Add new event
app.post('/api/events', (req, res) => {
  const { event_name, date, faculty_id, student_name, section_id } = req.body;
  const query = 'INSERT INTO events (event_name, date, faculty_id, student_name, section_id) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [event_name, date, faculty_id, student_name, section_id], (err, result) => {
    if (err) {
      console.error('Error adding event:', err);
      return res.status(500).json({ success: false, message: 'Error adding event' });
    }
    res.json({ success: true, message: 'Event added successfully', eventId: result.insertId });
  });
});

// Update event
app.put('/api/events/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  const { event_name, date, student_name, section_id } = req.body;
  const query = 'UPDATE events SET event_name = ?, date = ?, student_name = ?, section_id = ? WHERE id = ?';
  
  db.query(query, [event_name, date, student_name, section_id, eventId], (err) => {
    if (err) {
      console.error('Error updating event:', err);
      return res.status(500).json({ success: false, message: 'Error updating event' });
    }
    res.json({ success: true, message: 'Event updated successfully' });
  });
});

// Delete event
app.delete('/api/events/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  const query = 'DELETE FROM events WHERE id = ?';
  
  db.query(query, [eventId], (err) => {
    if (err) {
      console.error('Error deleting event:', err);
      return res.status(500).json({ success: false, message: 'Error deleting event' });
    }
    res.json({ success: true, message: 'Event deleted successfully' });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});