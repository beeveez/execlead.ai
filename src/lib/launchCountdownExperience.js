const DAY = 86400000;

export function getLaunchCountdownPhase(timeLeft) {
  if (timeLeft.isLive) return { label: 'EXECLEAD.AI IS NOW LIVE', message: 'Your Executive Leadership Journey Starts Here.', live: true };
  if (timeLeft.remaining <= DAY) return { label: 'TOMORROW', message: '', compact: true };
  if (timeLeft.remaining <= 7 * DAY) return { label: 'ACCESS OPENS SOON', message: 'The Executive Leadership Operating System™ is almost ready.' };
  if (timeLeft.remaining <= 30 * DAY) return { label: `${Math.ceil(timeLeft.remaining / DAY)} DAYS TO EXECUTIVE READINESS`, message: 'A meaningful new chapter in your leadership journey is approaching.' };
  return { label: 'COMING SOON', message: 'A new way to prepare for executive leadership is coming.' };
}

export function splitCountdownDays(totalDays) {
  return { months: Math.floor(totalDays / 30), days: totalDays % 30 };
}