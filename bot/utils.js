const withTimeout = (promise, seconds) =>
  Promise.race([
    new Promise((resolve, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), seconds * 1000)
    ),
    promise,
  ]);

module.exports = {
  withTimeout,
};
