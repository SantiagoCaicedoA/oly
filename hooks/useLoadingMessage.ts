import { useEffect, useRef, useState } from "react";

const GYM_LOADING_MESSAGES = [
  "Analyzing your strength stats...",
  "Building your personalized program...",
  "Calculating optimal training loads...",
  "Mapping your recovery windows...",
  "Calibrating intensity zones...",
  "Designing your periodization plan...",
  "Reviewing your movement patterns...",
  "Optimizing your weekly split...",
  "Fine-tuning your volume targets...",
  "Your AI coach is almost ready...",
];

export function useLoadingMessages(
  isLoading: boolean,
  intervalMs: number = 2500,
) {
  const [messageIndex, setMessageIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setMessageIndex(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setMessageIndex((prev) =>
        prev < GYM_LOADING_MESSAGES.length - 1 ? prev + 1 : 0,
      );
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoading, intervalMs]);

  return GYM_LOADING_MESSAGES[messageIndex];
}
