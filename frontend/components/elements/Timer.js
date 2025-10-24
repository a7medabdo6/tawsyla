import React, { useEffect, useState } from "react";

const msInSecond = 1000;
const msInMinute = 60 * 1000;
const msInAHour = 60 * msInMinute;
const msInADay = 24 * msInAHour;

const getPartsofTimeDuration = (duration) => {
  const days = Math.floor(duration / msInADay);
  const hours = Math.floor((duration % msInADay) / msInAHour);
  const minutes = Math.floor((duration % msInAHour) / msInMinute);
  const seconds = Math.floor((duration % msInMinute) / msInSecond);

  return { days, hours, minutes, seconds };
};

const Timer = (endDateTime) => {
  const [timeParts, setTimeParts] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateTimer = () => {
      const now = Date.now();
      const future = new Date(endDateTime.endDateTime);
      const timeDif = future.getTime() - now;

      if (timeDif > 0) {
        setTimeParts(getPartsofTimeDuration(timeDif));
      }
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endDateTime.endDateTime]);

  // Show placeholder during server-side rendering and initial hydration
  if (!mounted) {
    return (
      <>
        <div className="deals-countdown  pl-5">
          <span className="countdown-section">
            <span className="countdown-amount hover-up">0</span>
            <span className="countdown-period"> days </span>
          </span>
          <span className="countdown-section">
            <span className="countdown-amount hover-up">0</span>
            <span className="countdown-period"> hours </span>
          </span>
          <span className="countdown-section">
            <span className="countdown-amount hover-up">0</span>
            <span className="countdown-period"> mins </span>
          </span>
          <span className="countdown-section">
            <span className="countdown-amount hover-up">0</span>
            <span className="countdown-period"> sec </span>
          </span>
        </div>
      </>
    );
  }

  // const countDownTime = `${timeParts.days} Days ${timeParts.hours} Hours and ${timeParts.minutes} minutes and ${timeParts.seconds} seconds`;
  return (
    <>
      <div className="deals-countdown  pl-5">
        <span className="countdown-section">
          <span className="countdown-amount hover-up">{timeParts.days}</span>
          <span className="countdown-period"> days </span>
        </span>
        <span className="countdown-section">
          <span className="countdown-amount hover-up">{timeParts.hours}</span>
          <span className="countdown-period"> hours </span>
        </span>
        <span className="countdown-section">
          <span className="countdown-amount hover-up">{timeParts.minutes}</span>
          <span className="countdown-period"> mins </span>
        </span>
        <span className="countdown-section">
          <span className="countdown-amount hover-up">{timeParts.seconds}</span>
          <span className="countdown-period"> sec </span>
        </span>
      </div>
    </>
  );
};

export default Timer;
