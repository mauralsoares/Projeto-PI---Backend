// backend\src\middleware\authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');


/*
 * Middleware de autenticação JWT.
 * Verifica a validade do token e passa o utilizador descodificado no `req`.
 * Permite controlo op de permissões por tipo de utilizador (ex: 'adminlson', 'user').
 *
 * @param {Array} tiposPermitidos - Lista de tipos de utilizador autorizados a aceder à rota.
 */
module.exports = function autenticar(...tiposPermitidos) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Formato de token inválido' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

       // ⚠️ Vai buscar o utilizador completo à base de dados
      const user = await User.findById(decoded.id).select('-password'); // exclui a password por segurança

      if (!user) {
        return res.status(404).json({ error: 'Utilizador não encontrado' });
      }

      // Verifica se o tipo de utilizador está autorizado (caso tenha sido especificado)
      if (
        tiposPermitidos.length > 0 &&
        !tiposPermitidos.includes(decoded.tipo)
      ) {
        return res.status(403).json({
          error: `Acesso proibido para o tipo de utilizador: '${decoded.tipo}'`
        });
      }

      req.user = decoded; // Injeta o utilizador no pedido
      next();
    } catch (err) {
      console.error('🔒 Erro de autenticação:', err.message);
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  };
};


// Exemplod e usos

// PERMITIR QUALQUER AUTH USER:
// const autenticar = require('../middlewares/authMiddleware');
// app.get('/api/profile', autenticar(), controllerDoPerfil);

// PERMITIR APENAS ADMIN:
// const autenticar = require('../middlewares/authMiddleware');
// app.delete('/api/admin/users/:id', autenticar('admin'), eliminarUtilizador);

//PERMITIR APENAS ESTUDANTES E DOCENTES:
// const autenticar = require('../middlewares/authMiddleware');
// app.get('/api/aulas', autenticar('estudante', 'docente'), listarAulas);
