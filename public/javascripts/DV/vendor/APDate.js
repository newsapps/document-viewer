/**
 * Author: Ryan Nagle
 * https://gist.github.com/rnagle/10181125
 *
 * APDate takes an object with keys describing a date/time. The method `ap` returns
 * a string using AP style for the specified day, month, year.
 *
 * Usage:
 *
 * var d = new APDate({ month: 8, day: 8, year: 1989 });
 * d.ap(); // "Aug. 8, 1989"
 *
 * var d = new APDate({ month: 8, day: 8 });
 * d.ap(); // "Aug. 8"
 *
 * var d = new APDate({ month: 8 });
 * d.ap(); // "August"
 *
 * Alternatively, provide a string representing a date:
 *
 * var d = new APDate("August 1989");
 * d.ap(); // Aug. 1, 1989
 *
 * NOTE: this does not provide a way to format times, only dates, months, years.
 *
 **/
var APDate = function(args) {
  this.defaults = {
    year: null,
    month: null,
    day: null
  };

  this.monthAbbreviations = {
    0: 'Jan.',
    1: 'Feb.',
    7: 'Aug.',
    8: 'Sept.',
    9: 'Oct.',
    10: 'Nov.',
    11: 'Dec.'
  };

  this.months = {
    0: 'January',
    1: 'February',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December'
  };

  if (typeof args == 'string') {
    this.date = new Date(args);
    this.opts = {
      month: this.date.getMonth(),
      day: this.date.getDate(),
      year: this.date.getFullYear()
    };
  } else {
    this.opts = this.extendDefaults(this.defaults, args);
    var now = new Date();
    // Year, month and day
    if (this.opts.year && this.opts.month && this.opts.day)
      this.date = new Date(this.opts.year, this.opts.month - 1, this.opts.day);
    // Year and month
    if (this.opts.year && this.opts.month && !this.opts.day)
      this.date = new Date(this.opts.year, this.opts.month - 1);
    // Month
    if (this.opts.month && !this.opts.year && !this.opts.day)
      this.date = new Date(now.getFullYear(), this.opts.month - 1);
    // Month and day
    if (this.opts.month && this.opts.day && !this.opts.year)
      this.date = new Date(now.getFullYear(), this.opts.month - 1, this.opts.day);
    if (!this.opts.month)
      throw "At minimum, must specify month for AP date";
  }
  return this;
};

APDate.prototype.extendDefaults = function(defaults, args) {
  var ret = {};
  for (var idx in defaults) {
    if (args[idx])
      ret[idx] = args[idx];
    else
      ret[idx] = defaults[idx];
  }
  return ret;
};

APDate.prototype.getMonthAbbreviation = function() {
  var ret = this.monthAbbreviations[this.date.getUTCMonth()];
  if (typeof ret == 'undefined')
    return this.months[this.date.getUTCMonth()];
  else
    return ret;
};

APDate.prototype.getMonthFull = function() {
  return this.months[this.date.getUTCMonth()];
};

APDate.prototype.ap = function() {
  // Aug. 8, 1989
  if (this.opts.year && this.opts.month && this.opts.day)
    return this.getMonthAbbreviation() + ' ' + this.date.getDate() + ', ' + this.date.getFullYear();
  // Aug. 1989
  if (this.opts.year && this.opts.month && !this.opts.day)
    return this.getMonthAbbreviation() + ' ' + this.date.getFullYear();
  // Aug. 8
  if (this.opts.month && this.opts.day && !this.opts.year)
    return this.getMonthAbbreviation() + ' ' + this.date.getDate();
  // August
  if (this.opts.month && !this.opts.day && !this.opts.year)
    return this.getMonthFull();
};
