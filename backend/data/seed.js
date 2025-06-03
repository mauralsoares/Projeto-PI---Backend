const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: "../.env" });

const User = require("../src/models/User"); // Usa o modelo real da app

const materialSchema = new mongoose.Schema({
  title: String,
  university: String,
  course: String,
  subject: String,
  type: String,
  description: String,
  author: mongoose.Schema.Types.ObjectId,
  fileUrl: String,
  uploadDate: Date,
  ratings: [],
  averageRating: Number,
});

const Material = mongoose.model("Material", materialSchema);

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/studyshare";

async function seed() {
  await mongoose.connect(MONGO_URI);
  await User.deleteMany({});
  await Material.deleteMany({});

  const users = [];

  const testUser = new User({
    name: "Testador",
    email: "test@iscte.pt",
    password: "123456",
    tipo: "user",
  });

  users.push(testUser);

  for (let i = 1; i <= 4; i++) {
    const user = new User({
      name: `Utilizador ${i}`,
      email: `user${i}@mail.com`,
      password: "abc123",
      tipo: "user",
    });
    users.push(user);
  }

  // hash automático via pre('save')
  await Promise.all(users.map(u => u.save()));

  const subjects = ["Álgebra", "POO", "Sistemas Digitais", "BD", "IA"];
  const universities = ["ISCTE", "FCT", "Técnico"];
  const types = ["Resumo", "Slides", "Exame Resolvido", "Apontamentos"];

  const materials = [];

  for (let i = 0; i < 10; i++) {
    const author = users[i % users.length];
    const mat = new Material({
      title: `Material ${i + 1}`,
      university: universities[i % universities.length],
      course: "Engenharia Informática",
      subject: subjects[i % subjects.length],
      type: types[i % types.length],
      description: `Conteúdo de ${subjects[i % subjects.length]}`,
      author: author._id,
      fileUrl: `https://appfiles.com/material${i + 1}.pdf`,
      uploadDate: new Date(),
      ratings: [],
      averageRating: Math.round((3 + Math.random() * 2) * 10) / 10,
    });
    materials.push(mat);
    // associar depois, para não mexer em User.js original
  }

  await Material.insertMany(materials);

  console.log("✨ Base de dados MongoDB populada com sucesso!");
  mongoose.disconnect();
}

seed().catch(err => {
  console.error("Erro ao popular a base de dados:", err);
  mongoose.disconnect();
});
