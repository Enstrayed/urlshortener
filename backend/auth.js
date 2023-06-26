tierOneKeys = []
tierTwoKeys = []
tierThreeKeys = []
keyTiers = [tierOneKeys,tierTwoKeys,tierThreeKeys]

function startup() {
    if (globalSettings.clearAndRegenKeys == true) {
        console.log("Regenerating keys")
        clearAndRegenKeys()
        console.log(`${tierOneKeys} ${tierTwoKeys} ${tierThreeKeys}`)
        syncDatabaseKeys()
    } else {
        syncDatabaseKeys("read")
    }
}

function clearAndRegenKeys() {
    for (x in keytiers) { // clear dem sum bitches lmao
        keyTiers[x] = [];
    }

    for (x in keyTiers) { // for each in keytiers
        for (let incr = 0; incr < globalSettings.defaultArrayLength; incr++) { // repeat this as many times as defined in defaultarraylength
            keyTiers[x].push(randkey.generate(25)) // generate a new key and append it to the working array
        }
    }
}

function syncDatabaseKeys(operation) {
    switch (operation) {
        case "read":
            db.get("tierOneKeys").then(res => {
                tierOneKeys = keyEncoderDecoder("decode",res)
            })
            db.get("tierTwoKeys").then(res => {
                tierOneKeys = keyEncoderDecoder("decode",res)
            })
            db.get("tierThreeKeys").then(res => {
                tierOneKeys = keyEncoderDecoder("decode",res)
            })

        default: 
            db.set("tierOneKeys",keyEncoderDecoder("encode",tierOneKeys))
            db.set("tierTwoKeys",keyEncoderDecoder("encode",tierTwoKeys))
            db.set("tierThreeKeys",keyEncoderDecoder("encode",tierThreeKeys))
            1
            db.get("tierOneKeys").then(res => {
                tierOneKeys = keyEncoderDecoder("decode",res)
            })
            db.get("tierTwoKeys").then(res => {
                tierOneKeys = keyEncoderDecoder("decode",res)
            })
            db.get("tierThreeKeys").then(res => {
                tierOneKeys = keyEncoderDecoder("decode",res)
            })
    }
}

// Functions that do multiple things are superior to multiple
// split out functions. Source: trust me bro
function keyEncoderDecoder(operation,target) {
    switch (operation) {
        case "encode":
            return target.join(',')
        
        case "decode":
            return target.split(',')

        default:
            return false
    }
}

function checkKey(tier,key) {
    switch (tier) {
        case 1:
            if (tierOneKeys.includes(key) == true || tierTwoKeys.includes(key) || tierThreeKeys.includes(key)) {
                return true;
            } else {
                return false;
            }

        case 2:
            if (tierTwoKeys.includes(key) == true || tierThreeKeys.includes(key)) {
                return true;
            } else {
                return false;
            }

        case 3:
            if (tierThreeKeys.includes(key) == true) {
                return true;
            } else {
                return false;
            }

        default:
            return false;
    }
}



module.exports={startup, checkKey}