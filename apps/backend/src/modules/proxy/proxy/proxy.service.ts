import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PassThrough } from 'stream';

@Injectable()
export class ProxyService {
  private async fetch(url: string): Promise<any> {
    try {
      const res = await (globalThis.fetch as any)(url);
      if (!res.ok) {
        throw new HttpException(
          `Upstream fetch failed: ${res.status} ${res.statusText}`,
          res.status,
        );
      }
      return res;
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(
        `Failed to fetch ${url}: ${err.message ?? err}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async fetchText(url: string): Promise<string> {
    const res = await this.fetch(url);
    return res.text();
  }

  async fetchJson(url: string): Promise<any> {
    const res = await this.fetch(url);
    return res.json();
  }

  /**
   * Return a Node stream that can be piped to the response for large/binary files.
   */
  async fetchStream(url: string): Promise<{ stream: PassThrough; headers: Record<string, string>; status: number }> {
    const res = await this.fetch(url);
    const pass = new PassThrough();
    // stream the response body to the pass-through stream
    if (res.body) {
      (res.body as any).pipe(pass);
    } else {
      pass.end();
    }

    const headers: Record<string, string> = {};
    try {
      // copy headers from upstream response
      if (res.headers && typeof res.headers.forEach === 'function') {
        res.headers.forEach((value: string, key: string) => {
          headers[key.toLowerCase()] = value;
        });
      }
    } catch (e) {
      // ignore header copying errors
    }

    return { stream: pass, headers, status: res.status };
  }
}