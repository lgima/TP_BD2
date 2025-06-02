const express = require("express")
const mongoose = require('mongoose')
const cors = require("cors")
const UserModel = require('./models/User')

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb+srv://fernando5ale:asd123asd@cluster0.p4ndpuj.mongodb.net/");

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

app.post('/register', (req, res) => {
    
    UserModel.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json(err))

})

app.get("/", (req, res) => {
  res.send("Servidor backend funcionando 😎");
  
});

app.listen(3001, () => {
    console.log("server is running")

})