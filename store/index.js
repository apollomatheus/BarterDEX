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


    newaddress: function(params) {
        
    },

    neworder: function(params) {
        if (!this.islogged()) {
            return { error: "Not logged." };
        }
        if (params) {
            if (!params.coin || !params.price || !params.amount) {
                return { error: "Missing params."  };
            } else {
                var coin = params.coin;
                var price = params.price;
                var amount = params.amount;

                var ucoin = this.getcoin({coin});
                if (!ucoin) {
                    return { error: "This is coin is not in your list."};
                }
                if (ucoin.error) {
                    return { error: ucoin.error };
                }
                if (amount < 0.00000000) {
                    return { error: "Amount is to low."};
                }
                if (amount < ucoin.balance) {
                    return { error: "Amount lower than balance."};
                }

                var db = require('../db');
                var crypto = require('crypto');
                var commonProof = 
                ucoin.orders.push_back()
                //after sign this order and proof our common chain
                //we send it to witnesses ( check min )
                //they sign, and send it back.
                //so we can trade it safer later,
                //cause we'll need to proof that we wont send
                //orders that dont combine
                //with previously signed order.
                return 
            }
        } else {
            return { error: "Invalid params."  };
        }
    },


    getcoin: function(params) {
        if (!this.islogged()) {
            return { error: "Not logged." };
        }
        if (!params) {
            return { error: "Missing params."};
        }
        if (!params.coin) {
            return { error: "Missing coin."};
        }
        
        var list = store.get('coins').list;
        if (!list) {
            return false;
        }

        try {
            _.each(list, function(err,value) {
                if (value.asset == params.coin) {
                    throw value;
                }
            });
        } catch (c) {
            return c;
        }   
        return false;
    },

    newcoin: function(params) {
        if (!this.islogged()) {
            return { error: "Not logged." };
        }
        if (!params) {
            return { error: "Missing params."};
        }
        if (!params.coin) {
            return { error: "Missing coin."};
        }
        
        var exist = this.getcoin({coin: params.coin});
        if (!exist.error && exist == true) {
            return { error: "Coin already listed."};
        }

        var dbcoin = require('../db/').coins;
        _.each(dbcoin.details, function(err, value) {
            if (!err) {
                if (value) {
                    if (value.asset == params.coin) {
                        var lib = require(value.lib);

                        if (lib) {
                            //template
                            var usercoin = {
                                coin: value.asset,
                                hdprivkey: null,
                                hdpubkey: null,
                                hdderiv: 0,
                                address: [],
                                orders: [],
                                balance: 0,
                            };

                            //new hd
                            var hdpriv = new lib.HDPrivateKey();
                            var hdpub = hdpriv.hdPublicKey;

                            //last one is the derivation
                            var derived = hdPrivateKey.derive("m/0'/0'/0'/0");

                            //address only
                            var address = derived.privateKey.toAddress();
                            var privkey = derived.privateKey.toWIF();
                            var pubkey = derived.privateKey.toPublicKey();

                            usercoin.hdderiv = 1;
                            usercoin.hdpubkey = hdpub;
                            usercoin.hdprivkey = hdpriv;

                            usercoin.address.push_back({address,privkey,pubkey});

                            //store in coin list
                            var list = store.get('coins').list;
                            if (!list) {
                                //set new list
                                store.set('coins', { list: [] });

                                //edit list
                                list = store.get('coins').list;
                                list.push_back(usercoin);
                                store.set('coins', { list });
                            } else {
                                list.push_back(usercoin);
                                store.set('coins', { list });
                            }
                            return true;
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