import { useEffect, useState } from 'react';
import { PRIVATE_BETA_LAUNCH_AT } from '@/lib/privateBetaLaunch';

const calculateTimeLeft = () => {
  const remaining = Math.max(0, new Date(PRIVATE_BETA_LAUNCH_AT).getTime() - Date.now());
  return {
    isLive: remaining === 0,
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining / 3600000) % 24),
    minutes: Math.floor((remaining / 60000) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
  };
};

export default function usePrivateBetaCountdown() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    let timer;
    const tick = () => {
      const next = calculateTimeLeft();
      setTimeLeft(next);
      if (!next.isLive) timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    tick();
    return () => window.clearTimeout(timer);
  }, []);

  return timeLeft;
}