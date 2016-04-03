/**
 * Created by Rick Stewart on 03/19/2016.
 */
/**
 * set JSHint not to flag these variables as 'unresolved variable'
 * @param channelResponse.stream
 * @param channelResponse.stream.channel
 * @param data.logo
 *
 */
'use strict';
function twitchTvMain() {
	var channels = ['FreeCodeCamp', 'storbeck', 'StreamerHouse', 'terakilobyte', 'noobs2ninjas', 'monstercat',
		'habathcx', 'RobotCaleb', 'thomasBallinger', 'beohoff', 'MedryBW', 'riotgames', 'brunofin'];
	var undoFilteredChannels = [];
	var keystrokeCount = 0;
	var keystrokeCountPrevious = 0;

	/* function refreshChannelData() calls queryChannelByJsonp() once for each channel being tracked. */
	var refreshChannelData = function () {
		channels.map(function (channel) {   // for each channel being followed.
			queryChannelByJsonp(channel);
		});
	};

	/* function parseResponse() is passed the data from a TwitchTV channel query and determines the channel
	 * state ( ie. online, offline, unavailable ) and if online it captures a channel description summary.
	 * Lastly it returns the gathered information as an object. */
	var parseResponse = function (channelResponse) {
		if (channelResponse.status === 422) {
			return {'message': 'Twitch account is Closed', 'status': 'offline'};
		}
		else if (channelResponse.stream === null) {
			return {'message': 'Channel is Offline', 'status': 'offline'};
		}
		else {
			return {'message': channelResponse.stream.channel.status, 'status': 'online'};
		}
	};

	/* function queryChannelByJsonp() is passed a TwitchTV channel name, performs a JSON-P query of that
	 * channel, and upon success returns TwitchTV's response, or on an error message upon a failure. The
	 * first .getJSON() query uses the 'streams' parameter, then after results have returned the second
	 * nested .getJSON query is called using the 'channels' parameter to fetch the channel's logo graphic.*/
	function queryChannelByJsonp(channel) {
		var baseStreamsURL = 'https://api.twitch.tv/kraken/streams/';  // using 'streams' parameter.
		var baseChannelsURL = 'https://api.twitch.tv/kraken/channels/';  // using 'channels' parameter.
		var fallbackImage = './images/twitch-symbol2.jpg';
		var streamsData;
		var channelsData;
		var allData = {};
		var streamsStatusURL = baseStreamsURL + channel + '?callback=?';
		var channelsStatusURL = baseChannelsURL + channel + '?callback=?';
		$.getJSON(streamsStatusURL, {})
			.done(function (data) {
				streamsData = parseResponse(data);
				allData.message = streamsData.message; // add new property 'message'.
				allData.status = streamsData.status;   // add new property 'status'.
				$.getJSON(channelsStatusURL, {})
					.done(function (data) {
						if (data.logo === null || data.logo === undefined) {
							channelsData = {'icon': fallbackImage};
						}
						else {
							channelsData = {'icon': data.logo};
						}
						allData.icon = channelsData.icon;
						displayUpdateResults(channel, allData);
					});
			});
	}

	/* function displayUpdateResults() formats the result of a channel query and outputs the information
	 * to the webpage. */
	function displayUpdateResults(channel, channelData) {
		var $div = $('<div>', {id: channel, class: 'response ' + channelData.status});
		var channelStatus;
		$('#response-area').append($div);
		if (channelData.status === 'online') {
			channelStatus = '<img src="./images/online.png" class="statusImage">';
		}
		else {
			channelStatus = '<img src="./images/offline.png" class="statusImage">';
		}
		$(channelStatus).appendTo('#' + channel);
		var str = '<img src="' + channelData.icon + '">' + '<p>Channel: ' + '<span class="highlight">' +
			channel + '<br>' + '</span>' + channelData.message + '</p>';
		$(str).appendTo('#' + channel);
	}

	function hideOfflineDivs() {
		var offlineDivs = document.getElementById('response-area').getElementsByClassName('offline');
		for (var prop in offlineDivs) {
			if (offlineDivs.hasOwnProperty(prop)) {
				offlineDivs[prop].style.display = 'none';
			}
		}
	}

	function hideOnlineDivs() {
		var onlineDivs = document.getElementById('response-area').getElementsByClassName('online');
		for (var prop in onlineDivs) {
			if (onlineDivs.hasOwnProperty(prop)) {
				onlineDivs[prop].style.display = 'none';
			}
		}
	}

	function showOfflineDivs() {
		var offlineDivs = document.getElementById('response-area').getElementsByClassName('offline');
		for (var prop in offlineDivs) {
			if (offlineDivs.hasOwnProperty(prop)) {
				offlineDivs[prop].style.display = 'flex';
			}
		}
	}

	function showOnlineDivs() {
		var onlineDivs = document.getElementById('response-area').getElementsByClassName('online');
		for (var prop in onlineDivs) {
			if (onlineDivs.hasOwnProperty(prop)) {
				onlineDivs[prop].style.display = 'flex';
			}
		}
	}


		$('input[type="radio"]').change(function () {
			if ($(this).is(':checked')) {
				if (this.id === 'radio1') {
					showOnlineDivs();
					showOfflineDivs();
				}
				if (this.id === 'radio2') {
					showOnlineDivs();
					hideOfflineDivs();
				}
				if (this.id === 'radio3') {
					showOfflineDivs();
					hideOnlineDivs();
				}
			}
		});
	

	/*  */
	var filterChannelList = function (userInput) {
		var elementRefs = document.getElementById('response-area').children;
		var assembleFilter = '^(' + userInput + ')';
		var filter = new RegExp(assembleFilter, 'i');
		if (keystrokeCountPrevious > keystrokeCount) {
			for (var i = 0; i < undoFilteredChannels.length; i += 1) {
				undoFilteredChannels[i].style.display = 'flex';
			}
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
	};

	$('input[id="search-box"]').keyup(function () {
		keystrokeCountPrevious = keystrokeCount;
		keystrokeCount = $('#search-box').val().length;
		var userInput = $('#search-box').val();
		filterChannelList(userInput);
	});

	//$('input[id="search-box"]').keyup(function () {
	//	var userInput = $('#search-box').val();
	//	filterChannelList(userInput);
	//});

	/* run initial TwitchTV queries  */
	refreshChannelData();
}

/* Starts main program after webpage has loaded. */
$(document).ready(function () {
	twitchTvMain();
});

//TODO: implement 60 second data refresh indicator
//TODO: search box
//TODO: click link to open website
