export const App = Object.freeze({
  TerminatingError: (message: string): never => {
    throw new window.Error(`Voxis cannot be executed - ${message}`);
  },
  NonTerminatingError: (message: string) => {
    console.error(`[Voxis 0.1.0]: ERROR - ${message}`);
  },

  Log: (message: string) => {
    console.log(`[Voxis 0.1.0]: INFO - ${message}`);
  }
});