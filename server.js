const express = require("express");
const app = express();
require("dotenv").config();
const merchant_routes=require('./routes/merchant_route')
// const merchant = require('./models/merchant')
// const deals = require('./models/deals')
const cors=require('cors');
const member = require("./models/member");

const port = process.env.PORT || 8080;


app.use(express.json())
app.use(express.urlencoded({ limit:'3mb', extended: true }));
app.use(express.json());
app.use(express.static('images'));
app.use(cors("*"));

//Routes
app.use('/api', merchant_routes)

app.use((err,req,res,next)=>{
    const status=err.status||500;
    const message=err.message||"Internal Server Error";
    return res.status(status).json({
        status:"error",
        code:status,
        message
    })
})


app.listen(port, () => {
    console.log(`server is running at ${port}`);
});     