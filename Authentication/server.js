const express= require("express");
const db= require('./config');
const authRoutes= require("./routes/authRoutes");
require("dotenv").config();

const app= express();
app.use(express.json());

db.query("Select 1")
.then(()=> console.log("Database Connected Successfully"))
.catch(err => console.log("Database Connection Failed", err));

app.use("/api/v1/auth", authRoutes);

const PORT= process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server is Running on the Port ${PORT}`));