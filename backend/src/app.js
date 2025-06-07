// src/app.js
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('../src/config/db');
const { connectGridFS } = require('../src/config/gridfs');
const authRoutes = require('../src/routes/authRoutes');
const User = require('../src/models/User');

const app = express();

// 🔧 Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));



// 🧠 Arranque com ligação à BD e GridFS
const startServer = async () => {
  try {
    const connection = await connectDB();        // Espera pela ligação
    connectGridFS(connection.connection.db);      // Passa a ligação com conn.db

    // 🌐 Rotas principais
    app.get('/', (req, res) => {
      res.json({
        mensagem: 'Bem-vindo à API de autenticação',
        endpoints: {
          registo: 'POST /api/auth/register',
          login: 'POST /api/auth/login'
        }
      });
    });

    // Ignorar pedidos ao favicon (evita erro 404 no browser)
    app.get('/favicon.ico', (req, res) => res.status(204).end());

    // 🔐 Rotas de autenticação
    app.use('/api/auth', authRoutes);

    app.get('/api/users', async (req, res) => {
      try {
        const users = await User.find({}, '-password');
        res.json(users);
      } catch (err) {
        res.status(500).json({ erro: err.message });
      }
    });

    // 📁 Rotas de upload e downlaod de ficheiros (GridFS)
    const fileRoutes = require('./routes/fileRoutes');
    app.use('/api/uploads', fileRoutes);

    // logo após app.use('/api/uploads', fileRoutes);
    app.get('/api/test', (req, res) => {
      res.json({ mensagem: 'Ligação entre containers está funcional!' });
    });



    // 🚀 Inicia o servidor
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor activo na porta ${PORT}`);
    });

  } catch (error) {
    console.error('🔴 Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
};

startServer();


























// // app.js
// require('dotenv').config(); // Carrega as variáveis do .env
// const express = require('express');
// const morgan = require('morgan');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const connectDB = require('../src/config/db'); // Função para ligar ao MongoDB
// const { connectGridFS } = require('../src/config/gridfs'); // Função para iniciar o GridFS
// const authRoutes = require('../src/routes/authRoutes');
// const User = require('../src/models/User');

// const app = express();

// // 🔧 Middleware
// app.use(cors({
//   origin: 'http://localhost:5173', // Frontend local
//   credentials: true
// }));
// app.use(express.json()); // Suporte a JSON
// app.use(morgan('dev')); // Log HTTP

// // 🌐 Rota de raiz
// app.get('/', (req, res) => {
//   res.json({
//     mensagem: 'Bem-vindo à API de autenticação',
//     endpoints: {
//       registo: 'POST /api/auth/register',
//       login: 'POST /api/auth/login'
//     }
//   });
// });

// // 🔐 Rotas protegidas
// app.use('/api/auth', authRoutes);

// // Rota temporária de debug
// app.get('/api/users', async (req, res) => {
//   try {
//     const users = await User.find({}, '-password');
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ erro: err.message });
//   }
// });

// // 🟢 Ligação à base de dados + GridFS + servidor
// const PORT = process.env.PORT || 4000;

// connectDB()
//   .then(() => {
//     connectGridFS(mongoose.connection); // Usa a ligação ativa do mongoose
//     app.listen(PORT, () => {
//       console.log(`🚀 Servidor activo na porta ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error('🔴 Falha ao iniciar o servidor:', err.message);
//     process.exit(1);
//   });
