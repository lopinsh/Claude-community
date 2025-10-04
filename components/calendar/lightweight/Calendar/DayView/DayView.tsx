import React, { useMemo, FC } from 'react';
import cn from 'classnames';
import {
  getDate,
  getMonth,
  getYear,
  isToday,
  format,
  getMinutes,
  getHours,
} from 'date-fns';
import { getKeyFromDateInfo, getTimeUnitString } from '../Calendar.helper';
import { TimeDateFormat, MIN_HOUR, MAX_HOUR } from '../Calendar.constants';
import { DayTimeViewProps } from './DayView.types';
import { DateInfo } from '../Calendar.types';

const getDateInfo = (date: Date): DateInfo => {
  return {
    day: getDate(date),
    month: getMonth(date),
    year: getYear(date),
    isCurrentDay: isToday(date),
    date: format(date, TimeDateFormat.FULL_DATE),
    timeDate: '',
    timeDateUTC: '',
  };
};

const DayView: FC<DayTimeViewProps> = ({
  renderItems,
  renderHeaderItems,
  currentDate,
  onDayNumberClick,
  onDayStringClick,
  onHourClick,
  onColorDotClick,
  onCellClick,
  onCellHeaderClick,
  timeDateFormat,
  preparedColorDots,
  locale,
  hourRange,
}) => {
  // Current day info
  const parsedCurrentDay = useMemo(() => {
    return getDateInfo(new Date(currentDate));
  }, [currentDate]);

  // Hour range - use dynamic values or fallback to constants
  const minHour = hourRange?.min ?? MIN_HOUR;
  const maxHour = hourRange?.max ?? MAX_HOUR;
  const hoursToShow = Array.from({ length: maxHour - minHour + 1 }, (_, i) => i + minHour);
  const totalMinutes = (maxHour - minHour + 1) * 60;

  return (
    <>
      <div data-cy="StringDay" className="days-component">
        <div
          onClick={(e) => onDayStringClick(currentDate, e)}
          className="days-component__day"
        >
          {format(
            new Date(currentDate),
            timeDateFormat.day || TimeDateFormat.SHORT_WEEKDAY,
            { locale },
          )}
        </div>
      </div>
      <div data-cy="DayViewInside" className="day-view-inside">
        <div className="day-header">
          <div
            className="day-header__number-color-dot"
            onClick={(e) => {
              const timeDate = getKeyFromDateInfo(parsedCurrentDay, 0);
              onCellHeaderClick(
                {
                  ...parsedCurrentDay,
                  hour: 0,
                  timeDate,
                  timeDateUTC: new Date(timeDate).toISOString(),
                },
                e,
              );
            }}
          >
            <p
              data-cy="DayNumber"
              className={cn(
                'day-header__number',
                parsedCurrentDay.isCurrentDay &&
                  'day-header__number--current-day',
              )}
              onClick={(e) => {
                e.stopPropagation();
                onDayNumberClick(parsedCurrentDay.date, e);
              }}
            >
              {parsedCurrentDay.day}
            </p>
            {preparedColorDots.dateKeys?.[parsedCurrentDay.date] && (
              <p
                data-cy="ColorDot"
                data-date={parsedCurrentDay.date}
                style={{
                  backgroundColor:
                    preparedColorDots.dateKeys[parsedCurrentDay.date]?.color,
                }}
                className="day-header__color-dot"
                onClick={(e) => {
                  e.stopPropagation();
                  onColorDotClick(
                    preparedColorDots.dateKeys[parsedCurrentDay.date],
                    e,
                  );
                }}
              />
            )}
          </div>
          {renderHeaderItems(parsedCurrentDay?.date)}
        </div>
        <div
          className="day-hour-rows"
          style={{
            gridTemplateRows: `repeat(${hoursToShow.length}, 60px)`,
          }}
        >
          <>
            <div data-cy="HourRows" className="day-hour-rows__border-bottom">
              {hoursToShow.map((hour) => (
                <div
                  key={hour}
                  data-cy="Hours"
                  className="day-hour-rows__border-bottom-line"
                  onClick={(e) => {
                    const timeDate = getKeyFromDateInfo(parsedCurrentDay, hour);
                    onCellClick(
                      {
                        ...parsedCurrentDay,
                        hour,
                        timeDate,
                        timeDateUTC: new Date(timeDate).toISOString(),
                      },
                      e,
                    );
                  }}
                >
                  <p
                    onClick={(e) => {
                      const timeDate = getKeyFromDateInfo(
                        parsedCurrentDay,
                        hour,
                      );
                      e.stopPropagation();
                      onHourClick(
                        {
                          ...parsedCurrentDay,
                          hour,
                          timeDate,
                          timeDateUTC: new Date(timeDate).toISOString(),
                        },
                        e,
                      );
                    }}
                    className="day-hour-rows__border-bottom-hour-unit"
                  >
                    {getTimeUnitString(hour, timeDateFormat)}
                  </p>
                </div>
              ))}
            </div>
            <div className="day-hour-rows__items" style={{ gridTemplateRows: `repeat(${totalMinutes}, minmax(1px, auto))` }}>
              {renderItems({ dateInfo: parsedCurrentDay, idx: 0 })}
              {parsedCurrentDay.isCurrentDay && (
                <div
                  data-cy="CurrentMinutLine"
                  className="current-minute-line"
                  style={{
                    gridColumn: '1/3',
                    gridRow: (getHours(new Date()) - minHour) * 60 + getMinutes(new Date()),
                  }}
                />
              )}
            </div>
          </>
        </div>
      </div>
    </>
  );
};

export default DayView;
