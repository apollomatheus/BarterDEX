const witness = {
    MIN_CONFIRM: 1,
    MIN_ACTIVE_WITNESS_CYCLE: 1,
    list: [
        { trust: true, url: 'http://45.32.219.51:3999/' },
    ],
    isactiveorderlisted(store,order) {
        var r = store.hasorder(order);
        if (!r) {
            return false;
        }
        return true;
    },
    getactiveorders(store,coin,cbaddorder) {
        for (var i = 0; i < this.MIN_ACTIVE_WITNESS_CYCLE; i++) {
            var witurl = this.list[i].url;

            $.ajax({
                async: true,
                dataType: 'json',
                type: 'GET',
                url: witurl+'order/active/sell/'+coin
            }).done(function(data) {
                if (data) {
                    var r = this.isactiveorderlisted(store, data.order);
                    if (!r) {
                        cbaddorder(data.order);             
                    }
                }
            }).fail(function(e) {
                console.log('Error: '+e);
            });
        }
    },
    confirmorder(store,id,signature) {
        var r = store.confirmorder(id,signature);
        if (r.error) {
            return { error: r.error };
        }
        return r;
    },
    sendorder(store,id,proof,cbconf,cberr) {
        for (var i = 0; i < this.MIN_CONFIRM; i++) {
            var witurl = this.list[i].url;

            $.ajax({
                async: true,
                data: JSON.stringify({ proof }),
                dataType: 'json',
                type: 'POST',
                url: witurl+'order/new'
            }).done(function(data) {
                if (data.valid == true) {
                    var r =  this.confirmorder(store, id, data.signature);
                    if (r.error) {
                        cberr(r.error);
                    } else {
                        cbconf('Transaction id:'+id+' received one confirmation. Confirmations: '+ r.confirmations);
                    }
                }
            }).fail(function(e) {
                console.log('Error: '+e);
            });

        }
    },
};


module.exports = witness;
