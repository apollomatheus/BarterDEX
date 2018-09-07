const electron = require('electron'),
  app = electron.app,
  BrowserWindow = electron.BrowserWindow,
  path = require('path'),
  url = require('url'),
  os = require('os'),
  osPlatform = os.platform(),
  fsnode = require('fs'),
  fs = require('fs-extra'),
  mkdirp = require('mkdirp'),
  exec = require('child_process').exec,
  spawn = require('child_process').spawn,
  portscanner = require('portscanner'),
  fixPath = require('fix-path'),
  numCPUs = require('os').cpus().length,
  killmm = require('./killmm'),
  request = require('request'),
  { ipcMain } = require('electron');

var ps = require('ps-node'),
  shepherd = '',
  assetChainPorts = require('./ports.js'),
  BarterDEXDir;

Promise = require('bluebird');

// SETTING OS DIR TO RUN MARKETMAKER FROM
// SETTING APP ICON FOR LINUX AND WINDOWS
switch (osPlatform) {
  case "darwin":
    fixPath();
    BarterDEXDir = `${process.env.HOME}/Library/Application Support/BarterDEX`;
    CoinsDBIconsDir = `${process.env.HOME}/Library/Application Support/BarterDEX/CoinsDB/icons`;
    break;
    
  case "linux":
    BarterDEXDir = `${process.env.HOME}/.BarterDEX`;
    CoinsDBIconsDir = `${process.env.HOME}/.BarterDEX/CoinsDB/icons`;
    break;

  case "win32":
    BarterDEXDir = `${process.env.APPDATA}/BarterDEX`;
    BarterDEXDir = path.normalize(BarterDEXDir);
    CoinsDBIconsDir = `${process.env.APPDATA}/BarterDEX/CoinsDB/icons`;
    CoinsDBIconsDir = path.normalize(CoinsDBIconsDir);
    BarterDEXIcon = path.join(__dirname, '/assets/icons/barterdex/barterdex.ico');
    break;
}

//Make empty zeroconf log files if not there
fs.ensureFile(`${BarterDEXDir}/ZeroConf_Deposit_logFile.log`)
  .then(() => {
    console.log('success!')
    fs.readJson(`${BarterDEXDir}/ZeroConf_Deposit_logFile.log`, (err, zconf_deposit_log) => {
      if (err) console.error(err)
      var isitjson = typeof zconf_deposit_log == 'object';
      if (isitjson == false) {
        fs.appendFile(`${BarterDEXDir}/ZeroConf_Deposit_logFile.log`, `[]`, function (err) {
          if (err) throw err;
          console.log('ZeroConf deposit log updated!');
        });
      }
    })
  })
  .catch(err => { console.error(err); })

fs.ensureFile(`${BarterDEXDir}/ZeroConf_Claim_logFile.log`)
  .then(() => {
    console.log('success!')
    fs.readJson(`${BarterDEXDir}/ZeroConf_Claim_logFile.log`, (err, zconf_claim_log) => {
      if (err) console.error(err)
      var isitjson = typeof zconf_claim_log == 'object';
      if (isitjson == false) {
        fs.appendFile(`${BarterDEXDir}/ZeroConf_Claim_logFile.log`, `[]`, function (err) {
          if (err) throw err;
          console.log('ZeroConf claim log updated!');
        });
      }
    })
  })
  .catch(err => { console.error(err); })


fs.pathExists(_BarterDEXSettingsFile, (err, exists) => {
  if (exists === true) {
    console.log('barterdex settings file exist');
  } else if (exists === false) {
    console.log('barterdex settings file doesn\'t exist');
    fs.copy(defaultBarterDEXSettingsFile, _BarterDEXSettingsFile)
      .then(() => { console.log('barterdex settings file copied!') })
      .catch(err => { console.error(err) })
  }
  if (err) { console.error(err) } // => null
});

