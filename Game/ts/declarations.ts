const systime = () => {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
}

export const App = Object.freeze({
  TerminatingError: (message: string): never => {
    throw new window.Error(`Voxis cannot be executed - ${message}`);
  },
  NonTerminatingError: (message: string) => {
    console.error(`[Voxis 0.1.0] | ${systime()} : ERROR - ${message}`);
  },

  Log: (message: string) => {
    console.log(`[Voxis 0.1.0] | ${systime()} : INFO - ${message}`);
  }
});