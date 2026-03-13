export function vibrate(pattern: number | number[] = 10) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function vibrateLight() {
  vibrate(8);
}

export function vibrateLoss() {
  vibrate([50, 30, 80]);
}