ipcMain.on('shepherd-command', (event, arg) => {
  //console.log('Shepard arg: ' + JSON.stringify(arg.command))  // prints arg
  switch (arg.command) {
    case 'ping':
      event.returnValue = 'pong'
      break;

    case 'login':
      console.log(BarterDEXBin + '\n' + BarterDEXDir);
      event.returnValue = 'Logged In';
      //const _passphrase = 'scatter quote stumble confirm extra jacket lens abuse gesture soda rebel seed nature achieve hurt shoot farm middle venture fault mesh crew upset cotton';
      //StartMarketMaker({ "passphrase": arg.passphrase });
      break;

    case 'logout':
      //killmm(true);
      event.returnValue = 'Logged Out';
      break;

    case 'mmstatus':
      //portscanner.checkPortStatus(7783, '127.0.0.1', function (error, status) {
      //  console.log(status)
      //  event.returnValue = status;
      //})
      break;

    case 'update_zeroconf_log':
      UpdateZeroConfLogs(arg.data);
      event.returnValue = 'Zeroconf log updated';
      break;

    case 'read_zeroconf_log':
      if (arg.type == 'deposit') {
        fs.readJson(`${BarterDEXDir}/ZeroConf_Deposit_logFile.log`)
          .then(zconf_deposit_log_file => { event.returnValue = zconf_deposit_log_file; })
          .catch(err => { console.error(err) })
      }
      if (arg.type == 'claim') {
        fs.readJson(`${BarterDEXDir}/ZeroConf_Claim_logFile.log`)
          .then(zconf_claim_log_file => { event.returnValue = zconf_claim_log_file; })
          .catch(err => { console.error(err) })
      }
      break;
      
    case 'remove_finished_swap_file':
      fs.remove(`${BarterDEXDir}/DB/SWAPS/${arg.requestid}-${arg.quoteid}.finished`)
        .then(() => {
          console.log('Removed: ' + `${BarterDEXDir}/DB/SWAPS/${arg.requestid}-${arg.quoteid}.finished`)
          event.returnValue = 'removed';
        })
        .catch(err => {
          console.error(err)
          event.returnValue = 'error';
        })
      break;

    case 'read_settings':
      fs.readJson(`${BarterDEXDir}/settings.json`)
        .then(barterdex_settings_file_output => { event.returnValue = barterdex_settings_file_output; })
        .catch(err => { console.error(err) })
      break;
      
    case 'update_settings':
      UpdateBarterDEXSettings(arg.data);
      event.returnValue = 'BarterDEX settings updated';
      break;

    case 'reset_settings':
      fs.copy(defaultBarterDEXSettingsFile, _BarterDEXSettingsFile, { overwrite: true })
        .then(() => { console.log('barterdex settings file copied!') })
        .catch(err => { console.error(err) })
      event.returnValue = 'reset_done';
      break;

    case 'app_info':
      var return_app_info_data = {"app_version": app.getVersion(),"BarterDEXDir": BarterDEXDir, "CoinsDBDir": CoinsDBDir, "CoinsDBIconsDir": CoinsDBIconsDir, "CoinsDBExplorersDir": "", "CoinsDBElectrumsDir": ""};
      event.returnValue = return_app_info_data;
      break;
      
    case 'get_lang_data':
      console.log(arg.lang);
      fs.readJson(path.join(__dirname, `../assets/languages/${arg.lang}.json`))
        .then(barterdex_deflang_file_output => {
          event.returnValue = barterdex_deflang_file_output;
        })
        .catch(err => { console.error(err); event.returnValue = ""; })
      break;

    case 'get_lang_file_list':
      fs.readdir(path.join(__dirname, `../assets/languages/`), function (err, lang_files) {
        if (err) throw err;
        console.log(lang_files);
        event.returnValue = lang_files;
      });
      break;

    case 'coins_db_dl':
      console.log("coins_db_dl",arg);
      event.returnValue = 'CoinsDB command executed';
      break;

    case 'coins_db_get_coins_file':
      console.log('Getting Coins DB file...');
      break;

    case 'coinsdb_manage':
      console.log(arg);
      event.returnValue = 'CoinsDB Manage command executed';
      break;

    case 'coins_db_update_coins_json_file':
      const _coinsListFile = BarterDEXDir + '/coins.json'
      fs.writeJsonSync(_coinsListFile, arg.data);
      event.returnValue = 'Coins JSON file updated!';
      break;

    case 'coins_db_read_coins_json':
      fs.readJson(`${BarterDEXDir}/coins.json`)
        .then(coins_json_file => { event.returnValue = coins_json_file; })
        .catch(err => { console.error(err); event.returnValue = []; })
      break;

    case 'coins_db_read_db':
      break;

    case 'coins_db_read_explorers':
      console.log(arg.coin);
      break;

    case 'coins_db_read_electrums':
      console.log(arg.coin);
      break;

    case 'read_release_notes':
      fs.readFile(path.join(__dirname, `../release_notes`), 'utf8')
        .then(release_notes_file_output => {
          //console.log(release_notes_file_output)
          event.returnValue = release_notes_file_output;
        })
        .catch(err => {
          console.error(err)
          event.returnValue = "";
        });
      break;

    default:
      event.returnValue = 'Command not found';
  }
})


