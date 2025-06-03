require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const User = require('./models/User'); // Modelo de utilizador, apenas para testes

const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Escolhe a connection string certa
const mongoUri = process.env.USE_DOCKER === 'true'
  ? process.env.MONGODB_URI_DOCKER
  : process.env.MONGODB_URI_LOCAL;

console.log(`A ligar ao MongoDB com a string: ${mongoUri}`);

// Conexão com o MongoDB
mongoose.connect(mongoUri, {
  retryWrites: true,
  w: "majority"
})
.then(() => console.log('Conectado ao MongoDB com sucesso!'))
.catch(err => {
  console.error('Erro na conexão com MongoDB:', err.message);
  console.error('Stack trace:', err.stack);
});
  
// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo à API de autenticação',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login'
    }
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Rota temporária para listar todos os utilizadores (apenas para testes) 
// http://localhost:4000/api/users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // exclui o campo password
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});