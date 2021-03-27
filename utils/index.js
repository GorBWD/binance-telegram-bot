const crypto = require('crypto');
const { ENCRYPTION_KEY, IV_KEY } = require('../config');

exports.objToString = (obj) => {
    let csvData = [];

    for ( let key in obj ) {
        csvData.push(`${key}\t${obj[key]}\n`);
    }

    return csvData.join('');
}

exports.encrypt = (text) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV_KEY)
    let crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}
  
exports.decrypt = (text) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, IV_KEY)
    let dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}