StartMarketMaker = function (data) {
  /*
  try {
    
    //Delete coins.json file so that BarterDEX always gets the same copy of coins.json from default file.
    //Disable this line when coinsDB feature is enabled.
    //fs.unlink(BarterDEXDir + '/coins.json');
    // check if marketmaker instance is already running
    portscanner.checkPortStatus(7783, '127.0.0.1', function (error, status) {
      // Status is 'open' if currently in use or 'closed' if available
      if (status === 'closed') {
        const _coinsListFile = BarterDEXDir + '/coins.json'

        fs.pathExists(_coinsListFile, (err, exists) => {
          if (exists === true) {
            console.log('file exist');
            var coinslist_filedata = fs.readJsonSync(_coinsListFile, { throws: false });
            data.coinslist = ProcessCoinsList(coinslist_filedata);
            // data.coinslist is not used under Windows, if coins.json already exists
            // it will be directly used by marketmaker
            ExecMarketMaker(data);
          } else if (exists === false) {
            console.log('file doesn\'t exist');
            fs.copy(defaultCoinsListFile, _coinsListFile)
              .then(() => {
                console.log('file copied!')
                var coinslist_filedata = fs.readJsonSync(_coinsListFile, { throws: false });
                data.coinslist = ProcessCoinsList(coinslist_filedata);
                if (os.platform() === 'win32') { fs.writeJsonSync(_coinsListFile, data.coinslist); } // ver.2
                ExecMarketMaker(data);
              })
              .catch(err => { console.error(err) })
          }
          if (err) { console.error(err) } // => null
        })
      } else { console.error(`port 7783 marketmaker is already in use`); }
    });
  } catch (e) { console.error(`failed to start marketmaker err: ${e}`); }
  */
}

let mmid;
ExecMarketMaker = function (data) {

}

UpdateZeroConfLogs = function (zeroconf_log_data) {
  if (zeroconf_log_data.type == 'deposit') {
    fs.ensureFile(`${BarterDEXDir}/ZeroConf_Deposit_logFile.log`)
      .then(() => {
        console.log('success!')
        fs.readJson(`${BarterDEXDir}/ZeroConf_Deposit_logFile.log`, (err, zconf_deposit_log) => {
          if (err) console.error(err)
          var isitjson = typeof zconf_deposit_log == 'object';
          if (isitjson == false) {
            fs.appendFile(`${BarterDEXDir}/ZeroConf_Deposit_logFile.log`, `[` + zeroconf_log_data.logdata + `]`, function (err) {
              if (err) throw err;
              console.log('ZeroConf deposit log updated!');
            });
          } else {
            console.log(zconf_deposit_log);
            zconf_deposit_log.push(JSON.parse(zeroconf_log_data.logdata));
            console.log('===============\n' + zconf_deposit_log);
            fs.writeJsonSync(`${BarterDEXDir}/ZeroConf_Deposit_logFile.log`, zconf_deposit_log, function (err) {
              if (err) throw err;
              console.log('ZeroConf deposit log updated!');
            });
          }
        })
      })
      .catch(err => { console.error(err); })
  }

  if (zeroconf_log_data.type == 'claim') {
    fs.ensureFile(`${BarterDEXDir}/ZeroConf_Claim_logFile.log`)
      .then(() => {
        console.log('success!')
        fs.readJson(`${BarterDEXDir}/ZeroConf_Claim_logFile.log`, (err, zconf_claim_log) => {
          if (err) console.error(err)
          var isitjson = typeof zconf_claim_log == 'object';
          if (isitjson == false) {
            fs.appendFile(`${BarterDEXDir}/ZeroConf_Claim_logFile.log`, `[` + zeroconf_log_data.logdata + `]`, function (err) {
              if (err) throw err;
              console.log('ZeroConf claim log updated!');
            });
          } else {
            JSON.parse(zeroconf_log_data.logdata)
            zconf_claim_log.push(JSON.parse(zeroconf_log_data.logdata));
            fs.writeJsonSync(`${BarterDEXDir}/ZeroConf_Claim_logFile.log`, zconf_claim_log, function (err) {
              if (err) throw err;
              console.log('ZeroConf claim log updated!');
            });
          }
        })
      })
      .catch(err => { console.error(err); })
  }
}

UpdateBarterDEXSettings = function (settings_data) {
  console.log(settings_data);

  fs.ensureFile(_BarterDEXSettingsFile)
    .then(() => {
      fs.writeJsonSync(_BarterDEXSettingsFile, settings_data, function (err) {
        if (err) throw err;
        console.log('ZeroConf claim log updated!');
      });
    })
    .catch(err => { console.error(err); })
}



function ProcessCoinsList(coins) {

}

function CoinsDBDownloadFiles (action_data) {

}

function CoinsDB_Manage (action_data) {

  switch (action_data.cmd) {

    case 'gen':
      console.log(`Generate coins.json`);
      break;

    case 'update':
      console.log(`Update coins.json`);
      break;

    default:
      console.log(`Default action. No action selected.`);
      break;
  }

}
