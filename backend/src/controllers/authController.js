const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');



// Registrar novo user e devolver token JWT para autenticação automática
exports.register = async (req, res) => {
  try {
    // Extrair dados do corpo do pedido
    const { name, email, password, tipo } = req.body;
    
    // Verificar se já existe utilizador com este email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    // Criar novo utilizador
    const user = await User.create({ name, email, password, tipo });
    
    // Remover a password do objeto de retorno
    user.password = undefined;

    // Gerar token JWT para autenticação automática
    const token = jwt.sign(
      { id: user._id, tipo: user.tipo }, // payload do token
      process.env.JWT_SECRET,            // chave secreta
      { expiresIn: '24h' }                // validade do token
    );

    // Responder com o utilizador criado e o token JWT
    res.status(201).json({ user, token });
  } catch (error) {
    // Em caso de erro, responder com mensagem de erro
    res.status(500).json({ error: error.message });
  }
};



// Login do usuário
exports.login = async (req, res) => {
   console.log('LOGIN BODY:', req.body); // <-- Adiciona isto
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user._id, tipo: user.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, tipo: user.tipo } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obter perfil do utilizador autenticado
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};