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
	 * channel, and returns TwitchTV's response upon success, or an error message upon a failure. The
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
							if(data.logo === null) {
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
		$('#response-area').append($div);
		var str = '<img src="' + channelData.icon + '">' + '<p>Channel: ' + '<span class="highlight">' + channel + '<br>' + '</span>'  + channelData.message + '</p>';
		$(str).appendTo('#' + channel);
	}

	/* run initial TwitchTV queries  */
	refreshChannelData();
}

/* Starts main program after webpage has loaded. */
$(document).ready(function () {
	twitchTvMain();
});

//TODO: implement 60 second data refresh indicator
