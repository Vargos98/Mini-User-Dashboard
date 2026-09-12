export const seriesMotion = () => {
  const reduce =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    isAnimationActive: !reduce,
    animationBegin: 0,
    animationDuration: 720,
    animationEasing: 'ease-out',
  };
};
