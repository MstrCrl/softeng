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
  const query = `
    SELECT u.*, f.id as faculty_id, f.name as faculty_name 
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

    if (result.length > 0) {
      const response = {
        success: true,
        message: 'Login successful',
        role: result[0].role,
        user_id: result[0].id,
        faculty_id: result[0].faculty_id || null,
        faculty_name: result[0].faculty_name || null, // Fix: Include faculty_name
        username: result[0].username || null
      };
      console.log(response);
      res.json(response);
      
    } else {
      res.json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
  });
});


// HOME PAGE SA PROFILE
// Update these endpoints in your server.js
// Add these endpoints to your server.js

// Endpoint to get student profile
// Endpoint to get student profile
app.get('/api/student-profile/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT s.*, u.username, u.password, sec.name as section_name, sec.id as section_id 
    FROM students s 
    JOIN users u ON s.user_id = u.id 
    JOIN sections sec ON s.section_id = sec.id 
    WHERE s.user_id = ?`;

  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
    if (result.length > 0) {
      res.json({ success: true, data: result[0] });
    } else {
      res.status(404).json({ success: false, message: 'Student not found' });
    }
  });
});

// Endpoint to update student profile
app.put('/api/student-profile/:userId', (req, res) => {
  const userId = req.params.userId;
  const { name, section_id, username, password } = req.body;

  // Start a transaction
  db.beginTransaction(async (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Transaction error', error: err.message });
    }

    try {
      // Update users table
      await db.promise().query(
        'UPDATE users SET username = ?, password = ? WHERE id = ?',
        [username, password, userId]
      );

      // Update students table
      await db.promise().query(
        'UPDATE students SET name = ?, section_id = ? WHERE user_id = ?',
        [name, section_id, userId]
      );

      // Commit transaction
      db.commit((err) => {
        if (err) {
          throw err;
        }
        res.json({ success: true, message: 'Profile updated successfully' });
      });
    } catch (error) {
      // Rollback on error
      db.rollback(() => {
        res.status(500).json({ success: false, message: 'Update failed', error: error.message });
      });
    }
  });
});

// faculty profile
// Get faculty profile
app.get('/api/faculty/profile/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT f.name, f.status, u.username
    FROM faculty f
    JOIN users u ON f.user_id = u.id
    WHERE u.id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error occurred',
        error: err.message
      });
    }

    if (results.length > 0) {
      res.json({
        success: true,
        data: results[0]
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
  });
});

// Update faculty profile
app.put('/api/faculty/profile/:userId', (req, res) => {
  const userId = req.params.userId;
  const { name, username, password, status } = req.body;

  db.beginTransaction(async (err) => {
    if (err) throw err;

    try {
      // Update faculty table
      await db.promise().query(
        'UPDATE faculty SET name = ?, status = ? WHERE user_id = ?',
        [name, status, userId]
      );

      // Update users table
      const userUpdate = password
        ? 'UPDATE users SET username = ?, password = ? WHERE id = ?'
        : 'UPDATE users SET username = ? WHERE id = ?';
      const userParams = password
        ? [username, password, userId]
        : [username, userId];

      await db.promise().query(userUpdate, userParams);

      db.commit((err) => {
        if (err) {
          return db.rollback(() => {
            throw err;
          });
        }
        res.json({
          success: true,
          message: 'Profile updated successfully'
        });
      });
    } catch (error) {
      return db.rollback(() => {
        res.status(500).json({
          success: false,
          message: 'Error updating profile',
          error: error.message
        });
      });
    }
  });
});







// COMMENT 
// COMMENT
// COMMENT
// Get comments for an event
app.get('/api/comments/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  const query = `
    SELECT c.*, u.username, s.name as student_name 
    FROM comments c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN students s ON u.id = s.user_id
    WHERE c.event_id = ?
    ORDER BY c.created_at DESC`;

  db.query(query, [eventId], (err, result) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching comments', 
        error: err.message 
      });
    }
    res.json({ success: true, data: result });
  });
});

// Add a new comment
app.post('/api/comments', (req, res) => {
  const { event_id, user_id, comment_text } = req.body;
  
  const query = 'INSERT INTO comments (event_id, user_id, comment_text) VALUES (?, ?, ?)';
  
  db.query(query, [event_id, user_id, comment_text], (err, result) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error adding comment', 
        error: err.message 
      });
    }
    res.json({ 
      success: true, 
      message: 'Comment added successfully', 
      data: { id: result.insertId } 
    });
  });
});




// New endpoint to get faculty events
app.get('/api/faculty-events/:facultyId', (req, res) => {
  const facultyId = req.params.facultyId;
  const query = `
    SELECT e.*, s.name as section_name 
    FROM events e
    LEFT JOIN sections s ON e.section_id = s.id 
    WHERE e.faculty_id = ?
  `;
  
  db.query(query, [facultyId], (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ success: false, message: 'Error fetching events' });
    }
    console.log('Events fetched:', results); // Add this to debug
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

// fetch section name
app.get('/api/sections', (req, res) => {
  const query = 'SELECT id, name FROM sections ORDER BY name';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching sections:', err);
      return res.status(500).json({ success: false, message: 'Error fetching sections' });
    }
    console.log('Sections fetched:', results); // Add this to debug
    res.json({ success: true, sections: results });
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


// ARCHIVE
// Add this endpoint to check and archive past events
app.post('/api/check-archive', (req, res) => {
  const query = `
    INSERT INTO archive (event_name, date, faculty_id, student_name, section_id)
    SELECT event_name, date, faculty_id, student_name, section_id 
    FROM events 
    WHERE date < CURDATE();
  `;

  const deleteQuery = `
    DELETE FROM events 
    WHERE date < CURDATE();
  `;

  // First insert into archive
  db.query(query, (err, insertResult) => {
    if (err) {
      console.error('Error archiving events:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error archiving events' 
      });
    }

    // Then delete from events
    db.query(deleteQuery, (err, deleteResult) => {
      if (err) {
        console.error('Error deleting archived events:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Error deleting archived events' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Events archived successfully',
        archivedCount: insertResult.affectedRows
      });
    });
  });
});
app.get('/api/archived-events/:facultyId', (req, res) => {
  const facultyId = req.params.facultyId;
  const query = `
    SELECT a.*, s.name as section_name 
    FROM archive a
    LEFT JOIN sections s ON a.section_id = s.id 
    WHERE a.faculty_id = ?
    ORDER BY a.date DESC
  `;
  
  db.query(query, [facultyId], (err, results) => {
    if (err) {
      console.error('Error fetching archived events:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching archived events' 
      });
    }
    console.log('Archived events fetched:', results); // Debug log
    res.json({ 
      success: true, 
      events: results 
    });
  });
});


// ADMIN //
// ADMIN //
// ADMIN //
// Get all users with their details
app.get('/api/users', (req, res) => {
  const query = `
    SELECT 
      u.id as user_id,
      u.username,
      u.role,
      COALESCE(f.name, s.name) as name,
      s.section_id,
      sec.name as section_name
    FROM users u
    LEFT JOIN faculty f ON u.id = f.user_id
    LEFT JOIN students s ON u.id = s.user_id
    LEFT JOIN sections sec ON s.section_id = sec.id
    ORDER BY u.role, COALESCE(f.name, s.name)
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ success: false, message: 'Error fetching users' });
    }
    res.json({ success: true, users: results });
  });
});

