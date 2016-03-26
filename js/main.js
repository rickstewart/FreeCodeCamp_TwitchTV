/**
 * Created by Rick Stewart on 03/19/2016.
 */
/**
 * set JSHint not to flag these variables as 'unresolved variable'
 * @param data.query.pages
 *
 */
'use strict';
function twitchTvMain() {
	var dataStore = [];
	var channels = ['ESL_SC2', 'OgamingSC2', 'FreeCodeCamp', 'noobs2ninjas', 'brunofin'];
	var domRefResponseArea = document.getElementById('response-area');

	var parseResponse = function(channelResponse) {
		if(channelResponse.status === 422) {return {'status': 'Channel No Longer Available'};}
		else if(channelResponse.stream === null) {return {'status':'Channel is Offline'};}
		else {return channelResponse.stream.channel.status;}
	};

	function getStreamStatus(channel) {
		var baseURL = 'https://api.twitch.tv/kraken/streams/';
		var streamStatusURL = baseURL + channel + '?callback=?';
		$.getJSON(streamStatusURL, {})
			.done(function (data) {
				var temp = parseResponse(data);
				displayUpdateResults(channel, temp);
			})
			.fail(function () {
				displayUpdateResults(channel,'Oops, something went wrong on this channel...');
			});

	}

	var refreshChannelData = function() {
		channels.map(function(channel) {
			getStreamStatus(channel);
		});
	};

	function displayUpdateResults(channel, channelData) {
		var $div = $('<div>', {id: channel, class: 'response'}); // set format for new div.
		$('#response-area').append($div);                     // create new div in container.
		var str = '<p>' + channelData + '</p>';  // build article summary.
		$(str).appendTo('#' + channel);           // add article summary to the new div.
	}

	refreshChannelData();
}

$(document).ready(function () {
	twitchTvMain();
});

//TODO: implement 60 second data refresh indicator
