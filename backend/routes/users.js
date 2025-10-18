const express = require('express');
const router = express.Router();
const pool = require('../db');

// 📌 Crear usuario (por defecto EXTERNO)
router.post('/', async (req, res) => {
  const { full_name, email, phone, school, type } = req.body;
  try {
    const userType = type || 'EXTERNO'; // Si no se envía "type", asumimos "EXTERNO"
    const [result] = await pool.query(
      'INSERT INTO users (type, full_name, email, phone, school) VALUES (?, ?, ?, ?, ?)',
      [userType, full_name, email, phone || null, school || null]
    );
    res.json({ id: result.insertId, message: 'Usuario creado correctamente' });
  } catch (err) {
    console.error('Error creando usuario:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, type, phone, school FROM users ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo usuarios:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📌 (Opcional) Obtener usuarios por tipo
router.get('/type/:type', async (req, res) => {
  const { type } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE type = ?', [type.toUpperCase()]);
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo usuarios por tipo:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Actualizar usuario
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone, school, type } = req.body;
  try {
    await pool.query(
      'UPDATE users SET full_name=?, email=?, phone=?, school=?, type=? WHERE id=?',
      [full_name, email, phone, school, type, id]
    );
    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Eliminar usuario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
