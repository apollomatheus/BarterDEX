var store = require('store');

module.exports = {
    login: function(params) {
        if (params.password) {
            var pwd = store.get('password');
            if (!pwd.legitpassword) {
                return { error: "Not registered"  };
            }
            if (store.get('password').legitpassword == params.password) {
                store.set('status', { logged: true });
                return { ok: true };
            }
        }
        return { error: "Incorrect password" };
    },

    logout: function() {
        if (!this.islogged()) {
            return { error: "Not logged." };
        }
        store.set('status', { logged: false });
    },

    islogged: function() {
        var log = store.get('status').logged;
        if (log) return log;
        return false;
    },

    register: function(params) {
        if (this.islogged()) {
            return { error: "Already logged." };
        }

        if (params) {
            if (params.password) {
                if (store.get('register').count) {
                    if (store.get('register').count == 1) {
                        return { ok: false, error: "Already registered." };
                    }
                }

                store.set('password', { legitpassword: params.password });
                store.set('register', { count: 1 });
                store.set('coins', { list: [] });
                store.set('tx', { list: [] });

                return { ok: true };
            }
            return { ok: false, error: "Incorrect password" };
        }
    },

    newaddress: function(params) {
        if (!this.islogged()) {
            return { error: "Not logged." };
        }
        if (params) {
            if (!params.coin) {
                return { error: "Missing params."  };
            }

            var ucoin = this.getcoin({coin});

            if (!ucoin) {
                return { error: "This is coin is not in your list."};
            }
            if (ucoin.error) {
                return { error: ucoin.error };
            }

            var list = store.get('coins').list;
            
            try {
                var n = 0;
                _.each(list, function(err,value) {
                    if (value.asset == params.coin) {
                        throw n;
                    }
                    n += 1;
                });
            }catch(n) {
                var hdpriv = ucoin.hdprivkey;
                var hdderiv = ucoin.hdderiv;
                var derived = hdpriv.derive("m/0'/0'/0'/"+hdderiv);
    
                //address only
                var address = derived.privateKey.toAddress();
                var privkey = derived.privateKey.toWIF();
                var pubkey = derived.privateKey.toPublicKey();
    
                list[n].hdderiv += 1;
                list[n].address.push_back({address,privkey,pubkey});

                store.set('coins',{ list });
                return { address };
            }
        }
        return {ok: false, error: "Missing params." };
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
                var crypt = require('../utils').crypt;

                //witness wont sign orders with 0 pubkeys supplied
                var pubkeyList = this.getpubkeylist({coin});  
                if (pubkeyList.length == 0) {
                    return { error: "Insecure order."};
                }

                var order = {
                    price: price,
                    amount: amount,
                    chain: db.chain.common_chain,
                    addresslist: pubkeyList,
                    ts: Date.now(),
                };

                var id = ucoin.orders.length+1;
                var proof = crypt.encrypt(JSON.stringify(order)+':'+coin, db.chain.common_chain);
                ucoin.orders.push_back({ id, order: proof, signatures: [] });
                //after sign this order and proof our common chain
                //we send it to witnesses
                //they sign, and send it back, so we collect signatures.
                //and we can trade it safer later
                //cause we'll need to proof that we wont trade
                //orders that dont combine
                //with previously signed order.
                //* witness dont access orders only signs them.
                //signatures are hardcoded, so we cant change it, or insert invalid orders.
                //sellers will verify buyer order <--> buyer will verify seller order.
                return { id };
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
                            var derived = hdpriv.derive("m/0'/0'/0'/0");

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

    updatetransactions(params) {
        
        if (!this.islogged()) {
            return { error: "Not logged." };
        }
        if (!params) {
            return { error: "Missing params."};
        }
        if (!params.coin || !params.tx || !params.amount || !params.inout) {
            return { error: "Missing params."};
        }
        
        var tx = {
            coin: params.coin,
            tx: params.tx,
            amount: params.amount,
            inOut: params.inout
        };

        var txlist = store.get('tx').list;
        if (!txlist) {
            store.set('tx',{ list: [] });
        }
        txlist = store.get('tx').list;
        txlist.push_back(tx);
        store.set('tx',{ list: txlist });
    },

    createtransaction(params) {
        if (!this.islogged()) {
            return { error: "Not logged." };
        }
        if (!params) {
            return { error: "Missing params."};
        }
        if (!params.coin || !params.tx || !params.amount) {
            return { error: "Missing params."};
        }
    },

    signtransaction(params) {

    },

    makeorder(params) {

    }
};