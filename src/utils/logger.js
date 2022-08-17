export const logger = {
  info: (...args) => {
    if (process.env.NODE_ENV !== "test") {
      console.log(...args);
    }
  },
};
