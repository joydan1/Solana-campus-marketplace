// user.js
const express = require('express');
const router = express.Router();

let users = [
  { id: 1, name: 'Joy', email: 'joy@example.com' },
  { id: 2, name: 'Chidinma', email: 'chidinma@example.com' }
];

// GET all users
router.get('/', (req, res) => {
  res.json(users);
});

// GET a single user by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id === parseInt(id));

  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST (register) a new user
router.post('/', (req, res) => {
  const { name, email } = req.body;
  const newUser = {
    id: users.length + 1,
    name,
    email
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT (update) a user
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const user = users.find(u => u.id === parseInt(id));

  if (!user) return res.status(404).json({ error: 'User not found' });

  user.name = name || user.name;
  user.email = email || user.email;

  res.json(user);
});

// DELETE a user
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === parseInt(id));

  if (index === -1) return res.status(404).json({ error: 'User not found' });

  const deletedUser = users.splice(index, 1);
  res.json({ message: 'User deleted', deleted: deletedUser });
});

// Export router
module.exports = router;
