// 📁 src/config/db.js

const mongoose = require('mongoose');

/**
 * 🔌 Conecta ao MongoDB (Atlas ou Docker, consoante configuração)
 *
 * Esta função verifica a variável de ambiente USE_DOCKER
 * e escolhe a string de ligação apropriada.
 * 
 * Retorna a ligação ativa (conn) para que possa ser usada pelo GridFS.
 * 
 * @returns {Promise<mongoose.Connection>} Ligação MongoDB ativa
 */
const connectDB = async () => {
  // 🧭 Determina a URI de ligação com base no ambiente (Docker vs Cloud)
  const mongoUri =
    process.env.USE_DOCKER === 'true'
      ? process.env.MONGODB_URI_DOCKER
      : process.env.MONGODB_URI_LOCAL;

  try {
    // 🟡 Informação de debug sobre o tipo de ligação escolhida
    console.log(`🟡 A ligar ao MongoDB (${process.env.USE_DOCKER === 'true' ? 'Docker' : 'Cloud'})`);

    // 🔐 Liga ao MongoDB com opções seguras e compatíveis
    const connection = await mongoose.connect(mongoUri, {
      retryWrites: true,         // Para segurança em clusters (Atlas)
      w: 'majority',             // Confirmação de escrita por maioria dos nós
      useNewUrlParser: true,     // Evita depreciações no parsing da URI
      useUnifiedTopology: true   // Usa novo motor de descoberta de servidores
    });

    // ✅ Ligação estabelecida com sucesso
    console.log('🟢 Conectado ao MongoDB com sucesso!');
    return connection; // 🔁 Retorna a ligação para ser usada noutros módulos (ex: GridFS)

  } catch (err) {
    // ❌ Em caso de erro, mostra a mensagem e termina o processo
    console.error('🔴 Erro na conexão com MongoDB:', err.message);
    process.exit(1); // Encerra a aplicação para evitar estados inconsistentes
  }
};

module.exports = connectDB;