// Add new student using stored procedure
app.post('/api/users/student', (req, res) => {
  const { name, section_id, username, password } = req.body;
  
  const query = 'CALL AddStudent(?, ?, ?, ?)';
  db.query(query, [name, section_id, username, password], (err, result) => {
    if (err) {
      console.error('Error adding student:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error adding student',
        error: err.message 
      });
    }
    res.json({ 
      success: true, 
      message: 'Student added successfully'
    });
  });
});

// Add new faculty using stored procedure
// Add new faculty using stored procedure
app.post('/api/users/faculty', (req, res) => {
  const { name, username, password } = req.body;
  
  console.log('Attempting to add faculty:', { name, username }); // Log attempt
  
  if (!name || !username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  const query = 'CALL AddFaculty(?, ?, ?)';
  db.query(query, [name, username, password], (err, result) => {
    if (err) {
      console.error('Detailed faculty error:', {
        code: err.code,
        errno: err.errno,
        sqlMessage: err.sqlMessage,
        sqlState: err.sqlState,
        sql: err.sql
      });
      return res.status(500).json({ 
        success: false, 
        message: 'Error adding faculty',
        details: err.sqlMessage
      });
    }
    res.json({ 
      success: true, 
      message: 'Faculty added successfully'
    });
  });
});

// Delete user (this will cascade to faculty/student table due to foreign key)
app.delete('/api/users/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = 'DELETE FROM users WHERE id = ?';
  
  db.query(query, [userId], (err) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error deleting user',
        error: err.message 
      });
    }
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  });
});

// Add these new endpoints to your server.js

// Get all events (for admin)
app.get('/api/all-events', (req, res) => {
  const query = `
    SELECT e.*, f.name as faculty_name, s.name as section_name 
    FROM events e
    LEFT JOIN faculty f ON e.faculty_id = f.id
    LEFT JOIN sections s ON e.section_id = s.id
    ORDER BY e.date DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching all events:', err);
      return res.status(500).json({ success: false, message: 'Error fetching events' });
    }
    res.json({ success: true, events: results });
  });
});

// Get all archived events (for admin)
app.get('/api/all-archived-events', (req, res) => {
  const query = `
    SELECT a.*, f.name as faculty_name, s.name as section_name 
    FROM archive a
    LEFT JOIN faculty f ON a.faculty_id = f.id
    LEFT JOIN sections s ON a.section_id = s.id
    ORDER BY a.date DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching all archived events:', err);
      return res.status(500).json({ success: false, message: 'Error fetching archived events' });
    }
    res.json({ success: true, events: results });
  });
});

// Admin event management endpoints
app.post('/api/admin/events', (req, res) => {
  const { event_name, date, faculty_id, student_name, section_id } = req.body;
  
  // Validate required fields
  if (!event_name || !date || !faculty_id || !section_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields' 
    });
  }

  // Format date to MySQL format
  const formattedDate = new Date(date).toISOString().split('T')[0];
  
  const query = `
    INSERT INTO events 
    (event_name, date, faculty_id, student_name, section_id) 
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.query(query, [event_name, formattedDate, faculty_id, student_name, section_id], (err, result) => {
    if (err) {
      console.error('Error adding event:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error adding event',
        error: err.message 
      });
    }
    res.json({ 
      success: true, 
      message: 'Event added successfully', 
      eventId: result.insertId 
    });
  });
});

app.put('/api/admin/events/:eventId', (req, res) => {
  const eventId = req.params.eventId;
  const { event_name, date, faculty_id, student_name, section_id } = req.body;
  const query = 'UPDATE events SET event_name = ?, date = ?, faculty_id = ?, student_name = ?, section_id = ? WHERE id = ?';
  
  db.query(query, [event_name, date, faculty_id, student_name, section_id, eventId], (err) => {
    if (err) {
      console.error('Error updating event:', err);
      return res.status(500).json({ success: false, message: 'Error updating event' });
    }
    res.json({ success: true, message: 'Event updated successfully' });
  });
});

app.delete('/api/admin/events/:eventId', (req, res) => {
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


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});