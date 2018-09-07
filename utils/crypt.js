const crypto = require('crypto');


const crypt = {
    encHash(hash, key) {
        var iv = new Buffer.alloc(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        const h = cipher.update(hash,'utf8', 'hex') + cipher.final('hex');
        return h;
    },
    encrypt(data, key) {
        const k = crypto.createHash('md5').update(key, 'utf-8').digest('hex');
        const hash = this.encHash(data, k);
        return hash;
    },
    decHash(hash, key) {
        var iv = new Buffer.alloc(16);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const h = decipher.update(hash,'hex', 'utf8') + cipher.final('utf8');
        return h;
    },
    decrypt(data, key) {
        const k = crypto.createHash('md5').update(key, 'utf-8').digest('hex');
        const hash = this.decHash(data, k);
        return hash;
    },
};

module.exports = crypt;