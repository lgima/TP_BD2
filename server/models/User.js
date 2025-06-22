const mongoose = require('mongoose')

const ReservaSchema = new mongoose.Schema({
  pelicula: String,
  cantidad: Number,
  horario: String,
  sala: String
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  reservas: [ReservaSchema]
});

const UserModel = mongoose.model("users", UserSchema)
module.exports = UserModel

