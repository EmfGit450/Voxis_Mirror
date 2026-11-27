const systime = () => {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
}

export const App = Object.freeze({
  Error: (message: string): never => {
    throw new window.Error(`[Voxis 0.1.0] | ${systime()} : ERROR - ${message}`);
  },
  Warning: (message: string) => {
    console.warn(`[Voxis 0.1.0] | ${systime()} : WARNING - ${message}`);
  },
  Log: (message: string) => {
    console.log(`[Voxis 0.1.0] | ${systime()} : INFO - ${message}`);
  }
});
