const { db, globalConfig } = require('./index.js') // Get DB and global configuration objects from index.js
const randomKey = require('random-key') // Provides "random" API key generation

function generateAuthKeys() { // Generates authorization keys based on settings in config.json
    let keyStore = [];
    for (let i = 0; i < globalConfig.authKeyAmount; i++) { // for number of keys to generate
        keyStore.push(randomKey.generate(globalConfig.authKeyLength)); // generate key based on key length setting and add to array
    }
    keyStore = keyStore.join(','); // format that as csv
    return keyStore;
}

function regenerateAndWriteKeys() {
    if (globalConfig.regenerateAuthKeys == true) {
        db.set(globalConfig.authKeysRedisKey,generateAuthKeys())
        console.log("Regenerated Authorization Keys")
    }
}

function checkAuth(keyToCheck) {
    return new Promise((resolve, reject) => {
        db.get(globalConfig.authKeysRedisKey).then(res => {
            let validKeys = res.split(',');
            if (validKeys.includes(keyToCheck)) {
                resolve(true)
            } else { 
                resolve(false) 
            }
        })
    })
}

module.exports = { regenerateAndWriteKeys,checkAuth }