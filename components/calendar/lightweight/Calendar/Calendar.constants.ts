// More info: https://date-fns.org/v2.30.0/docs/format
export enum TimeDateFormat {
  FULL_DATE = 'yyyy-MM-dd',
  FULL_DATE_TIME = 'yyyy-MM-dd HH:mm:ss',
  MONTH_YEAR = 'MMMM yyyy',
  DISPLAY_DATE = 'MMM do yyyy',
  DISPLAY_DATE_TIME = 'PPpp',
  SHORT_WEEKDAY = 'EEE',
  HOUR = 'hh a',
  HOUR_MINUTE = 'h:mma',
  MONTH_DAY_HOUR = 'dd.MM. h:mma',
}

// Default hour range for day and week timeline views
export const MIN_HOUR = 6; // 6 AM
export const MAX_HOUR = 23; // 11 PM (23:00)
