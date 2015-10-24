var overlay,
    mapData,
    params = {};

/* Store maps in subdirectory */
var mapsLocation = 'maps/';

var getParameters = function() {
    var query,
        vars;
    /* params */
    query = window.location.search.substring(1);
    vars = query.split("&");
    vars.forEach(function(item) {
        var pair = item.split("=");
        params[pair[0]] = pair[1];
    });
    /* hash */
    query = window.location.hash.substring(1);
    if (query.length > 0) {
        vars = query.split("&");
        vars.forEach(function(item) {
            var pair = item.split("=");
            params[pair[0]] = pair[1];
        });
    };
};

$.getJSON( "taiwanmap.json", function( data ) {
    console.log(data);
    mapData = data;
    initMap();
});

var historicalOverlay,
    map;

function initMap() {
    getParameters();
    var locationName = params['location'];
    if (!mapData[locationName]) {
        locationName = 'Taipei';
	console.log("Can't find!");
    }
    var location = mapData[locationName];
    document.title = location['name'] + " / " + locationName;

    if (params['lat'] && params['lng'] && params['z']) {
        /* load at requested coordinates */
        map = new google.maps.Map(document.getElementById('map'), {
	    zoom: parseInt(params['z']),
	    center: {lat: parseFloat(params['lat']), lng: parseFloat(params['lng'])},
	    mapTypeId: google.maps.MapTypeId.SATELLITE
        });
    } else {
        /* load at default coordinates */
        map = new google.maps.Map(document.getElementById('map'), {
	    zoom: location['zoom'],
	    center: {lat: location['center']['lat'], lng: location['center']['lng']},
	    mapTypeId: google.maps.MapTypeId.SATELLITE
        });
    };
    
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
        var newQuery = $.param({ location: encodeURIComponent(maplist.val()) });
        window.location.href = window.location.origin + window.location.pathname + "?" + newQuery;
    });

    /* Update location bar as map is moved around, so it can be shared */
    google.maps.event.addListener(map, 'idle', function() {
        document.location.hash = "lat="+this.getCenter().lat().toFixed(6)+
                        "&lng="+this.getCenter().lng().toFixed(6)+
                        "&z="+this.getZoom();
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
