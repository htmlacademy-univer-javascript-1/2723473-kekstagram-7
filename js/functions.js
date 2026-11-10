window.isStringLengthValid = (string, maxLength) => string.length <= maxLength;

window.isPalindrome = (string) => {
  const normalizedString = string.toLowerCase().replace(/\s/g, '');
  const reversedString = normalizedString.split('').reverse().join('');

  return normalizedString === reversedString;
};

window.extractDigits = (value) => {
  const stringValue = value.toString();
  let digits = '';

  for (let index = 0; index < stringValue.length; index += 1) {
    const digit = parseInt(stringValue[index], 10);

    if (!Number.isNaN(digit)) {
      digits += digit;
    }
  }

  return digits === '' ? NaN : parseInt(digits, 10);
};

window.isMeetingInWorkday = (workdayStart, workdayEnd, meetingStart, meetingDuration) => {
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const workdayStartMinutes = timeToMinutes(workdayStart);
  const workdayEndMinutes = timeToMinutes(workdayEnd);
  const meetingStartMinutes = timeToMinutes(meetingStart);
  const meetingEndMinutes = meetingStartMinutes + meetingDuration;

  return meetingStartMinutes >= workdayStartMinutes && meetingEndMinutes <= workdayEndMinutes;
};
