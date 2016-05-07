/**
 * Created by Rick Stewart on 04/19/2016.
 */
/**
 * set JSHint not to flag these variables as 'unresolved variable'
 * @param channelResponse.stream
 * @param channelResponse.stream.channel
 * @param data.logo
 *
 */


/* Function twitchTvMain() provides a namespace to the remainder of the program. Allows retaining the state
 * of variables between calls to functions without Global variables.*/
function twitchTvMain() {
	'use strict';

	var channels;                   // holds list of tracked Twitch channels.
	var undoFilteredChannels;       // holds list of channels displayed before being filtered by 'Search'.
	var keystrokeCount;             // holds number of characters currently typed into 'Search' box.
	var keystrokeCountPrevious;     // holds number of characters previously typed into 'Search' box.
	var currentRadioButton;         // holds which radio button user has selected, 'All' 'Online' 'Offline" channels.
	var autoRefreshCheckbox;        // holds state of Auto Refresh checkbox - checked or unchecked.
	var channelsRespondCount;       // holds count of how many channels received a response back from the server.


	/* function init() initializes the state of the variables. */
	function init() {
		channels = ['FreeCodeCamp', 'storbeck', 'GamingLive_TV1', 'terakilobyte', 'noobs2ninjas', 'monstercat',
			'habathcx', 'RobotCaleb', 'thomasBallinger', 'beohoff', 'MedryBW', 'riotgames', 'brunofin', 'Ziqoftw'];
		undoFilteredChannels = [];
		keystrokeCount = 0;
		keystrokeCountPrevious = 0;
		currentRadioButton = 'radio1';                                              // default button 'radio1' - All Channels.
		autoRefreshCheckbox = document.getElementById('auto-refresh-checkbox');     // grab a reference.
		channelsRespondCount = getChannelsLength();                                 //default count set to total number of channels.
	}


	/* function getChannelsLength() returns a count of the Twitch TV channels being tracked. */
	function getChannelsLength() {
		return channels.length;
	}


	/* function incrementChannelQueryResponseCount() updates the integer count that corresponds to how many channel queries
	 * the Twitch servers have responded to. */
	function incrementChannelQueryResponseCount() {
		channelsRespondCount = channelsRespondCount + 1;
	}


	/* function getChannelQueryResponseCount() returns the integer count corresponding to how many channel queries
	 * the Twitch servers have responded to. */
	function getChannelQueryResponseCount() {
		return channelsRespondCount;
	}


	/* function resetChannelQueryResponseCount() returns the integer count corresponding to how many channel queries
	 * the Twitch servers have responded to back to zero. */
	function resetChannelQueryResponseCount() {
		channelsRespondCount = 0;
	}


	/* function setKeystrokeCount() updates the counter tracking the number of characters the user has typed into
	 * the Search box. */
	function setKeystrokeCount(searchStringLength) {
		keystrokeCount = searchStringLength;
	}


	/* function getKeystrokeCount() returns the number of characters the user has typed into the Search box. */
	function getKeystrokeCount() {
		return keystrokeCount;
	}


	/* function setKeystrokeCountPrevious() updates the counter tracking the number of characters the user previously typed into
	 * the Search box. */
	function setKeystrokeCountPrevious(searchStringLength) {
		keystrokeCountPrevious = searchStringLength;
	}


	/* function getKeystrokeCountPrevious() returns the number of characters the user previously typed into the Search box. */
	function getKeystrokeCountPrevious() {
		return keystrokeCountPrevious;
	}


	/* function refreshChannelData() calls queryChannelState() once for each Twitch channel being tracked. */
	function refreshChannelData() {
		channels.map(function (channel) {
			queryChannelState(channel);
		});
	}


	/* function recordRadioButtonClicked() tracks which radio button in the group is currently selected.*/
	function recordRadioButtonClicked(button) {
		currentRadioButton = button;
	}

	/* function parseResponse() is passed the data received back from a TwitchTV channel query and determines
	 * the channel state ( ie. online, offline, unavailable ), and if online it captures a channel description
	 * summary. Lastly it returns the gathered information as an object. */
	function parseResponse(channelResponse) {
		if (channelResponse.status === 422) {                                       // 422 - unprocessable Entity.
			return {'message': 'Twitch account is Closed', 'status': 'offline'};
		}
		else if (channelResponse.stream === null) {                                 // channel currently offline.
			return {'message': 'Channel is Offline', 'status': 'offline'};
		}
		else {                                                                      // else channel is online.
			return {'message': channelResponse.stream.channel.status, 'status': 'online'};
		}
	}


	/* function queryChannelState() is passed a TwitchTV channel name, sends a JSONP query to the Twitch
	 * servers, and upon success returns the TwitchTV's response, or an error message upon a failure. The
	 * first .getJSON() query uses the 'streams' parameter, then after results have returned a second
	 * nested .getJSON query is called using the 'channels' parameter to fetch the channel's logo graphic.*/
	function queryChannelState(channel) {
		var baseStreamsURL = 'https://api.twitch.tv/kraken/streams/';               // using 'streams' parameter.
		var baseChannelsURL = 'https://api.twitch.tv/kraken/channels/';             // using 'channels' parameter.
		var fallbackImage = './images/twitch-symbol2.jpg';                          // used if no image available.
		var streamsData;
		var channelsData;
		var allData = {};
		var streamsStatusURL = baseStreamsURL + channel + '?callback=?';            // build url, add the 'callback' parameter for
		var channelsStatusURL = baseChannelsURL + channel + '?callback=?';          // a JSONP style query.
		$.getJSON(streamsStatusURL, {})                                             // query Twitch servers for info on channel.
				.done(function (data) {
					streamsData = parseResponse(data);                                    // examine server response.
					allData.message = streamsData.message;                                // package 'message' into AllData object.
					allData.status = streamsData.status;                                  // package 'status' into AllData object.
					$.getJSON(channelsStatusURL, {})                                      // query Twitch servers for channel's image.
							.done(function (data) {
								if (data.logo === null || data.logo === undefined) {
									channelsData = {'icon': fallbackImage};                       // if no image on server package default image.
								}
								else {
									channelsData = {'icon': data.logo};
								}
								allData.icon = channelsData.icon;                               // package 'image' into AllData object.
								displayUpdateResults(channel, allData);                         // update display with channel name and allData object.
							});
				});
	}


	/* function displayUpdateResults() takes the result of a channel query, and outputs
	 * the information to the webpage. The argument 'channel' contains the channel's name,
	 * and 'channelData' contains the query response information. */
	function displayUpdateResults(channel, channelData) {
		var $div = $('<div>', {id: channel, class: 'response ' + channelData.status});  // construct new div.
		var channelStatus;
		incrementChannelQueryResponseCount();                                       // update counter to show Twitch server responded.
		$('#response-area').append($div);                                           // append newly constructed div to webpage.
		if (channelData.status === 'online') {
			channelStatus = '<img src="./images/online.png" class="statusImage">';    // if channel online, add online icon.
		}
		else {
			channelStatus = '<img src="./images/offline.png" class="statusImage">';   // if channel offline, add offline icon.
		}
		$(channelStatus).appendTo('#' + channel);                                   // add this icon to the new div on webpage.
		var str = '<img src="' + channelData.icon + '">' + '<p>Channel: ' + '<span class="highlight">' +
				channel + '<br>' + '</span>' + channelData.message + '</p>';            // build a message string.
		$(str).appendTo('#' + channel);                                             // add message to the new div on webpage.
	}


	/* function hideOfflineDivs() finds all the channels tagged as 'offline' and then hides them on the webpage. */
	function hideOfflineDivs() {
		var offlineDivs = document.getElementById('response-area').getElementsByClassName('offline'); // find divs tagged 'offline'.
		for (var prop in offlineDivs) {                                             // iterate over 'offline' divs collection.
			if (offlineDivs.hasOwnProperty(prop)) {                                   // make sure property is 'direct', not inherited.
				offlineDivs[prop].style.display = 'none';                               // hide div tagged as 'offline'.
			}
		}
	}


	/* function hideOnlineDivs() finds all the channels tagged as 'online' and then hides them on the webpage. */
	function hideOnlineDivs() {
		var onlineDivs = document.getElementById('response-area').getElementsByClassName('online'); // find divs tagged 'online'.
		for (var prop in onlineDivs) {                                              // iterate over 'online' divs collection.
			if (onlineDivs.hasOwnProperty(prop)) {                                    // make sure property is 'direct', not inherited.
				onlineDivs[prop].style.display = 'none';                                // hide div tagged as 'online'.
			}
		}
	}


	/* function showOfflineDivs() finds all the channels tagged as 'offline' and then displays them on the webpage. */
	function showOfflineDivs() {
		var offlineDivs = document.getElementById('response-area').getElementsByClassName('offline'); // find divs tagged 'offline'.
		for (var prop in offlineDivs) {                                             // iterate over 'offline' divs collection.
			if (offlineDivs.hasOwnProperty(prop)) {                                   // make sure property is 'direct', not inherited.
				offlineDivs[prop].style.display = 'flex';                               // display div tagged as 'offline'.
			}
		}
	}


	/* function showOnlineDivs() finds all the channels tagged as 'online' and then displays them on the webpage. */
	function showOnlineDivs() {
		var onlineDivs = document.getElementById('response-area').getElementsByClassName('online'); // find divs tagged 'online'.
		for (var prop in onlineDivs) {                                              // iterate over 'online' divs collection.
			if (onlineDivs.hasOwnProperty(prop)) {                                    // make sure property is 'direct', not inherited.
				onlineDivs[prop].style.display = 'flex';                                // display div tagged as 'online'.
			}
		}
	}


	/* function filterChannelList() takes the user's search string as an argument and builds the Regex expression from that to
	 * filter the names of the currently displayed Twitch channels so that only channels matching the search string remain. */
	function filterChannelList(userInput) {
		var elementRefs = document.getElementById('response-area').children;        // grab reference to each Twitch channel's output both visible and hidden.
		var assembledFilter = '^(' + userInput + ')';                               // build a filter expression using user's input.
		var filter = new RegExp(assembledFilter, 'i');                              // use filter expression to instantiate a new Regex object.
		if (getKeystrokeCountPrevious() > getKeystrokeCount()) {                    // test if user added new char or deleted last added char to search string.
			for (var i = 0; i < undoFilteredChannels.length; i += 1) {                // if char was deleted, restore display to unfiltered state.
				undoFilteredChannels[i].style.display = 'flex';
			}
			$('input[type="radio"]').trigger('change');                               // force radio button check which updates display per button selected.
		}
		for (var element in elementRefs) {                                          // iterate over collection of channel properties.
			if (elementRefs.hasOwnProperty(element)) {                                // make sure property is 'direct', not inherited.
				if (!$.isNumeric(element)) {                                            // make sure property is not a number.
					if (!element.match(filter) && elementRefs[element].style.display !== 'none') {  // test not matched to Regex filter, nor already hidden.
						elementRefs[element].style.display = 'none';                        // hide channel in webpage.
						undoFilteredChannels.push(elementRefs[element]);                    // add channel to collection tracking filtered out (hidden) channels.
					}
				}
			}
		}
	}


	/* function haltTimer() is responsible to stop the Auto Refresh timer.*/
	function haltTimer() {
		$('input[id="auto-refresh-checkbox"]').attr('checked', false);              // clear check in Auto Refresh checkbox.
		$('#refresh-timer').TimeCircles().stop();                                   // stop the timer.
	}


	/* function startTimer() is responsible to start the Auto Refresh timer.*/
	function startTimer() {
		$('input[id="auto-refresh-checkbox"]').attr('checked', true);               // clear check in Auto Refresh checkbox.
		$('#refresh-timer').TimeCircles().restart();                                // start the timer.
	}


	/* JQuery selector selects the webpage radio buttons and attaches a Listener. The Listener fires on a change, then checks
	 * if change was a button click. On a button click the passed in callback function tests to see which radio button was clicked
	 * and then executes the appropriate code. This code hides and un-hides channel data as appropriate to the radio button.*/
	$('input[type="radio"]').change(function () {
		if ($(this).is(':checked')) {
			if (this.id === 'radio1') {                                               // test if 'radio1' button clicked. ( display all channels )
				showOnlineDivs();                                                       // display all divs tagged as 'online'.
				showOfflineDivs();                                                      // display all divs tagged as 'offline'.
				recordRadioButtonClicked('radio1');                                     // update tracking of current radio button clicked.
			}
			if (this.id === 'radio2') {                                               // test if 'radio2' button clicked. ( display online channels )
				showOnlineDivs();                                                       // display all divs tagged as 'online'.
				hideOfflineDivs();                                                      // hide all divs tagged as 'offline'.
				recordRadioButtonClicked('radio2');                                     // update tracking of current radio button clicked.
			}
			if (this.id === 'radio3') {                                               // test if 'radio3' button clicked. ( display offline channels )
				showOfflineDivs();                                                      // display all divs tagged as 'offline'.
				hideOnlineDivs();                                                       // hide all divs tagged as 'online'.
				recordRadioButtonClicked('radio3');                                     // update tracking of current radio button clicked.
			}
		}
	});


	/* JQuery selector selects the webpage search box and attaches a Listener. The Listener fires on a character being typed
	 * into the search box ( or a char being deleted ). If the Auto Refresh timer is running, it is halted. The new user
	 * search string is fetched and sent on to filterChannelList(). */
	$('input[id="search-box"]').keyup(function () {
		haltTimer();                                                                // if running, halt Auto Refresh timer.
		var userInput = $('#search-box').val();                                     // get user search string input.
		setKeystrokeCountPrevious(getKeystrokeCount());                             // update previous count for characters in search string.
		setKeystrokeCount(userInput.length);                                        // update current count for characters in search string.
		filterChannelList(userInput);                                               // send change in search string to filterChannelList().
	});


	/* JQuery selector selects the Twitch channel information display area and attaches a Listener. The Listener fires when one of
	 * the displayed channels is clicked. The channel clicked is determined, and a new browser tab or window is spawned displaying
	 * the Twitch website containing that particular channel. Note that two cases exist for where the user could have clicked inside
	 * the channel display area, and both are checked. */
	$('#response-area').click(function (e) {
		var channelID = '';
		if ($(e.target).parent().closest('div').attr('class').indexOf('response') !== -1) {  // clickable area, case 1.
			channelID = $(e.target).parent().closest('div').attr('id');               // finds the channel id of the selected div.
			window.open('https:www.twitch.tv/' + channelID);                          // open Twitch website to that channel.
		}
		else if ($(e.target).closest('div').attr('class').indexOf('response') !== -1) {      // clickable area, case 2.
			channelID = $(e.target).closest('div').attr('id');                        // finds the channel id of the selected div.
			window.open('https:www.twitch.tv/' + channelID);                          // open Twitch website to that channel.
		}
	});


	/* JQuery selector selects the Auto Refresh checkbox and attaches a Listener. The Listener fires when the box is checked or
	 * unchecked. Checking the box starts the Refresh timer, and unchecking it stops the timer. Note that starting the Refresh timer
	 * clears the search box and restores display to pre-filtered state. */
	$('input[id="auto-refresh-checkbox"]').change(
			function () {
				$('input[id="search-box"]').val('');                                    // clear the search box.
				$('input[type="radio"]').trigger('change');                             // force radio button check which updates display per button selected.
				if ($(this).is(':checked')) {                                           // test if Auto Refresh box was checked or unchecked.
					startTimer();                                                         // if checked, start the Auto refresh timer.
				}
				else {                                                                  // else box was unchecked.
					haltTimer();                                                          // stop the Auto refresh timer.
				}
			});


	/* TimeCircles plugin used to provide a Auto Refresh timer. MIT license: https://github.com/wimbarelds/TimeCircles/blob/master/MIT.txt */
	$('#refresh-timer').TimeCircles({
		time: {
			Days: {
				show: false                                                             // options: hide Days.
			},
			Hours: {
				show: false                                                             // options: hide Hours.
			},
			Minutes: {
				show: false                                                             // options: hide Minutes.
			},
			Seconds: {
				color: '#4DCB6D'                                                        // options: customize color.
			}
		},
		start: false                                                                // disable automatic timer start.
	}).addListener(function (unit, amount, total) {                               // listens for clock ticks.
		var allowCheck = true;                                                      // open interlock. ( prevents unnecessary display refresh ).
		if (total === 0 && autoRefreshCheckbox.checked) {                           // timer has reached zero, and timer checkbox checked.
			$('input[id="search-box"]').val('');                                      // clear search box.
			$('#response-area').empty();                                              // clear channel display area of previous responses.
			refreshChannelData();                                                     // query the Twitch servers for latest channel information.
			startTimer();                                                             // restart countdown of Refresh Timer for next cycle.
			setInterval(function () {                                                 // Interval timer gives Twitch servers time to respond.
				if (getChannelQueryResponseCount() === getChannelsLength()) {           // if all channel queries received reply, allow display to update.
					allowCheck = true;
				}
				if (allowCheck === true && currentRadioButton === 'radio1') {           // refresh display case 1 - user selected button 'All Channels'.
					showOnlineDivs();                                                     // display all divs tagged as 'online'.
					showOfflineDivs();                                                    // display all divs tagged as 'offline'.
					resetChannelQueryResponseCount(0);                                    // reset server responded count to zero for next cycle.
					allowCheck = false;                                                   // reset the interlock.
				}
				else if (allowCheck === true && currentRadioButton === 'radio2') {      // refresh display case 2 - user selected button 'Online Channels'.
					showOnlineDivs();                                                     // display all divs tagged as 'online'.
					hideOfflineDivs();                                                    // hide all divs tagged as 'offline'.
					resetChannelQueryResponseCount(0);                                    // reset server responded count to zero for next cycle.
					allowCheck = false;                                                   // reset the interlock.
				}
				else if (allowCheck === true) {                                         // refresh display case 3 - user selected button 'Offline Channels'.
					showOfflineDivs();                                                    // display all divs tagged as 'offline'.
					hideOnlineDivs();                                                     // hide all divs tagged as 'online'.
					resetChannelQueryResponseCount(0);                                    // reset server responded count to zero for next cycle.
					allowCheck = false;                                                   // reset the interlock.
				}
			}, 400);                                                                  // 400 ms seems to give Twitch servers enough time to respond.
		}
	});


	/* run initial TwitchTV queries  */
	init();                                                                       // on program startup - initialize variables.
	refreshChannelData();                                                         // on program startup - perform initial channel queries.
}


/* Starts main program after webpage has loaded. */
$(document).ready(function () {
	'use strict';
	twitchTvMain();
});
