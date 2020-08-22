declare module 'yesno' {
  interface InvalidHandlerOptions {
    question: string;
    defaultValue?: boolean | null;
    yesValues?: string[];
    noValues?: string[];
  }

  interface Options extends InvalidHandlerOptions {
    invalid?: (options: InvalidHandlerOptions) => void;
  }
  const ask: (
    question: string,
    defaultValue: boolean,
    callback: (ok: boolean) => void,
    yesvalues?: any,
    novalues?: any,
  ) => void;
  const yesno: { ask: typeof ask };
  export = yesno;
}
