const ZOOM_PERCENT_MIN = 50;
const ZOOM_PERCENT_MAX = 200;
const ZOOM_PERCENT_DEFAULT = 100;

const isFiniteNumber = (value: number): boolean => Number.isFinite(value);

export const clampZoomPercent = (percent: number): number => {
  if (!isFiniteNumber(percent)) return ZOOM_PERCENT_DEFAULT;
  if (percent < ZOOM_PERCENT_MIN) return ZOOM_PERCENT_MIN;
  if (percent > ZOOM_PERCENT_MAX) return ZOOM_PERCENT_MAX;
  return Math.round(percent);
};

export const computeFitZoomPercent = (
  viewportWidth: number,
  previewWidth: number,
): number => {
  if (viewportWidth <= 0 || previewWidth <= 0) {
    return ZOOM_PERCENT_DEFAULT;
  }
  const fitPercent = (viewportWidth / previewWidth) * 100;
  return clampZoomPercent(fitPercent);
};

export const resolveEffectiveZoomPercent = (options: {
  autoAdjustZoom: boolean;
  fitZoomPercent: number;
  manualZoomPercent: number;
}): number => {
  const sourcePercent = options.autoAdjustZoom
    ? options.fitZoomPercent
    : options.manualZoomPercent;
  return clampZoomPercent(sourcePercent);
};
