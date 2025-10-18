const express = require('express');
const router = express.Router();
const pool = require('../db');
const { sendConfirmationEmail } = require('../utils/mailer');



// ✅ Obtener todas las actividades
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM activities ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error obteniendo actividades:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Obtener una actividad por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM activities WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Actividad no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error obteniendo actividad:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Crear actividad
router.post('/', async (req, res) => {
  try {
    const { title, kind, location, day, hour } = req.body;
    const currentYear = new Date().getFullYear();

    const [result] = await pool.query(
      'INSERT INTO activities (title, kind, location, day, hour, year) VALUES (?, ?, ?, ?, ?, ?)',
      [title, kind, location, day || null, hour || null, currentYear]
    );

    res.json({ id: result.insertId, message: 'Actividad creada correctamente' });
  } catch (err) {
    console.error('❌ Error creando actividad:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Actualizar
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, kind, location, day, hour } = req.body;

    await pool.query(
      'UPDATE activities SET title=?, kind=?, location=?, day=?, hour=? WHERE id=?',
      [title, kind, location, day || null, hour || null, id]
    );

    res.json({ message: 'Actividad actualizada correctamente' });
  } catch (err) {
    console.error('❌ Error actualizando actividad:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Eliminar
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM activities WHERE id=?', [id]);
    res.json({ message: 'Actividad eliminada' });
  } catch (err) {
    console.error('❌ Error eliminando actividad:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Registro rápido
router.post('/quick-register', async (req, res) => {
  try {
    const { full_name, type, email, phone, activity_id } = req.body;

    if (!full_name || !type || !email || !phone || !activity_id) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Guardar en base de datos
    const [result] = await pool.query(
      'INSERT INTO quick_registrations (full_name, type, email, phone, activity_id) VALUES (?, ?, ?, ?, ?)',
      [full_name, type, email, phone, activity_id]
    );

    // Buscar datos de la actividad
    const [activityRows] = await pool.query('SELECT * FROM activities WHERE id = ?', [activity_id]);
    const activity = activityRows[0];

    // Enviar correo con QR y enlace
    await sendConfirmationEmail(email, full_name, activity);

    res.json({ message: 'Registro exitoso y correo enviado 🚀' });
  } catch (err) {
    console.error('Error al registrar o enviar correo:', err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
