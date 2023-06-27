const express = require('express'); // Init Express
const res = require('express/lib/response');
const app = express();

const fs = require('fs'); // Init FS Support

const globalSettings = JSON.parse(fs.readFileSync('settings.json','utf-8')) // Load settings file

const Redis = require('ioredis'); // Init Redis
const db = new Redis({
    host: globalSettings.redisHost,
    port: globalSettings.redisPort
})

const masterKey = globalSettings.masterKey // 
db.get("apiKeys").then(res => {
    keyArrays = res.split(',')
    module.exports={keyArrays}
})
module.exports={masterKey}
const auth = require('./auth.js') // Init Authentication Functions
console.log(`Retreived and set API Keys: ${keyArrays}`)




app.get('/:url', (rreq,rres) => {

    requestUrl = rreq.url.split("?") //sanitize against queries

    db.get(requestUrl[0]).then(res => {
        if (res == null) {
            rres.sendStatus(404);
        } else {
            rres.redirect(res);
        }
    })
    
});


app.post('/:url', (rreq,rres) => {

    if (auth.checkKey(1,rreq.query.auth) == true) {
        requestUrl = rreq.url.split("?") //sanitize against queries

        db.get(requestUrl[0]).then(res => {
            if (res != null) {
                console.log(`${rreq.query.auth}/${rreq.ip} POST ${requestUrl[0]} returned 409`)
                rres.sendStatus(409);
            } else {
                
                db.set(requestUrl[0],rreq.query.url)

                db.get(requestUrl[0]).then(res => {
                    console.log(`${rreq.query.auth}/${rreq.ip} POST ${requestUrl[0]} returned ${res}`)
                    rres.send(res);
                })

            }
        })
    } else {
        console.log(`${rreq.query.auth}/${rreq.ip} POST ${rreq.url} returned 401`)
        rres.sendStatus(401);
    }

    

})

app.delete('/:url', (rreq,rres) => {

    if (auth.checkKey(2,rreq.query.auth) == true) {
        requestUrl = rreq.url.split("?") //sanitize against queries

        db.get(requestUrl[0]).then(res => {
            if (res == null) {
                console.log(`${rreq.query.auth}/${rreq.ip} DELETE ${requestUrl[0]} returned 400`)
                rres.sendStatus(400);
            } else {
                
                db.del(requestUrl[0])

                db.get(requestUrl[0]).then(res => {
                    if (res == null) {
                        console.log(`${rreq.query.auth}/${rreq.ip} DELETE ${requestUrl[0]} returned 200`)
                        rres.sendStatus(200);
                    } else { //if this happens something has gone TERRIBLY wrong
                        console.log(`⚠️ ${rreq.query.auth}/${rreq.ip} DELETE ${requestUrl[0]} returned 500`)
                        rres.sendStatus(500);
                    }
                })

            }
        })
    } else {
        console.log(`${rreq.query.auth}/${rreq.ip} DELETE ${rreq.url} returned 1`)
        rres.sendStatus(401);
    }

    

})

console.log(`Started on ${globalSettings.nodePort}`)
app.listen(globalSettings.nodePort);