const express = require('express')
const app = express()
const startingChecks = require('./validations/expired')


const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv/config')
 
//allows data to be parsed in json format
app.use(bodyParser.json())

const itemsRoute = require('./routes/items')
const authRoute = require('./routes/auth')

app.use('/api/item', itemsRoute)
app.use('/api/user', authRoute)

mongoose.connect(process.env.DB_CONNECTOR, ()=>{
    console.log("DB is connected")
})



app.listen(3000, async()=> {
    console.log("server is running")
    //check and update expired items when app starts
    const checkup = await startingChecks.expiredItemCheck()
});   