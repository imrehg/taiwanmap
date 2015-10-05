var overlay,
    mapData,
    transparency = false,
    querystring = [],
    hash;

/* Store maps in subdirectory */
var mapsLocation = 'maps/';

/* Get query string */
var q = document.URL.split('?')[1];
if(q != undefined){
    q = q.split('&');
    for(var i = 0; i < q.length; i++){
	hash = q[i].split('=');
	querystring.push(hash[1]);
		    querystring[hash[0]] = hash[1];
    }
}

if (querystring['transparent'] === 'true') {
    transparency = true;
}

$.getJSON( "taiwanmap.json", function( data ) {
    console.log(data);
    mapData = data;
    initMap();
});

var historicalOverlay,
    map;

function initMap() {
    var locationName = querystring['location'];
    if (!mapData[locationName]) {
        locationName = 'Taipei';
	console.log("Can't find!");
    }
    var location = mapData[locationName];
    document.title = location['name'] + " / " + locationName;

    map = new google.maps.Map(document.getElementById('map'), {
	zoom: location['zoom'],
	center: {lat: location['center']['lat'], lng: location['center']['lng']},
	mapTypeId: google.maps.MapTypeId.SATELLITE
    });
    
    var imageBounds = {
        north: location['bounds']['north'],
        east: location['bounds']['east'],
        south: location['bounds']['south'],
        west:location['bounds']['west']
    };

    var mapImage = mapsLocation + location['map'];

    $.ajax({
        url : mapImage,
        cache: true,
        processData : false,
        success: function() {
            historicalOverlay = new google.maps.GroundOverlay(
	        mapImage,
	        imageBounds);
            historicalOverlay.setMap(map);
            historicalOverlay.setOpacity(0.8);
            console.log("Finished loading!");
            $("#loading-spinner").hide();
        }
    });

    // Set map list dropdown
    var maplist = $("#panel > select");
    $.each(mapData, function(key, value) {
	maplist.append($("<option></option>").attr("value",key).text(value['name'] + " / " + key));
    });
    maplist.val(locationName);
    maplist.change(function() {
	var newQuery = $.param({ location: maplist.val() });
	window.location.href = window.location.origin + window.location.pathname + "?" + newQuery;
    });
}

var toggleVisibility = function() {
    if (historicalOverlay.getMap()) {
	historicalOverlay.setMap(null);
    } else {
	historicalOverlay.setMap(map);
    }
};

var opacitySlider;
var updateOpacity = function() {
    historicalOverlay.setOpacity( opacitySlider.val() / 10 );
};

$(document).ready(function() {
    opacitySlider = $("#opacity");
});
