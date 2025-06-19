const mongoose = require('mongoose')

const ReservaSchema = new mongoose.Schema({
  pelicula: String,
  cantidad: Number
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  reservas: [ReservaSchema]
});

const UserModel = mongoose.model("users", UserSchema)
module.exports = UserModel

