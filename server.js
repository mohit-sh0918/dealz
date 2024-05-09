const express = require("express");
const app = express();
require("dotenv").config();
const merchant_routes=require('./routes/merchant_route')
// const merchant = require('.//merchant')
const cors=require('cors')
const bodyParser=require('body-parser')
const otpCleanUp=require("./helper/schedule")

const port = process.env.PORT || 8080;


app.use(express.json())
app.use(express.urlencoded({ limit:'3mb', extended: true }));
app.use(express.json());
app.use(express.static('images'));
app.use(cors("*"));

//Routes
app.use('/api', merchant_routes)



app.listen(port, () => {
    console.log(`server is running at ${port}`);
});     