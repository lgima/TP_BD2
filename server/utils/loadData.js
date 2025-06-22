const redis = require('redis');

// Crear cliente Redis
const client = redis.createClient();

// Array de películas con sus datos
const peliculas = [
    {
        nombre: "Matrix",
        sala: "11",
        horarios: ["13:30", "16:45", "20:30"]
    },
    {
        nombre: "Gladiador",
        sala: "12",
        horarios: ["14:00", "17:15", "21:00"]
    },
    {
        nombre: "Avengers",
        sala: "13",
        horarios: ["15:00", "18:30", "22:00"]
    },
    {
        nombre: "Thor",
        sala: "14",
        horarios: ["14:30", "17:45", "21:15"]
    }
];

async function cargarDatos() {
    try {
        await client.connect();
        console.log('Conectado a Redis');

        // Eliminar datos existentes
        const keys = await client.keys('pelicula:*');
        if (keys.length > 0) {
            await client.del(keys);
        }
        console.log('Datos anteriores eliminados');

        // Cargar nuevos datos
        for (const pelicula of peliculas) {
            const key = `pelicula:${pelicula.nombre}`;
            
            // Guardar información de la película
            await client.hSet(key, {
                'sala': pelicula.sala,
                'horarios': JSON.stringify(pelicula.horarios),
            });

            // Crear entradas para cada horario
            for (const horario of pelicula.horarios) {
                const keyFuncion = `funcion:${pelicula.nombre}:${horario}`;
                await client.hSet(keyFuncion, {
                    'total': 50,  // Número por defecto de asientos
                    'reservados': 0
                });
            }

            console.log(`Película '${pelicula.nombre}' cargada con éxito`);
        }

        console.log('Todos los datos han sido cargados correctamente');
        await client.quit();
        
    } catch (err) {
        console.error('Error al cargar datos:', err);
        process.exit(1);
    }
}

cargarDatos();