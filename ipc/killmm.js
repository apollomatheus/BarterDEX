const os = require('os'),
  exec = require('child_process').exec,
  electron = require('electron'),
  app = electron.app,
  osPlatform = os.platform();

// kill rogue marketmaker copies on start
killMarketmaker = function (data, quit) {
  //no longer used
}

module.exports = killMarketmaker;