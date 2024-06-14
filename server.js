const express = require("express");
const app = express();
require("dotenv").config();
const merchant_routes=require('./routes/merchant_route')
const user_routes=require('./routes/user_routes')
// const merchant = require('./models/merchant')
// const deals = require('./models/deals')
const cors=require('cors');
// const member = require("./models/member");
// const page=require("./images/T&C/terms&condition")
const port = process.env.PORT || 8080;
// const user=require("./models/user")
const path = require('path');

app.use(express.json())
app.use(express.urlencoded({ limit:'3mb', extended: true }));
app.use(express.static('images'));
app.use(cors("*"));

//Routes
// app.use('/static', express.static(path.join(__dirname, 'public')));
app.get('/terms-and-conditions', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'merchant-terms-and-conditions.html'));
});
app.get('/users/terms-and-conditions', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user-terms-and-conditions.html'));
});
app.use('/api', merchant_routes)
app.use('/api',user_routes)
app.use((err,req,res,next)=>{
    const status=err.status||500;
    const message=err.message||"Internal Server Error";
    return res.status(status).json({
        status:err.jStatus||false,
        code:err.code||status,
        message
    })
})


app.listen(port, () => {
    console.log(`server is running at ${port}`);
});     