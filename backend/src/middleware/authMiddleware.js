// backend\src\middleware\authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');


/*
 * Middleware de autenticação JWT.
 * Verifica a validade do token e passa o utilizador descodificado no `req`.
 * Permite controlo de permissões por tipo de utilizador (ex: 'admilson', 'user').
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

      // Vai buscar o utilizador completo à base de dados
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'Utilizador não encontrado' });
      }

      // Regra especial: só este user é admin
      const isSuperAdmin =
        user.email === 'admin@iscte-iul.pt' && user.tipo === 'adminlson';

      // Se a rota requer admin, só deixa passar o super adminlson
      if (
        tiposPermitidos.length > 0 &&
        tiposPermitidos.includes('admin') &&
        !isSuperAdmin
      ) {
        return res.status(403).json({
          error: `Acesso restrito ao administrador principal.`
        });
      }

      // Para outros tipos, verifica normalmente
      if (
        tiposPermitidos.length > 0 &&
        !tiposPermitidos.includes(user.tipo) &&
        !isSuperAdmin // já passou acima se for admin
      ) {
        return res.status(403).json({
          error: `Acesso proibido para o tipo de utilizador: '${user.tipo}'`
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
