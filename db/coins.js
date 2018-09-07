const coins = {
    details: [
        { "asset":"ZCR", "coin":"ZCore", "eth":false, "fname":"ZCore", "rpcport":17291, 
            "lib": "zcore-lib",
            "electrum": {
                "enabled": false,
                "url": []
            },
            "explorer": {
                "tx": "http://explorer.zcore.cash/tx/",
                "addr": "http://explorer.zcore.cash/addr/",
            }
        },
        { "asset":"BTC", "coin":"Bitcoin", "eth":false, "fname":"Bitcoin",
            "lib": "bitcore-lib",
            "electrum": {
                "enabled": true,
                "url": []
            },
            "explorer": {
                "tx": "https://www.blockchain.com/btc/tx/",
                "addr": "https://www.blockchain.com/btc/address/",
            }
        },
    ],
    assets: ["ZCR","BTC"],
};

module.exports = coins;