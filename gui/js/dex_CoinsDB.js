
function BarterDEX_Init_CoinsDB() {
	var barterDEX_app_info = ShepherdIPC({ "command": "app_info" });
	//console.log(barterDEX_app_info);

	localStorage.setItem('mm_barterdex_app_info', JSON.stringify(barterDEX_app_info));

	CoinsDB_ManageCoinsJson();

	//Populate drop down select coins options in app//
	$('.trading_pair_coin').html(CoinDB_coin_json_select_options());
	$('.trading_pair_coin2').html(CoinDB_coin_json_select_options());

	$('.sell_coin').html(CoinDB_coin_json_select_options());
	$('.buy_coin').html(CoinDB_coin_json_select_options());

	$('.sell_coin_p').html(CoinDB_coin_json_select_options());
	$('.buy_coin_p').html(CoinDB_coin_json_select_options());

	// Startup coins select options populated with all coins db select options //
	$('.addcoin_startup_select').html(CoinDB_coin_json_select_options());

	CoinDB_login_select_options();
}

function CoinsDB_List(detailed) {
	const db = require('../../db/');
	if (detailed) return db.coins.details;
	return db.coins.assets;
}

function CoinsDB_ManageCoinsJson(coins_json_action) {
	
	var clist = CoinsDB_List(false);

	switch (coins_json_action) {
		case 'add':
			console.log('Adding: ' + coins_json_data);
			break;

		case 'remove':
			console.log('Removing: ' + coins_json_data);
			break;

		case 'reset':
			console.log('Resetting localStorage Coins DB array...');
			CoinsDB_ManageCoinsDetails('reset');
			return clist;
			
		default:
			console.warn(`No action specified. Executing default action...`);
			break;
	}
}

function CoinsDB_ManageCoinsDetails(coins_detail_action) {
	//TODO
	var coin_list = CoinsDB_List(true);

	switch (coins_detail_action) {
		case 'gen':
			console.log(`Generating coins.json file...`);
			console.log(coin_list);
			break;

		case 'reset':
			console.log('Resetting existing coins.json file...');
			break;

		default:
			console.log(`Default action. No action selected.`);
			break;
	}
}


function CoinsDB_GetCoinDetails(coin_code) {

	return {};
}

function CoinDB_coin_json_select_options() {
	const cdetails = require('../../db').coins.details;

	var options_data = '';
	$.each(cdetails, function(index, value){
		options_data += `
<option data-content="<img src='${value.coin}/icons/${value.coin.toLowerCase()}.png' width='30px;'/> ${value.fname} (${value.coin})" data-tokens="${value.coin.toLowerCase()} ${value.fname} ">${value.coin}</option>`;
	});

	return options_data;
}

function CoinDB_manage_coin_select_options() {
	const cdetails = require('../../db').coins.details;
	
	var options_data = '';

	$.each(cdetails, function(index, value){
		options_data += ` <option data-content="<img src='${value.coin}/icons/${value.coin.toLowerCase()}.png' width='30px;'/> ${value.fname} (${value.coin})" data-tokens="${value.coin.toLowerCase()} ${value.fname} ">${value.coin}</option>`;
	});

	$('.addcoin_coinsdb_select').selectpicker('destroy');
	$('.addcoin_coinsdb_select').html(options_data);
	$('.addcoin_coinsdb_select').selectpicker('render');
}

setTimeout(function(){
	CoinDB_manage_coin_select_options();
}, 5 * 1000);

function CoinDB_login_select_options() {
	var coinsdbdir = JSON.parse(localStorage.getItem('mm_barterdex_app_info')).CoinsDBDir;
	var login_select_options = '';

	login_select_options = `
	<option data-content="<img src='${coinsdbdir}/icons/kmd.png' width='50px;'/> ZCore - Decentralized Exchange" data-tokens="ZCoreDex ">ZCoreDex</option>
	`

	setTimeout(function(){
		$('.login_mode_options').selectpicker('destroy');
		$('.login_mode_options').html(login_select_options);
		$('.login_mode_options').selectpicker('render');
	}, 1 * 1000);
}