// infowindow close button not working in mobile with visual refresh
//google.maps.visualRefresh = true; 
var mapDiv;
var map;
var marker;
var infowindow;
var today;
var weekday;
var upcomingHoliday;
var upcomingHolidayWeekday;
var upcomingHolidayPickup;
var holidayThisWeek;

var qryRecycle = 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/ServiceAreas/MapServer/12/' + 
    'query?f=json&inSR=4326&geometry={"spatialReference":{"wkid":4326},"x":'
var qryTrash = 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/ServiceAreas/MapServer/13/' + 
    'query?f=json&inSR=4326&geometry={"spatialReference":{"wkid":4326},"x":'
var qryMid = ',"y":'
var qryEnd = '}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outSR=' + 
    '4326&returnCountOnly=False&returnIdsOnly=False&returnGeometry=False&outFields=COLLDAY'
    
var geocoder = 'http://services.phila.gov/ULRS311/Data/Location/'
var reverseGeocoder = 'http://services.phila.gov/ULRS311/Data/Address/'

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
                if (!holidayThisWeek) {
                  markSpot(pos, '<div id="info"><p>' + standardAddr + 
                    '</p><h4>trash: ' + trashDay +
                    '</h4><h4>recycling: ' + recycleDay + '</h4></div>');
                } else if ((trashDay == upcomingHolidayWeekday) || 
                    (recycleDay == upcomingHolidayWeekday)) {
                  
                  var holidayMsg = upcomingHoliday.toDateString() + 
                    " is a holiday.\n\nCollection normally scheduled for that day will happen on\n" + 
                    upcomingHolidayPickup.toDateString() + "."
                  markSpot(pos, '<div id="info"><p>' + standardAddr + 
                    '</p><h5>' + holidayMsg + 
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
            var x = result.Locations[0].XCoord
            var y = result.Locations[0].YCoord
            
            getCollectionDays(x, y, standardAddr);
        } else {
            // no match found
            marker.setPosition(null);
            infowindow.close(marker.get('map'), marker);
        }
    });
}

function detectBrowser() {
  var useragent = navigator.userAgent;

  if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
  } else {
    mapDiv.style.width = '600px';
    mapDiv.style.height = '600px';
  }
}

function setupDates() {
  // for holiday collection schedule
  weekday = new Array(7);
  weekday[0] = 'SUN';
  weekday[1] = 'MON';
  weekday[2] = 'TUE';
  weekday[3] = 'WED';
  weekday[4] = 'THU';
  weekday[5] = 'FRI';
  weekday[6] = 'SAT';
  
  // remaining holidays for 2013 and through 2014
  // assuming 2014 holiday calendar is the same as for 2013
  var holidays = new Array(6); // holidays
  var holidayPickup = new Array(6); // rescheduled collection date for corresponding holiday
  
  holidays[0] = new Date(2013, 6, 4, 7); // Independence Day
  holidayPickup[0] = new Date(2013, 6, 5, 7);
  holidays[1] = new Date(2013, 8, 2, 7); // Labor Day
  holidayPickup[1] = new Date(2013, 8, 3, 7);
  holidays[2] = new Date(2013, 9, 14, 7); // Columbus Day
  holidayPickup[2] = new Date(2013, 9, 15, 7);
  holidays[3] = new Date(2013, 10, 11, 7);  // Veterans Day
  holidayPickup[3] = new Date(2013, 10, 12, 7);
  holidays[4] = new Date(2013, 10, 28, 7); // Thanksgiving
  holidayPickup[4] = new Date(2013, 10, 29, 7);
  holidays[5] = new Date(2013, 11, 25, 7);  // Christmas
  holidayPickup[5] = new Date(2013, 11, 26, 7);
  holidays[6] = new Date(2014, 0, 1, 7); // New Year's
  holidayPickup[6] = new Date(2014, 0, 2);
  holidays[7] = new Date(2014, 0, 20, 7); // MLK Day
  holidayPickup[7] = new Date(2014, 0, 21);
  holidays[8] = new Date(2014, 1, 17, 7); // President's Day
  holidayPickup[8] = new Date(2014, 1, 18);
  holidays[9] = new Date(2014, 2, 18, 7); // Good Friday
  holidayPickup[9] = new Date(2014, 2, 19);
  holidays[10] = new Date(2014, 4, 26, 7); // Memorial Day
  holidayPickup[10] = new Date(2014, 4, 27);
  holidays[11] = new Date(2014, 6, 4, 7); // Independence Day
  holidayPickup[11] = new Date(2014, 6, 5);
  holidays[12] = new Date(2014, 8, 1, 7); // Labor Day
  holidayPickup[12] = new Date(2014, 8, 2);
  holidays[13] = new Date(2014, 9, 13, 7); // Columbus Day
  holidayPickup[13] = new Date(2014, 9, 14);
  holidays[14] = new Date(2014, 10, 11, 7); // Veterans Day
  holidayPickup[14] = new Date(2014, 10, 12);
  holidays[15] = new Date(2014, 10, 27, 7); // Thanksgiving
  holidayPickup[15] = new Date(2014, 10, 28, 7);
  holidays[15] = new Date(2014, 11, 25, 7); // Christmas
  holidayPickup[15] = new Date(2014, 11, 26, 7);
  holidays[16] = new Date(2015, 0, 1, 7); // New Year's
  holidayPickup[16] = new Date(2015, 0, 2);
  
  today = new Date(); // now
  //today = new Date(2013, 6, 4, 6); // for testing holidays
  
  holidayThisWeek = false;
  var todayInt = today.getTime(); // for comparison as ints
  var endOfWeek = today;
  endOfWeek.setDate(today.getDate() + 7);
  var endOfWeekInt = endOfWeek.getTime();
  var holidayInt;
  for (var i = 0; i < holidays.length; i++ ) {
    holidayInt = holidays[i].getTime();
    if ( (holidayInt >= todayInt) && (holidayInt <= endOfWeekInt) ) {
      holidayThisWeek = true;
      upcomingHoliday = holidays[i];
      upcomingHolidayWeekday = weekday[upcomingHoliday.getDay()];
      upcomingHolidayPickup = holidayPickup[i];
      break;  // found next holiday this week
    } else if (holidayInt > endOfWeekInt) {
      break;  // no holidays this week
    }
  }
}

function initialize() {
  setupDates();  // check if there's a holiday today/this week
  
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
  
  if (holidayThisWeek) {
    alert(upcomingHoliday.toDateString() + 
        " is a holiday.\n\nCollection normally scheduled for that day will happen on\n" + 
        upcomingHolidayPickup.toDateString() + ".");
  }
}

function success(position) {
    //getCollectionDays(position.coords.longitude, position.coords.latitude, 
    //    position.coords.latitude.toString() + ', ' + position.coords.longitude.toString());
    
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

