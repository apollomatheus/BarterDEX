

// Release Notes Notifications code //

notify_release_notes_init();

function notify_release_notes_init() {

	var default_release_notes_settings = {"hide": false}
	var current_app_version = JSON.parse(localStorage.getItem('mm_barterdex_app_info')).app_version;

	if (JSON.parse(localStorage.getItem('mm_notify_release_notes')) == null) {
		console.warn(`localStorage object mm_notify_release_notes not found. Creating with default values...`);
		localStorage.setItem('mm_notify_release_notes', JSON.stringify(default_release_notes_settings));

		console.log(current_app_version);
		localStorage.setItem('mm_notify_known_app_version', current_app_version);

		var notify_read_notes_fn = function() {
			return new Promise(function(resolve, reject) {
				var read_notes_value = ShepherdIPC({ "command": "read_release_notes" });
				//console.log(read_notes_value)
				resolve(read_notes_value);
			})
		}

		notify_read_notes_fn()
		.then(function(read_notes_result) { 
			//console.log(read_notes_result);
			show_release_notes_dialog(read_notes_result);
		})
	} else {
		console.log(current_app_version);

		var lstore_known_app_version = localStorage.getItem('mm_notify_known_app_version');
		var lstore_notify_notes_show =  JSON.parse(localStorage.getItem('mm_notify_release_notes')).hide;
		console.log(lstore_notify_notes_show);

		if (current_app_version !== lstore_known_app_version) {
			var notify_read_notes_fn = function() {
				return new Promise(function(resolve, reject) {
					var read_notes_value = ShepherdIPC({ "command": "read_release_notes" });
					//console.log(read_notes_value)
					resolve(read_notes_value);
				})
			}

			notify_read_notes_fn()
			.then(function(read_notes_result) { 
				//console.log(read_notes_result);
				show_release_notes_dialog(read_notes_result);
				localStorage.setItem('mm_notify_known_app_version', current_app_version);
			})
		} else if (lstore_notify_notes_show == false) {
			console.log('notify known app version matches');
			var notify_read_notes_fn = function() {
				return new Promise(function(resolve, reject) {
					var read_notes_value = ShepherdIPC({ "command": "read_release_notes" });
					//console.log(read_notes_value)
					resolve(read_notes_value);
				})
			}

			notify_read_notes_fn()
			.then(function(read_notes_result) { 
				//console.log(read_notes_result);
				show_release_notes_dialog(read_notes_result);
				localStorage.setItem('mm_notify_known_app_version', current_app_version);
			})
		} /*else {
			console.log('notify known app version matches');
			console.log('not showing release notes, as settings set to hide');
		}*/
	}
}


function show_release_notes_dialog(notes_data) {
	//console.log(notes_data);

	var current_app_version = JSON.parse(localStorage.getItem('mm_barterdex_app_info')).app_version;
	
	var rel_noti_dialog = bootbox.dialog({
		backdrop: false,
		onEscape: false,
		title: `Release Notification - ${current_app_version}`,
		message: `<div class="notify_rel_body_text"></div><br>
					<div class="row">
						<div class="col-sm-6 notify_rel_body_checkbox"><input class="notify_rel_toggle" type="checkbox" data-toggle="toggle" data-on="Hide" data-off="Show" data-size="small"> Don't show until next update</div>
						<div class="col-sm-6" style="text-align: right;"><buttons class="btn btn-primary notify_release_button">OK</buttons></div>
					</div>`,
		closeButton: false,
		size: 'large'
	});
	rel_noti_dialog.init(function(){
		rel_noti_dialog.find('.notify_rel_body_text').html(`<pre style="white-space: pre-wrap; background-color: #2a2a2a;">${notes_data}</pre>`);

		$('.notify_release_button').click(function () {
			var show_hide_rel_notify = {"hide": $('.notify_rel_toggle').prop('checked')};
			localStorage.setItem('mm_notify_release_notes', JSON.stringify(show_hide_rel_notify));
			rel_noti_dialog.modal('hide');
		});
	});

}