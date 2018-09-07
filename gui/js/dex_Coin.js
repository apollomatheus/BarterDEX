const store = require('../../store/');

function getCoinAddressPrivateKey() {
   var coin = $('coin-selection').val();
   var address = $('address-selection').val();

   var privatekey = store.addressprivatekey({coin,address});

   if (privatekey.error) {

        bootbox.alert({
            onEscape: true,
            backdrop: true,
            title: "Something went wrong",
            message: privatekey.error,
            size: 'large'
        });
    
   } else {
    $('privatekey-field').html(privatekey);
   }
}

function getNewAddress() {
    var coin = $('coin-selection').val();
 
    var address = store.newaddress({coin});

   if (address.error) {
       
        bootbox.alert({
            onEscape: true,
            backdrop: true,
            title: "Something went wrong",
            message: address.error,
            size: 'large'
        });
    
   } else {
    $('address-field').html(address);
   }
}

function getAddressBalance() {
    
}

function getLastAddress() {
    var coin = $('coin-selection').val();
 
    var address = store.getaddress({coin});

   if (address.error) {
       
        bootbox.alert({
            onEscape: true,
            backdrop: true,
            title: "Something went wrong",
            message: address.error,
            size: 'large'
        });
    
   } else {
    $('address-field').html(address);
   }
}


function getNewCoin() {
    var coin = $('coin-selection').val();

    var result = store.newcoin({coin});

    if (result.error) {
       
        bootbox.alert({
            onEscape: true,
            backdrop: true,
            title: "Something went wrong",
            message: address.error,
            size: 'large'
        });
        return false;

   } else {
       return true;
   }
}
