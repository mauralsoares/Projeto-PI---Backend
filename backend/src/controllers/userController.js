const User = require('../models/User');

/**
 * Listar utilizadores com paginação (admin)
 * GET /api/users?page=1&limit=10
 */
exports.listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({}, '-password').skip(skip).limit(limit),
      User.countDocuments()
    ]);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar utilizadores: ' + err.message });
  }
};

/**
 * Listar todos os utilizadores (sem paginação, admin)
 * GET /api/users/all
 */
exports.listAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar utilizadores: ' + err.message });
  }
};

/**
 * Procurar utilizador por email (admin)
 * GET /api/users/email/:email
 */
exports.getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter utilizador: ' + err.message });
  }
};

/**
 * Ver perfil de um utilizador específico (admin)
 * GET /api/users/:id
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter utilizador: ' + err.message });
  }
};

/**
 * Editar dados de um utilizador (admin)
 * PATCH /api/users/:id
 * Só permite editar nome e tipo
 */
exports.updateUser = async (req, res) => {
  try {
    const { name, tipo } = req.body;
    const update = {};
    if (name) update.name = name;
    if (tipo) {
      const tiposPermitidos = ['adminlson', 'user'];
      if (!tiposPermitidos.includes(tipo)) {
        return res.status(400).json({ error: 'Tipo de utilizador inválido.' });
      }
      update.tipo = tipo;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar utilizador: ' + err.message });
  }
};

/**
 * Apagar um utilizador (admin)
 * DELETE /api/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado.' });
    res.json({ mensagem: 'Utilizador apagado com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao apagar utilizador: ' + err.message });
  }
};