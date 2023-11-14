const fs = require('fs');         // Filesystem Access
const express = require('express'); 
const app = express();            // Init Express
const Redis = require('ioredis'); // Init Redis

const globalConfig = JSON.parse(fs.readFileSync('config.json', 'utf-8')) // Read config file

const db = new Redis({
    host: globalConfig.redisServer,    
    port: globalConfig.redisPort
})
module.exports = { db, globalConfig } // Export database connection for other files

const { regenerateAndWriteKeys,checkAuth } = require("./auth.js")
regenerateAndWriteKeys()

app.get('/:url', (rreq,rres) => {

    requestUrl = rreq.url.split("?") //sanitize against queries

    db.get(requestUrl[0]).then(res => {
        if (res == null) {
            console.log(`${rreq.query.auth}/${rreq.get("cf-connecting-ip")} GET ${requestUrl[0]} returned 404`)
            rres.status(404).send(`<style>.text{font-family: Arial, Helvetica, sans-serif;}</style><h1 class="text">etyd.cc Error</h1><p class="text">Requested URL not found.</p>`);
        } else {
            //not logging this shit
            rres.redirect(res);
        }
    })
    
});

// Write URL redirects to database
app.post('/:url', (rreq,rres) => {

    checkAuth(rreq.query.auth).then(res => {
        if (res == true) {
            let requestUrl = rreq.url.split("?") //sanitize against queries
            db.get(requestUrl[0]).then(res => {
                if (res != null) {
                    console.log(`${rreq.query.auth}/${rreq.get("cf-connecting-ip")} POST   ${requestUrl[0]} returned 409`)
                    rres.sendStatus(409);
                } else {
                    db.set(requestUrl[0],rreq.query.url)
                    db.get(requestUrl[0]).then(res => {
                        console.log(`${rreq.query.auth}/${rreq.get("cf-connecting-ip")} POST   ${requestUrl[0]} returned ${res}`)
                        rres.send(res);
                    })
                }
            })
        } else {
            console.log(`${rreq.query.auth}/${rreq.get("cf-connecting-ip")} POST   ${rreq.url.split("?")[0]} returned 401`)
            rres.sendStatus(401);
        }
    })
    
})

app.delete('/:url', (rreq,rres) => {

    checkAuth(rreq.query.auth).then(res => {
        if (res == true) {
            let requestUrl = rreq.url.split("?")
            db.get(requestUrl[0]).then(res => {
                if (res == null) {
                    console.log(`${rreq.query.auth}/${rreq.get("cf-connecting-ip")} DELETE ${requestUrl[0]} returned 400`)
                    rres.sendStatus(400);
                } else {
                    
                    db.del(requestUrl[0])
    
                    db.get(requestUrl[0]).then(res => {
                        if (res == null) {
                            console.log(`${rreq.query.auth}/${rreq.get("cf-connecting-ip")} DELETE ${requestUrl[0]} returned 200`)
                            rres.sendStatus(200);
                        } else { //if this happens something has gone TERRIBLY wrong
                            console.log(`⚠️ ${rreq.query.auth}/${rreq.get("cf-connecting-ip")} DELETE ${requestUrl[0]} returned 500`)
                            rres.sendStatus(500);
                        }
                    })
    
                }
            })
        } else {
            console.log(`${rreq.query.auth}/${rreq.get("cf-connecting-ip")} DELETE ${rreq.url.split("?")[0]} returned 401`)
            rres.sendStatus(401);
        }
    })    

})

console.log(`Started on ${globalConfig.apiPort}`)
app.listen(globalConfig.apiPort);