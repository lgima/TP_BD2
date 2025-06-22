const express = require("express")
const mongoose = require('mongoose')
const cors = require("cors")
const UserModel = require('./models/User')
const bcrypt = require('bcrypt')

const app = express()
app.use(express.json())
app.use(cors())

const redis = require('redis');
const path = require('path');

// Crear cliente Redis
const client = redis.createClient(); // localhost:6379 por defecto
client.connect().catch(console.error);

// Servir archivos estáticos (HTML, JS, CSS)
app.use(express.static(path.join(__dirname, 'public')));

//MONGO
mongoose.connect("mongodb+srv://fernando5ale:asd123asd@cluster0.p4ndpuj.mongodb.net/user");

app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await UserModel.findOne({email: email});
        if(user) {
            const match = await bcrypt.compare(password, user.password);
            if(match) {
                res.json("Success");
            } else {
                res.json("Datos incorrectos");
            }
        } else {
            res.json("Datos incorrectos");
        }
    } catch(err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});

//MONGO
app.post('/register', async (req, res) => {
    try {
        const existingUser = await UserModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const userData = {
            ...req.body,
            password: hashedPassword
        };
        
        const newUser = await UserModel.create(userData);
        res.json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//redis
// Endpoint para obtener las películas desde Redis
app.get('/api/peliculas', async (req, res) => {
    try {
        const keys = await client.keys('pelicula:*'); // todas las películas con disponibilidad
        const nombres = keys.map(k => k.split(':')[1]); // extraer "Titanic", "Gladiador", etc.
        res.json(nombres);
    } catch (err) {
        console.error('Error al obtener películas:', err);
        res.status(500).json({ error: 'No se pudieron obtener las películas' });
    }
});

//ENDPOINT PARA OBTENER ASIENTOS DISPONIBLES DE UNA PELÍCULA
app.get('/api/peliculas/:nombre/disponibles', async (req, res) => {
  const { nombre } = req.params;
  try {
    const key = `pelicula:${nombre}`;
    const [total, reservados] = await Promise.all([
      client.hGet(key, 'total'),
      client.hGet(key, 'reservados')
    ]);

    if (total === null) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    const totalNum = parseInt(total);
    const reservadosNum = parseInt(reservados || '0');
    if (isNaN(totalNum) || isNaN(reservadosNum)) {
      return res.status(500).json({ error: 'Datos corruptos en Redis' });
    }

    const disponibles = totalNum - reservadosNum;
    res.json({ disponibles });
  } catch (err) {
    console.error('Error al obtener disponibilidad:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get("/", (req, res) => {
  res.send("Servidor backend funcionando 😎");
  
});

//MONGO
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email: email });
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
            } else {
                res.json({ success: false, error: "Datos incorrectos" });
            }
        } else {
            res.json({ success: false, error: "Datos incorrectos" });
        }
    } catch(err) {
        res.status(500).json({ success: false, error: "Error en el servidor" });
    }
});

// Nuevo endpoint para obtener datos de usuario por id
app.get('/api/usuario/:id', async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Endpoint para actualizar datos de usuario
app.put('/api/usuario/:id', async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await UserModel.findByIdAndUpdate(
            req.params.id,
            { name, email },
            { new: true, runValidators: true, select: '-password' }
        );
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

// Endpoint para reservar entradas y actualizar los asientos reservados en Redis
app.post('/api/peliculas/:nombre/reservar', async (req, res) => {
  const { nombre } = req.params;
  const { cantidad, userId } = req.body;
  if (!cantidad || isNaN(cantidad) || cantidad <= 0) {
    return res.status(400).json({ error: 'Cantidad inválida' });
  }
  try {
    const key = `pelicula:${nombre}`;
    const [total, reservados] = await Promise.all([
      client.hGet(key, 'total'),
      client.hGet(key, 'reservados')
    ]);
    if (total === null) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }
    const totalNum = parseInt(total);
    const reservadosNum = parseInt(reservados || '0');
    const disponibles = totalNum - reservadosNum;
    if (cantidad > disponibles) {
      return res.status(400).json({ error: 'No hay suficientes asientos disponibles' });
    }
    // Actualizar la cantidad de reservados
    await client.hSet(key, 'reservados', reservadosNum + parseInt(cantidad));
    // Guardar la reserva en el usuario
    if (userId) {
      await UserModel.findByIdAndUpdate(
        userId,
        { $push: { reservas: { pelicula: nombre, cantidad: parseInt(cantidad) } } }
      );
    }
    res.json({ success: true, mensaje: `Reserva exitosa de ${cantidad} entrada(s) para '${nombre}'` });
  } catch (err) {
    console.error('Error al reservar:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para cancelar una reserva y actualizar los asientos reservados en Redis
app.post('/api/peliculas/:nombre/cancelar', async (req, res) => {
  const { nombre } = req.params;
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Falta el userId' });
  }
  try {
    // Buscar al usuario y la reserva correspondiente
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const reserva = user.reservas.find(r => r.pelicula === nombre);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada para esta película' });
    }
    const cantidad = reserva.cantidad;
    // Eliminar la reserva del usuario
    await UserModel.findByIdAndUpdate(userId, { $pull: { reservas: { pelicula: nombre } } });
    // Actualizar la cantidad de reservados en Redis
    const key = `pelicula:${nombre}`;
    const reservados = await client.hGet(key, 'reservados');
    const reservadosNum = parseInt(reservados || '0');
    const nuevoReservados = Math.max(0, reservadosNum - cantidad);
    await client.hSet(key, 'reservados', nuevoReservados);
    res.json({ success: true, mensaje: `Reserva cancelada y asientos liberados para '${nombre}'` });
  } catch (err) {
    console.error('Error al cancelar reserva:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(3001, () => {
    console.log("server is running")

})