const express = require('express');
const axios = require('axios');
const responseTime = require('response-time');
const redis = require('redis');
const {promisify} = require('util');
var app = express();

app.use(responseTime());

const client = redis.createClient({
    host:'127.0.0.1',
    port:6379
})

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

app.get('/rockets', async (req,res,next) => {
    try{
        const reply = await getAsync('rockets');
        if(reply){
            console.log('using cached data');
            res.send(JSON.parse(reply));
            return
        }
const response = await axios.get('https://api.spacexdata.com/v3/rockets')
const saveResult = await setAsync('rockets',JSON.stringify(response.data),'EX',5);
console.log('new data cached ',saveResult);
res.send(response.data);
    }
    catch(error){
res.send(error.message);
    }
})

app.listen(8080,() => {
    console.log('server running...')
})