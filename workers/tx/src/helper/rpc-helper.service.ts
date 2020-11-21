import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HelperService } from './helper.service';

@Injectable()
export class RpcHelperService {
  private rpcServer: string;

  constructor(
    config: ConfigService,
    private http: HttpService,
    private helper: HelperService,
  ) {
    this.rpcServer = config.get('rpcServer');
  }

  makeRequest(config: { method: string; params: string[] }): Promise<any> {
    const url = this.rpcServer;
    const { method, params = [] } = config;
    return this.http
      .post(
        url,
        {
          jsonrpc: '2.0',
          id: 1,
          method,
          params: [...params, 'latest'],
        },
        { headers: { 'Content-Type': 'application/json' } },
      )
      .toPromise()
      .then(res => res.data)
      .then(data => data.result)
      .catch(e => {
        this.helper.logError({ method: 'makeRequest', data: config, e });
        console.log(params);
        process.exit();
        return null;
      });
  }
}
