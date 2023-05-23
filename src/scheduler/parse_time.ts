export function parseTimeString(str: string, getSpan: boolean = false): number | null {
  str = str.trim();
  if (str.match(/[\/\-:]/) != null) {
    let date = new Date();
    date.setHours(0, 0, 0, 0);

    let match = str.match(/^([^ T]+)(?:[ T](.+))?$/)
    if (match == null) return null;

    let dateStr = match[1].match(/:/) == null ? match[1] : '';
    let timeStr = match[2] != null ? match[2] : match[1].match(/:/) ? match[1] : '';

    if (dateStr != '') {
      let matchGroups = dateStr.match(/^(?:(?<year>[0-9]{2,4})\/)?(?<month>[01][0-9])\/(?<day>[0-3][1-9])$/)?.groups;
      if (matchGroups == null) matchGroups = dateStr.match(/^(?<year>[0-9]{2,4})\-(?<month>[01][0-9])\-(?<day>[0-3][0-9])$/)?.groups;
      if (matchGroups == null) return null;
      if (matchGroups.year != null) date.setFullYear(matchGroups.year.length == 2 ? parseInt(matchGroups.year) + 2000 : parseInt(matchGroups.year));
      date.setMonth(parseInt(matchGroups.month) - 1);
      date.setDate(parseInt(matchGroups.day));
    }

    if (timeStr != '') {
      let matchGroups = timeStr.match(/^(?<hours>[0-2][0-9]):(?<minutes>[0-5][0-9])(?::(?<seconds>[0-5][0-9]))?$/)?.groups;
      if (matchGroups == null) return null;
      date.setHours(parseInt(matchGroups.hours));
      date.setMinutes(parseInt(matchGroups.minutes));
      if (matchGroups.seconds != null) date.setSeconds(parseInt(matchGroups.seconds));
    }

    if (getSpan) return date.getTime() - Date.now();
    else return date.getTime();
  } else {
    let matchGroups = str.match(/^(?<day>[0-9]+d)?(?<hours>[0-9]+h)?(?<minutes>[0-9]+m)?(?<seconds>[0-9]+s)?$/)?.groups;
    if (matchGroups == null || str == '') return null;

    let span = 0;
    if (matchGroups.day != null) span += parseInt(matchGroups.day.slice(0, -1)) * 24 * 60 * 60 * 1000;
    if (matchGroups.hours != null) span += parseInt(matchGroups.hours.slice(0, -1)) * 60 * 60 * 1000;
    if (matchGroups.minutes != null) span += parseInt(matchGroups.minutes.slice(0, -1)) * 60 * 1000;
    if (matchGroups.seconds != null) span += parseInt(matchGroups.seconds.slice(0, -1)) * 1000;

    if (getSpan) return span;
    else return Date.now() + span;
  }
}
