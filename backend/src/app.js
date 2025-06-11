require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('../src/config/db');
const { connectGridFS } = require('../src/config/gridfs');
const authRoutes = require('../src/routes/authRoutes');
const User = require('../src/models/User');
const listRoutes = require('./routes/listRoutes');
const studySpotRoutes = require('./routes/studySpotRoutes');


const app = express();

// 🔧 Middleware
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
        mensagem: 'Bem-vindo à API do Projeto PI',
        endpoints: {
          registo: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          utilizadores: 'GET /api/users',
          upload: 'POST /api/uploads',
          download: 'GET /api/uploads/:id',
          visualizarFicheiro: 'GET /api/uploads/view/:id',
          pesquisarFicheiros: 'GET /api/files?curso=...&uc=...&tipo=...&descricao=...&page=1&limit=8'
        }
      });
    });

    // 📋 Rotas para listas (UCs, cursos, filetypes) 
    app.use('/api/lists', listRoutes);

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

    //📤📩 Rotas de upload e downlaod  de ficheiros (GridFS)
    const fileRoutes = require('./routes/fileRoutes');
    app.use('/api/uploads', fileRoutes);

    // 📄🔎 Rotas de pesquisa/listagem de ficheiros
    const fileSearchRoutes = require('./routes/fileSearchRoutes');
    app.use('/api/files', fileSearchRoutes);

    // 📍 Rotas para spots de estudo
    app.use('/api/studyspots', studySpotRoutes);

    // --DEBUG--
    // 👌Rota de teste para verificar ligação entre containers;
    app.get('/api/test', (req, res) => {
      res.json({ mensagem: 'Ligação entre containers está a bombar!💣' });
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
