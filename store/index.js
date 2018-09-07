var store = require('store');

module.exports = {
    login: function(params) {
        if (params.password) {
            var pwd = store.get('password');
            if (!pwd.legitpassword) {
                return { ok: false, error: "Not registered"  };
            }
            if (store.get('password').legitpassword == params.password) {
                store.set('status', { logged: true });
                return { ok: true };
            }
        }
        return { ok: false, error: "Incorrect password" };
    },

    logout: function(userStatus) {
        if (userStatus.logged) {

        }
    },

    register: function(params) {
        if (params.password) {
            if (store.get('register').count) {
                if (store.get('register').count == 1) {
                    return { ok: false, error: "Already registered." };
                }
            }

            store.set('password', { legitpassword: params.password });
            store.set('register', { count: 1 });
            store.set('coins', { list: [] });

            return { ok: true };
        }
        return { ok: false, error: "Incorrect password" };
    },

    islogged: function() {
        var log = store.get('status').logged;
        if (log) return log;
        return false;
    },

    addcoin: function(params) {
        if (this.islogged()) {
            if (params.coin) {
                var c = store.get('coins').list;
                c.push_back(params.coin);
                store.set('')
            }
            return { ok: false, error: "Invalid coin." };
        }
        return { ok: false, error: "Not logged" };
    },

    newaddress: function(params) {
        
    },

    neworder: function(params) {

    },

    newcoin: function(params) {
        var dbcoin = require('../db/').coins;
        _.each(dbcoin.details, function(err, value) {
            if (!err) {
                if (value) {
                    if (value.asset == params.coin) {
                        var lib = require(value.lib);

                        if (lib) {
                            var usercoin = {
                                coin: value.asset,
                                hdprivkey: null,
                                hdpubkey: null,
                                hdderiv: 0,
                                address: [],
                                orders: [],
                                balance: 0,
                            };
    
                            var hdpriv = new lib.HDPrivateKey();
                            var hdpub = hdpriv.hdPublicKey;

                            var derived = hdPrivateKey.derive("m/0'/0'/0'/0");

                            //address only
                            var address = derived.privateKey.toAddress();
                            var privkey = derived.privateKey.toWIF();
                            var pubkey = derived.privateKey.toPublicKey();

                            usercoin.hdderiv = 1;
                            usercoin.hdpubkey = hdpub;
                            usercoin.hdprivkey = hdpriv;

                            usercoin.address.push_back({address,privkey,pubkey});
                        }
                    } 
                }
            }
        });
    },

    updatetransactions(coin) {

    },

    createtransaction(coin,tx) {

    },

    signtransaction(coin,tx) {

    },
};