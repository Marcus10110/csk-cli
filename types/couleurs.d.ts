declare module 'couleurs' {
    class Couleurs{
        fg(a:string, b:string): string;
        bg(a: string, b: string): string;
    }
    const builder: () => Couleurs;
    export = builder;
  }
  