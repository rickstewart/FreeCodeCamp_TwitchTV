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
	var channels = ['FreeCodeCamp', 'storbech', 'StreamerHouse', 'terakilobyte', 'noobs2ninjas', 'monstercat',
		'habathcx', 'RobotCaleb', 'thomasBallinger', 'beohoff', 'MedryBW', 'riotgames'];

	/* function refreshChannelData() calls queryChannelByJsonp() once for each channel being tracked. */
	var refreshChannelData = function() {
		channels.map(function(channel) {   // for each channel being followed.
			queryChannelByJsonp(channel);
		});
	};

	/* function parseResponse() is passed the data from a TwitchTV channel query and determines the channel
	 * state ( ie. online, offline, unavailable ) and if online it captures a channel description summary.
	 * Lastly it returns the gathered information as an object. */
	var parseResponse = function(channelResponse) {
		if(channelResponse.status === 422) {return {'message': 'Channel No Longer Available', 'status': 'offline', };}
		else if(channelResponse.stream === null) {return {'message':'Channel is Offline', 'status': 'offline'};}
		else {return {'message': channelResponse.stream.channel.status, 'status': 'online'};}
	};

	/* function queryChannelByJsonp() is passed a TwitchTV channel name, performs a JSON-P query of that
	 * channel, and returns the TwitchTV response upon success, or an error message upon a failure. */
	function queryChannelByJsonp(channel) {
		var baseStreamsURL = 'https://api.twitch.tv/kraken/streams/';
		var baseChannelsURL = 'https://api.twitch.tv/kraken/channels/';
		var streamsData;
		var channelsData;
		var allData = {};
		var streamsStatusURL = baseStreamsURL + channel + '?callback=?';
		var channelsStatusURL = baseChannelsURL + channel + '?callback=?';
		$.getJSON(streamsStatusURL, {}) // TwitchTV query using 'streams' parameter.
			.done(function (data) {
				streamsData = parseResponse(data);  // process streams response.
				allData.message = streamsData.message;
				allData.status = streamsData.status;
			})
			.fail(function () {
				streamsData = {'message': 'Oops, something went wrong querying this channel...', 'status': 'offline'};
				allData.message = streamsData.message;
				allData.status = streamsData.status;
			});
		$.getJSON(channelsStatusURL, {}, displayUpdateResults(channel, allData))// TwitchTV query using 'channels' parameter.
				.done(function (data) {
					channelsData = data.logo === null ? {'icon': 'url("../images/twitch-symbol2.jpg")'} : {'icon': 'url("' + data.logo + '")'};
					allData.icon = channelsData.icon;
				})
				.fail(function () {
					channelsData = {'icon': 'url("../images/twitch-symbol2.jpg")'};
					allData.icon = channelsData.icon;
				});
	}

	/* function displayUpdateResults() formats the result of a channel query and outputs the information
	 * to the webpage. */
	function displayUpdateResults(channel, channelData) {
		var $div = $('<div>', {id: channel, class: 'response'}); // set format for new div.
		$('#response-area').append($div);                     // create new div in container.
		var str = '<p>Channel: ' + '<span class="highlight">' + channel + '<br>' + '</span>'  + channelData.message + '</p>';  // build article summary.
		$(str).appendTo('#' + channel);           // add article summary to the new div.
	}
	/* run initial queries  */
	refreshChannelData();
}

/* Starts main program after webpage has loaded. */
$(document).ready(function () {
	twitchTvMain();
});

//TODO: implement 60 second data refresh indicator
