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
		currentRadioButton = 'radio1';                                           // default button 'radio1' - All Channels.
		autoRefreshCheckbox = document.getElementById('auto-refresh-checkbox');  // grab a reference.
		channelsRespondCount = getChannelsLength();                              //default count set to total number of channels.
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


	/* function setKeystrokeCount() updates the counter tracking the number of characters the user has typed into
	 * the Search box. */
	function setKeystrokeCount(searchStringLength) {
		keystrokeCount = searchStringLength;
	}


	/* function getKeystrokeCount() returns the number of characters the user has typed into the Search box. */
	function getKeystrokeCount() {
		return keystrokeCount;
	}


	/* function refreshChannelData() calls queryChannelState() once for each Twitch channel being tracked. */
	function refreshChannelData() {
		channels.map(function (channel) {
			queryChannelState(channel);
		});
	}


	/* function parseResponse() is passed the data received back from a TwitchTV channel query and determines
	 * the channel state ( ie. online, offline, unavailable ), and if online it captures a channel description
	 * summary. Lastly it returns the gathered information as an object. */
	function parseResponse(channelResponse) {
		if (channelResponse.status === 422) {                               // 422 - unprocessable Entity.
			return {'message': 'Twitch account is Closed', 'status': 'offline'};
		}
		else if (channelResponse.stream === null) {                         // channel currently offline.
			return {'message': 'Channel is Offline', 'status': 'offline'};
		}
		else {                                                              // else channel is online.
			return {'message': channelResponse.stream.channel.status, 'status': 'online'};
		}
	}


	/* function queryChannelState() is passed a TwitchTV channel name, sends a JSONP query to the Twitch
	 * servers, and upon success returns the TwitchTV's response, or an error message upon a failure. The
	 * first .getJSON() query uses the 'streams' parameter, then after results have returned a second
	 * nested .getJSON query is called using the 'channels' parameter to fetch the channel's logo graphic.*/
	function queryChannelState(channel) {
		var baseStreamsURL = 'https://api.twitch.tv/kraken/streams/';       // using 'streams' parameter.
		var baseChannelsURL = 'https://api.twitch.tv/kraken/channels/';     // using 'channels' parameter.
		var fallbackImage = './images/twitch-symbol2.jpg';                  // used if no image available.
		var streamsData;
		var channelsData;
		var allData = {};
		var streamsStatusURL = baseStreamsURL + channel + '?callback=?';    // build url, add the 'callback' parameter for
		var channelsStatusURL = baseChannelsURL + channel + '?callback=?';  // a JSONP style query.
		$.getJSON(streamsStatusURL, {})                                     // query Twitch servers for info on channel.
				.done(function (data) {
					streamsData = parseResponse(data);                            // examine server response.
					allData.message = streamsData.message;                        // package 'message' into AllData object.
					allData.status = streamsData.status;                          // package 'status' into AllData object.
					$.getJSON(channelsStatusURL, {})                              // query Twitch servers for channel's image.
							.done(function (data) {
								if (data.logo === null || data.logo === undefined) {
									channelsData = {'icon': fallbackImage};               // if no image on server package default image.
								}
								else {
									channelsData = {'icon': data.logo};
								}
								allData.icon = channelsData.icon;                       // package 'image' into AllData object.
								displayUpdateResults(channel, allData);                 // update display with channel name and allData object.
							});
				});
	}


	/* function displayUpdateResults() takes the result of a channel query, and outputs
	 * the information to the webpage. The argument 'channel' contains the channel's name,
	 * and 'channelData' contains the query response information. */
	function displayUpdateResults(channel, channelData) {
		var $div = $('<div>', {id: channel, class: 'response ' + channelData.status});  // construct new div.
		var channelStatus;
		incrementChannelQueryResponseCount();                 // update counter to show Twitch server responded.
		$('#response-area').append($div);                     // append newly constructed div to webpage.
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


	/*  */
	$('input[type="radio"]').change(function () {
		if ($(this).is(':checked')) {
			if (this.id === 'radio1') {
				showOnlineDivs();
				showOfflineDivs();
				currentRadioButton = 'radio1';
			}
			if (this.id === 'radio2') {
				showOnlineDivs();
				hideOfflineDivs();
				currentRadioButton = 'radio2';
			}
			if (this.id === 'radio3') {
				showOfflineDivs();
				hideOnlineDivs();
				currentRadioButton = 'radio3';
			}
		}
	});


	/*  */
	function filterChannelList(userInput) {
		var elementRefs = document.getElementById('response-area').children;
		var assembleFilter = '^(' + userInput + ')';
		var filter = new RegExp(assembleFilter, 'i');
		if (keystrokeCountPrevious > getKeystrokeCount()) {
			for (var i = 0; i < undoFilteredChannels.length; i += 1) {
				undoFilteredChannels[i].style.display = 'flex';
			}
			$('input[type="radio"]').trigger('change');
		}
		for (var element in elementRefs) {
			if (elementRefs.hasOwnProperty(element)) {
				if (!$.isNumeric(element)) {
					if (!element.match(filter) && elementRefs[element].style.display !== 'none') {
						elementRefs[element].style.display = 'none';
						undoFilteredChannels.push(elementRefs[element]);
					}
				}
			}
		}
	}


	/*  */
	$('input[id="search-box"]').keyup(function () {
		haltTimer();
		if (!autoRefreshCheckbox.checked) {
			var userInput = $('#search-box').val();
			keystrokeCountPrevious = getKeystrokeCount();
			setKeystrokeCount(userInput.length);
			filterChannelList(userInput);
		}
		else {
			$('input[id="search-box"]').val('');
			$('.alert').css('display', 'block');
		}
	});


	/*  */
	$('#response-area').click(function (e) {
		var channelID = '';
		if ($(e.target).parent().closest('div').attr('class').indexOf('response') !== -1) {
			channelID = $(e.target).parent().closest('div').attr('id');     // finds the id of the div.
			window.open('https:www.twitch.tv/' + channelID); // get channel
		}
		else if ($(e.target).closest('div').attr('class').indexOf('response') !== -1) {   // else selects border area around text.
			channelID = $(e.target).closest('div').attr('id');
			window.open('https:www.twitch.tv/' + channelID); // get channel
		}
	});

	
 /*  */
	$('input[id="auto-refresh-checkbox"]').change(
			function () {
				$('input[id="search-box"]').val('');
				$('input[type="radio"]').trigger('change');
				if ($(this).is(':checked')) {
					$('#refresh-timer').TimeCircles().restart();
				}
				else {
					$('#refresh-timer').TimeCircles().stop();
					$('.alert').css('display', 'none');
				}
			});

	
 /*  */
	$('.close').click(
			function () {
				$('.alert').css('display', 'none');
			});

	
	/*  */
	function haltTimer() {
		$('input[id="auto-refresh-checkbox"]').attr('checked', false);
		$('#refresh-timer').TimeCircles().stop();
	}


	/*  */
	$('#refresh-timer').TimeCircles({
		time: {
			Days: {
				show: false
			},
			Hours: {
				show: false
			},
			Minutes: {
				show: false
			},
			Seconds: {
				color: '#4DCB6D'
			}
		},
		start: false
	}).addListener(function (unit, amount, total) {
		var allowCheck = true;
		if (total === 0 && autoRefreshCheckbox.checked) {
			$('input[id="search-box"]').val('');
			$('#response-area').empty();
			refreshChannelData();
			$('#refresh-timer').TimeCircles().restart();
			setInterval(function () {
				if(getChannelQueryResponseCount() === getChannelsLength()) {allowCheck = true;}  // if all channel queries received a reply, allow display to update.
				if (allowCheck === true && currentRadioButton === 'radio1') {
					showOnlineDivs();
					showOfflineDivs();
					channelsRespondCount = 0;
					allowCheck = false;
				}
				else if (allowCheck === true && currentRadioButton === 'radio2') {
					showOnlineDivs();
					hideOfflineDivs();
					channelsRespondCount = 0;
					allowCheck = false;
				}
				else if(allowCheck === true ) {
					showOfflineDivs();
					hideOnlineDivs();
					channelsRespondCount = 0;
					allowCheck = false;
				}
			}, 400);
		}
	});


	/* run initial TwitchTV queries  */
	init();
	refreshChannelData();
}


/* Starts main program after webpage has loaded. */
$(document).ready(function () {
	'use strict';
	twitchTvMain();
});
