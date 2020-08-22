
declare module 'follow-redirects' {
    import * as http from 'http'
    const followRedirects: { http: typeof http };
    export = followRedirects;
  }
  