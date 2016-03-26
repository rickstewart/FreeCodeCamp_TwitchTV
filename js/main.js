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
	var channels = ['ESL_SC2','OgamingSC2','FreeCodeCamp','Beohoff','cretetion'];
	var domRefResponseArea = document.getElementById('response-area');

	/* function search() makes the actual JSONP query to Wikipedia. It first builds the query string, then
	 * submits the query, and finally upon receiving back the search results passes these results to
	 * function displaySearchResults() to update the webpage.*/
	function getStreamStatus(channelName) {
		var baseURL = 'https://api.twitch.tv/kraken/streams/';
		var streamStatusURL = baseURL + channelName + '?callback=?';
		$.getJSON(streamStatusURL, {})
			.done(function (data) {
				/*return JSON.stringify(data, null, 2);*/
				var channelResponse = JSON.stringify(data, null, 2);
				parseResponse(channelResponse);      // has to go here - async callback hell.
			});
	}

	var parseResponse = function(channelResponse) {
		if(channelResponse.status === 422) {return 'Channel No Longer Available';}
		else if(channelResponse.stream === null) {return 'Channel is Offline';}
		else{return channelResponse.channel.status;}
	};

	var displayResults = function() {
		channels.map(function(channel) {
			dataStore.push(parseResponse(channel));
		});
		domRefResponseArea.innerHTML = JSON.stringify(dataStore, null, 2);
	};

	getStreamStatus();
	displayResults();
}

/* function runs main script when page has loaded. Program entry point. */
$(document).ready(function () {
	twitchTvMain();
});

//TODO: implement 60 second data refresh indicator

// 'use strict';
// function twitchTvMain() {
// var searchBox = document.getElementById('search-box');
// var randomURL = 'http://en.wikipedia.org/wiki/Special:Random';
// var searchURL = 'http://en.wikipedia.org/w/api.php?callback=?';
// var jsonData = '';
// var str = '';
// var startSub = '';
// var searchBoxValue = '';
//
// /* function getSearchBoxValue() sets the search box variable using user's search criteria. */
//function getSearchBoxValue() {
//	if (searchBox.value.length !== 0) {        // tests to see that search box is not empty.
//		searchBoxValue = searchBox.value;
//		/* Wikipedia suggests removing all line breaks from query string. */
//		searchBoxValue = searchBoxValue.replace(/(\r\n|\n|\r)/gm, '');
//	}
//}
//
///* function displaySearchResults() takes a JSON object as a passed argument, and then for each search
// * result contained in the object it generates a new div to contain the result and displays it. */
//function displaySearchResults(jsonData) {
//	searchBoxValue = '';                       // set search box value back to an empty string.
//	for (var prop in jsonData) {               // loop through each search result in the JSON object.
//		if (!jsonData.hasOwnProperty(prop)) {  // skip loop iteration if the property is from prototype.
//			continue;
//		}
//		str = JSON.stringify(jsonData[prop], null, 4);        // convert JSON entry to a string.
//		var $div = $('<div>', {id: prop, class: 'response'}); // set format for new div.
//		$('#response-area').append($div);                     // create new div in container.
//		startSub = str.indexOf('extract');                    // search the string for start of article summary.
//		str = '<p>' + str.substr(startSub + 11).split('</p>')[0] + '</p>';  // build article summary.
//		str = str.replace(/\\(?!\n)/g, '');    // remove all backslash characters not part of a newline.
//		$(str).appendTo('#' + prop);           // add article summary to the new div.
//	}
//}
//
///* function search() makes the actual JSONP query to Wikipedia. It first builds the query string, then
// * submits the query, and finally upon receiving back the search results passes these results to
// * function displaySearchResults() to update the webpage.*/
//function search() {
//	$.getJSON(searchURL, {                     // build the query string by adding following parameters:
//			action: 'query',
//			generator: 'search',
//			gsrnamespace: '0',
//			gsrsearch: searchBoxValue,
//			gsrlimit: '10',                    // sets the number of results returned.
//			prop: 'extracts',                  // sets results to article extracts (truncated article text).
//			exintro: '',
//			exlimit: 'max',
//			format: 'json'                     // sets returned results to json format.
//		})
//		.done(function (data) {                // when results have returned ( done ), update webpage.
//			jsonData = data.query.pages;
//			displaySearchResults(jsonData);
//		});
//}
//
///* function clearPreviousResults() removes all the article summary's from the webpage. */
//function clearPreviousResults() {
//	$('#response-area').children('div').remove();
//}
//
///* function provides an event listener for the random search button, and on a click event does
// * a random article query on Wikipedia.  */
//$('#random-button').click(function () {
//	clearPreviousResults();                    // if there are old search results, clear them.
//	searchBox.value = '';                      // clear search box.
//	window.open(randomURL);                    // open a new window, do a random page search.
//});
//
///* function provides an event listener for the search button, and on a click event does
// * an article query on Wikipedia using user's search criteria.  */
//$('#search-button').click(function () {
//	clearPreviousResults();                    // if there are old search results, clear them.
//	getSearchBoxValue();                       // update variable holding search criteria.
//	searchBox.value = '';                      // clear search box.
//	search();                                  // run search.
//});
//
///* function provides an event listener for the search box, and detects the Enter key. On Enter key, do
// * an article query on Wikipedia using user's search criteria. */
//$('#search-box').keydown(function (event) {
//	if (event.keyCode === 13) {                // test for Enter key pressed (ASCII 13).
//		getSearchBoxValue();                   // update variable holding search criteria.
//		clearPreviousResults();                // if there are old search results, clear them.
//		searchBox.value = '';                  // clear search box.
//		search();                              // run Wikipedia search.
//		return false;                          // return prevents premature Submit of input text box.
//	}
//	else {
//		getSearchBoxValue();                   // else just update variable.
//	}
//});
//
///* function detects if a Wikipedia article summary has been clicked, and if so the article is displayed */
//$('#response-area').click(function (e) {
//	if ($(e.target).parent().closest('div').attr('class') === 'response') { // selects for article text.
//		var articleID = $(e.target).parent().closest('div').attr('id');     // finds the id of the div.
//		window.open('http://en.wikipedia.org/wiki?curid=' + articleID);     // get article.
//	}
//	else if ($(e.target).closest('div').attr('class') === 'response') {   // else selects border area around text.
//		window.open('http://en.wikipedia.org/wiki?curid=' + $(e.target).closest('div').attr('id')); // get article.
//	}
//});
//
//}
//
///* function runs main script when page has loaded. Program entry point. */
//$(document).ready(function () {
//	twitchTvMain();
//});
//
