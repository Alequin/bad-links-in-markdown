import { logger } from "./logger";

export const logProgress = ({
  position,
  total,
  messagePrefix,
  logInterval = 10,
}) => {
  if (
    position === 1 || // first file
    position % logInterval === 0 || // only log every <logInterval> times
    total === position // last file
  ) {
    logger.info(`${messagePrefix}: ${position} out of ${total}`);
  }
};
