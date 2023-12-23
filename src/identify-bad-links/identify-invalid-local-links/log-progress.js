import { logger } from "../../utils";

export const logProgress = (currentFileNumber, totalFiles) => {
  if (
    currentFileNumber === 1 || // first file
    currentFileNumber % 100 === 0 || // every 100 files
    totalFiles === currentFileNumber // last file
  ) {
    logger.info(
      `Reviewing local links. ${currentFileNumber} / ${totalFiles} reviewed`
    );
  }
};
