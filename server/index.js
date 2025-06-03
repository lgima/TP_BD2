const express = require("express")
const mongoose = require('mongoose')
const cors = require("cors")
const UserModel = require('./models/User')

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

//MONGO
app.post("/login", (req, res) => {
	const {email, password} = req.body;
	UserModel.findOne({email: email})
	.then(user => {
		if(user) {
			if(user.password === password) {
				res.json("Success")
			} else {
				res.json("Datos incorrectos")
			}
		} else {
            res.json("Datos incorrectos")
        }
	})
})

//MONGO
app.post('/register', (req, res) => {
    
    UserModel.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json(err))

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

app.get("/", (req, res) => {
  res.send("Servidor backend funcionando 😎");
  
});

//MONGO
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    UserModel.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    res.json("Success");
                } else {
                    res.json("Datos incorrectos");
                }
            } else {
                res.json("Datos incorrectos");
            }
        })
        .catch(err => {
            res.status(500).json("Error en el servidor");
        });
});

app.listen(3001, () => {
    console.log("server is running")

})