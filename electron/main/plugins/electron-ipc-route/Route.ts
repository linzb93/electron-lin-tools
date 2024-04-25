export default () => {
  const listeners = [];
  return {
    listeners,
    isRoute: true,
    on(method: string, callback: Function) {
      listeners.push({
        method,
        listener: callback,
      });
    },
  };
};
