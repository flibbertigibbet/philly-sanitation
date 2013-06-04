// Google Maps version.  Doesn't use any ArcGIS javascript.

// infowindow close button not working in mobile with visual refresh
//google.maps.visualRefresh = true; 
var mapDiv;
var map;
var marker;
var infowindow;

var geocoder = 'http://services.phila.gov/ULRS311/Data/Location/'
var reverseGeocoder = 'http://services.phila.gov/ULRS311/Data/Address/'
var qryRecycle = 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/ServiceAreas/MapServer/12/' + 
    'query?f=json&inSR=4326&geometry={"spatialReference":{"wkid":4326},"x":'
var qryTrash = 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/ServiceAreas/MapServer/13/' + 
    'query?f=json&inSR=4326&geometry={"spatialReference":{"wkid":4326},"x":'
var qryMid = ',"y":'
var qryEnd = '}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outSR=' + 
    '4326&returnCountOnly=False&returnIdsOnly=False&returnGeometry=False&outFields=COLLDAY'

function getCollectionDays(x, y, standardAddr) {
    var trashDay = '';
    var recycleDay = '';
    $.getJSON(qryTrash + x + qryMid + y + qryEnd, function(result) {
        if (result.features.length > 0) {
            trashDay = result.features[0].attributes.COLLDAY;
            $.getJSON(qryRecycle + x + qryMid + y + qryEnd, function(result) {
                recycleDay = result.features[0].attributes.COLLDAY;
                
                var pos = new google.maps.LatLng(y, x);
    
                console.log(trashDay);
                console.log(recycleDay);
                // check if next scheduled collection date is a holiday
                if (!holidayThisWeek()) {
                  markSpot(pos, '<div id="info"><p>' + standardAddr + 
                    '</p><h4>trash: ' + trashDay +
                    '</h4><h4>recycling: ' + recycleDay + '</h4></div>');
                } else if ((trashDay == upcomingHolidayWeekday) || 
                    (recycleDay == upcomingHolidayWeekday)) {
                  markSpot(pos, '<div id="info"><p>' + standardAddr + 
                    '</p><h5>' + holidayMessage() + 
                    '</h5><p class="teensy">normally scheduled trash: ' + trashDay +
                    '</p><p class="teensy">normally scheduled recycling: ' + 
                    recycleDay + '</p></div>');
                } else {
                  markSpot(pos, '<div id="info"><p>' + standardAddr + 
                    '</p><h4>trash: ' + trashDay +
                    '</h4><h4>recycling: ' + recycleDay + '</h4></div>');
                }
             });
        } else {
            // no trash day found
            console.log('no trash day found for x:' + x + ' y:' + y);
            marker.setPosition(null);
            infowindow.close(marker.get('map'), marker);
        }
    });
}

function searchAddress() {
    var address = document.getElementById('address').value;
    $.getJSON(geocoder + encodeURI(address), function(result) {
        if (result.Locations.length > 0) {
            var standardAddr = result.Locations[0].Address.StandardizedAddress;
            var similarity = result.Locations[0].Address.Similarity;
            var x = result.Locations[0].XCoord;
            var y = result.Locations[0].YCoord;
            
            getCollectionDays(x, y, standardAddr);
        } else {
            // no match found
            marker.setPosition(null);
            infowindow.close(marker.get('map'), marker);
        }
    });
}

function initialize() {

  $.ajaxSetup({
    cache: true
  });

  // load holiday script and check if there's a holiday today/this week
  $.getScript("philly_sanitation_holidays.js", setupDates());
  
  mapDiv = document.getElementById('map');
  //detectBrowser();
  var mapOptions = {
    zoom: 12,
    center: new google.maps.LatLng(39.95278,-75.163851),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    zoomControl: true
  };
  map = new google.maps.Map(mapDiv, mapOptions);
  
  var image = 'images/trash.png';
  marker = new google.maps.Marker({map:map, title:'sanitation collection', icon:image});
  infowindow = new google.maps.InfoWindow();
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(marker.get('map'), marker);
  });
    
  google.maps.event.addDomListener(map, 'click', function(e) {
    console.log('clicked on ' + e.latLng.toString());
    
    // reverse geocode for address to put in label
    $.getJSON(reverseGeocoder + e.latLng.lng() + '/' + e.latLng.lat(), function(result) {
      if (result.Locations.length > 0) {
        var standardAddr = result.Locations[0].Address.StandardizedAddress;
        var similarity = result.Locations[0].Address.Similarity;
        getCollectionDays(e.latLng.lng(), e.latLng.lat(), standardAddr);
      } else {
        // no address found; try getting trash days anyways
        getCollectionDays(e.latLng.lng(), e.latLng.lat(), e.latLng.toString());
      }
    });
  });
  
  // try HTML5 geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    error("no HTML5 geolocation available");
  }
  
  if (holidayThisWeek()) {
    alert(holidayMessage());
  }
}

function success(position) {
    // reverse geocode for address to put in label
    $.getJSON(reverseGeocoder + position.coords.longitude + '/' + 
        position.coords.latitude, function(result) {
        if (result.Locations.length > 0) {
            var standardAddr = result.Locations[0].Address.StandardizedAddress;
            var similarity = result.Locations[0].Address.Similarity;
            getCollectionDays(position.coords.longitude, position.coords.latitude, standardAddr);
        } else {
            // no address found; try getting trash days anyways
            getCollectionDays(position.coords.longitude, position.coords.latitude,
                position.coords.latitude.toString() + ', ' + position.coords.longitude.toString());
        }
    });
}

function error(msg) {
  console.log(msg);
}

google.maps.event.addDomListener(window, 'load', initialize);

function markSpot(position, msg) {
    marker.setPosition(position);
    map.panTo(position);
    infowindow.setContent(msg);
    infowindow.open(marker.get('map'), marker);
}

$(document).ajaxStart(function() {
  $('#loading').show();
}).ajaxStop(function() {
  $('#loading').hide();
});

