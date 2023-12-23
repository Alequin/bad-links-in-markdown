export const logger = {
  info: (...args) => {
    if (!isTestEnv()) return;
    console.log(...args);
  },
  error: (...args) => {
    if (!isTestEnv()) return;
    console.error(...args);
  },
};

const isTestEnv = () => process.env.NODE_ENV !== "test";
