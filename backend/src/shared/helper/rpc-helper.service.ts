import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStakingStats } from '../../models';

@Injectable()
export class RpcHelperService {
  constructor(private http: HttpService, private config: ConfigService) {}

  getStakingStats(): Promise<IStakingStats> {
    return this.makeRequest({ method: 'fsn_getStakeInfo', param: [] })
      .then((data: any) => {
        if (!data) return { miners: -1, tickets: -1 };
        const summary = data.summary;
        const miners: number = summary.totalMiners;
        const tickets: number = summary.totalTickets;
        return { miners, tickets };
      })
      .catch(e => ({ miners: -1, tickets: -1 }));
  }

  getBlockReward(): Promise<number> {
    return this.makeRequest({ method: 'fsn_getBlockReward', param: [] })
      .then(data => +data / Math.pow(10, 18))
      .then(reward => +reward.toFixed(4));
  }

  private makeRequest(config: { method: string; param: string[] }) {
    const { method, param = [] } = config;
    const url = this.config.get('rpc');
    const params = Array.from(new Set([...param, 'latest']));
    return this.http
      .post(url, {
        jsonrpc: '2.0',
        method,
        params,
        id: 1,
      })
      .toPromise()
      .then(res => res.data)
      .then(data => data.result);
  }
}
