const express = require('express'); // Init Express
const res = require('express/lib/response');
const app = express();

const Redis = require('ioredis'); // Init Redis
const db = new Redis({
    host: 'rosebud',
    port: 6379
})

// copy pasted from bike-api lol
const fs = require('fs'); // Provides filesystem modification
const randkey = require('random-key') // Provides "random" API key generation

const port = 8127;

// copy pasted from bike-api lol
allowedAuths = JSON.parse(fs.readFileSync('authorization.json', 'utf8'));
if (allowedAuths.regenerateKeys === true) {
    allowedAuths.allowedKeys = []; //empty allowedkeys
    allowedAuths.allowedKeys.push(randkey.generate(25)); //push 3 fresh keys
    allowedAuths.allowedKeys.push(randkey.generate(25));
    allowedAuths.allowedKeys.push(randkey.generate(25));
    allowedAuths.regenerateKeys = false; //dont repeat this on next start

    fs.writeFileSync('authorization.json', JSON.stringify(allowedAuths)); //write that to disk
    console.log(`Regenerated and wrote new API keys`);
}

// copy pasted from bike-api lol
//yes
function checkAuth(auth) {
    if (allowedAuths.allowedKeys.includes(auth)) {
        return true;
    } else {
        return false;
    }
}

app.get('/:url', (rreq,rres) => {

    requestUrl = rreq.url.split("?") //sanitize against queries

    db.get(requestUrl[0]).then(res => {
        if (res == null) {
            console.log(`${rreq.query.auth}/${rreq.ip} GET ${requestUrl[0]} returned 404`)
            rres.status(404).send(`<style>.text{font-family: Arial, Helvetica, sans-serif;}</style><h1 class="text">etyd.cc Error</h1><p class="text">Requested URL not found.</p>`);
        } else {
            //not logging this shit
            rres.redirect(res);
        }
    })
    
});


// Write URL redirects to database
// TODO:
// - Authentication
app.post('/:url', (rreq,rres) => {

    if (checkAuth(rreq.query.auth) == true) {
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

    if (checkAuth(rreq.query.auth) == true) {
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

app.options('/suicide', (rreq,rres) => {

    if (checkAuth(rreq.query.auth) == true) {
        rres.sendStatus(200);
        console.log(`${rreq.query.auth}/${rreq.ip} OPTIONS /suicide returned 200`)
        console.log(`Goodbye Cruel World!`)
        process.exit(0);
    } else {
        console.log(`${rreq.query.auth}/${rreq.ip} OPTIONS /suicide returned 401`)
        rres.sendStatus(401);
    }

    
})


console.log(`Started on ${port}`)
app.listen(port);