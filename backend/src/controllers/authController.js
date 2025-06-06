// backend\src\controllers\authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');



// Registrar novo user e devolver token JWT para autenticação automática
exports.register = async (req, res) => {
  try {
    const { name, email, password, tipo } = req.body;

    // Verificar duplicação de e-mail
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'E-mail já está em uso.' });
    }

    // Criar utilizador (presume-se que a encriptação da palavra-passe ocorre no modelo)
    const user = await User.create({ name, email, password, tipo });

    // Ocultar palavra-passe no retorno (boas práticas)
    user.password = undefined;

    // Gerar token JWT
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      tipo: user.tipo,
      name: user.name,
      curso: user.curso,
      uc: user.uc
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );


    return res.status(201).json({ user, token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};




// Login do utilizador e devolução de token JWT
exports.login = async (req, res) => {
  console.log('LOGIN BODY:', req.body);

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    console.log('UTILIZADOR ENCONTRADO:', user);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('PALAVRA-PASSE CORRESPONDE:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: user._id, tipo: user.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        tipo: user.tipo
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};


// Obter perfil do utilizador autenticado
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
