// SETS DATE/TIME TO JULY 4th AT 6AM
var today;
var weekday;
var upcomingHoliday;
var upcomingHolidayWeekday;
var upcomingHolidayPickup;
var holidayThisWeek;

function holidayMessage() {
  return(upcomingHoliday.toDateString() + " is a holiday.\n\n" + 
    "Collection normally scheduled for that day will happen on\n" + 
    upcomingHolidayPickup.toDateString() + ".");
}

function holidayThisWeek() {
  return holidayThisWeek;
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
  
  //today = new Date(); // now
  today = new Date(2013, 6, 4, 6); // for testing holidays
  
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
  if (holidayThisWeek) {
    alert(holidayMessage());
  }
}

