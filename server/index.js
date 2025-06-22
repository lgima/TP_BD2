const express = require("express")
const mongoose = require('mongoose')
const cors = require("cors")
const UserModel = require('./models/User')
const bcrypt = require('bcrypt')
const redis = require('redis');
const path = require('path');

const app = express()
app.use(express.json())
app.use(cors())

// Crear cliente Redis con opciones de reconexión
const client = redis.createClient({
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                return new Error('Máximo número de intentos de reconexión alcanzado');
            }
            return Math.min(retries * 100, 3000);
        }
    }
});

client.on('error', (err) => console.error('Error de Redis:', err));
client.on('connect', () => console.log('Conectado a Redis'));
client.on('reconnecting', () => console.log('Reconectando a Redis...'));

// Conectar a Redis
(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.error('Error al conectar con Redis:', err);
    }
})();

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
                res.json({
                    success: true,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            } else {
                res.json({ success: false, error: "Datos incorrectos" });
            }
        } else {
            res.json({ success: false, error: "Datos incorrectos" });
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
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role || 'user' // Por defecto será 'user' si no se especifica
        };
        
        const newUser = await UserModel.create(userData);
        res.json({
            success: true,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//redis
// Endpoints de películas ordenados por especificidad
app.get('/api/peliculas/detalles', async (req, res) => {
    try {
        const keys = await client.keys('pelicula:*');
        const peliculas = [];

        for (const key of keys) {
            const nombre = key.split(':')[1];
            const detalles = await client.hGetAll(key);
            const horarios = JSON.parse(detalles.horarios || '[]');
            const funcionesData = await Promise.all(
                horarios.map(horario => 
                    client.hGetAll(`funcion:${nombre}:${horario}`)
                )
            );

            const funciones = horarios.map((horario, index) => ({
                horario,
                total: parseInt(funcionesData[index].total || '50'),
                reservados: parseInt(funcionesData[index].reservados || '0')
            }));

            peliculas.push({
                nombre,
                sala: detalles.sala,
                horarios: funciones
            });
        }

        res.json(peliculas);
    } catch (err) {
        console.error('Error al obtener películas:', err);
        res.status(500).json({ error: 'No se pudieron obtener las películas' });
    }
});

app.get('/api/peliculas', async (req, res) => {
    try {
        const keys = await client.keys('pelicula:*');
        const nombres = keys.map(k => k.split(':')[1]);
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
    const { cantidad, userId, horario } = req.body;
    
    if (!cantidad || !horario || isNaN(cantidad) || cantidad <= 0) {
        return res.status(400).json({ error: 'Datos inválidos' });
    }

    try {
        const keyFuncion = `funcion:${nombre}:${horario}`;
        const [total, reservados] = await Promise.all([
            client.hGet(keyFuncion, 'total'),
            client.hGet(keyFuncion, 'reservados')
        ]);

        if (total === null) {
            return res.status(404).json({ error: 'Función no encontrada' });
        }

        const totalNum = parseInt(total);
        const reservadosNum = parseInt(reservados || '0');
        const disponibles = totalNum - reservadosNum;

        if (cantidad > disponibles) {
            return res.status(400).json({ error: 'No hay suficientes asientos disponibles' });
        }

        // Actualizar reservados en la función
        await client.hSet(keyFuncion, 'reservados', reservadosNum + parseInt(cantidad));

        // Guardar la reserva en el usuario
        if (userId) {
            await UserModel.findByIdAndUpdate(
                userId,
                { 
                    $push: { 
                        reservas: { 
                            pelicula: nombre, 
                            cantidad: parseInt(cantidad),
                            horario: horario,
                            sala: (await client.hGet(`pelicula:${nombre}`, 'sala'))
                        } 
                    } 
                }
            );
        }

        res.json({ 
            success: true, 
            mensaje: `Reserva exitosa de ${cantidad} entrada(s) para '${nombre}' en el horario ${horario}` 
        });
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
    const horario = reserva.horario;
    // Eliminar la reserva del usuario
    await UserModel.findByIdAndUpdate(userId, { $pull: { reservas: { pelicula: nombre } } });
    // Actualizar la cantidad de reservados en Redis
    const keyFuncion = `funcion:${nombre}:${horario}`;
    const reservados = await client.hGet(keyFuncion, 'reservados');
    const reservadosNum = parseInt(reservados || '0');
    const nuevoReservados = Math.max(0, reservadosNum - cantidad);
    await client.hSet(keyFuncion, 'reservados', nuevoReservados);
    res.json({ success: true, mensaje: `Reserva cancelada y asientos liberados para '${nombre}' en el horario ${horario}` });
  } catch (err) {
    console.error('Error al cancelar reserva:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Middleware para verificar rol
const verificarRol = (rolRequerido) => {
    return async (req, res, next) => {
        try {
            const userId = req.headers['user-id'];
            if (!userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }
            
            const user = await UserModel.findById(userId);
            if (!user || user.role !== rolRequerido) {
                return res.status(403).json({ error: 'No tienes permisos necesarios' });
            }
            next();
        } catch (err) {
            res.status(500).json({ error: 'Error al verificar permisos' });
        }
    };
};

// Endpoint para agregar una película (solo admin)
app.post('/api/peliculas', verificarRol('admin'), async (req, res) => {
    const { nombre, sala, horarios } = req.body;
    if (!nombre || !sala || !horarios || !Array.isArray(horarios) || horarios.length === 0) {
        return res.status(400).json({ error: 'Datos inválidos. Se requiere nombre, sala y al menos un horario' });
    }

    try {
        const key = `pelicula:${nombre}`;
        const existe = await client.exists(key);
        if (existe) {
            return res.status(400).json({ error: 'La película ya existe' });
        }

        // Guardamos la información de la película
        await client.hSet(key, {
            'sala': sala,
            'horarios': JSON.stringify(horarios),
            'asientos_por_funcion': '50' // Valor por defecto
        });

        // Para cada horario, creamos una entrada separada para los asientos
        for (const horario of horarios) {
            const keyFuncion = `funcion:${nombre}:${horario}`;
            await client.hSet(keyFuncion, {
                'total': 50,
                'reservados': 0
            });
        }

        res.json({ 
            success: true, 
            mensaje: `Película '${nombre}' agregada en sala ${sala} con ${horarios.length} funciones` 
        });
    } catch (err) {
        console.error('Error al agregar película:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Endpoint para eliminar una película (solo admin)
app.delete('/api/peliculas/:nombre', verificarRol('admin'), async (req, res) => {
    const { nombre } = req.params;
    try {
        console.log('Intentando eliminar película:', nombre);
        
        const key = `pelicula:${nombre}`;
        const existe = await client.exists(key);
        
        if (!existe) {
            console.log('Película no encontrada:', nombre);
            return res.status(404).json({ error: 'Película no encontrada' });
        }

        // Obtener los horarios antes de eliminar la película
        const detalles = await client.hGetAll(key);
        console.log('Detalles de la película:', detalles);
        
        let horarios = [];
        try {
            horarios = JSON.parse(detalles.horarios || '[]');
        } catch (parseError) {
            console.error('Error al parsear horarios:', parseError);
            horarios = [];
        }

        console.log('Horarios a eliminar:', horarios);

        // Eliminar todas las funciones asociadas
        try {
            await Promise.all(
                horarios.map(horario => {
                    console.log('Eliminando función:', `funcion:${nombre}:${horario}`);
                    return client.del(`funcion:${nombre}:${horario}`);
                })
            );
        } catch (funcError) {
            console.error('Error al eliminar funciones:', funcError);
        }

        // Eliminar la película
        await client.del(key);
        console.log('Película eliminada correctamente:', nombre);
        
        res.json({ success: true, mensaje: `Película '${nombre}' eliminada correctamente` });
    } catch (err) {
        console.error('Error al eliminar película:', err);
        res.status(500).json({ error: 'Error interno del servidor', details: err.message });
    }
});

// Endpoint para actualizar los asientos de una función específica
app.put('/api/peliculas/:nombre/funcion/:horario', verificarRol('admin'), async (req, res) => {
    const { nombre, horario } = req.params;
    const { totalAsientos } = req.body;
    
    if (!totalAsientos || isNaN(totalAsientos) || totalAsientos <= 0) {
        return res.status(400).json({ error: 'Número de asientos inválido' });
    }

    try {
        const keyFuncion = `funcion:${nombre}:${horario}`;
        const [existe, reservados] = await Promise.all([
            client.exists(keyFuncion),
            client.hGet(keyFuncion, 'reservados')
        ]);

        if (!existe) {
            return res.status(404).json({ error: 'Función no encontrada' });
        }

        const reservadosNum = parseInt(reservados || '0');
        if (totalAsientos < reservadosNum) {
            return res.status(400).json({ 
                error: 'No se puede reducir el total por debajo de los asientos reservados' 
            });
        }

        await client.hSet(keyFuncion, 'total', totalAsientos);
        res.json({ 
            success: true, 
            mensaje: `Total de asientos actualizado a ${totalAsientos} para '${nombre}' en el horario ${horario}` 
        });
    } catch (err) {
        console.error('Error al modificar asientos:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(3001, () => {
    console.log("server is running")

})