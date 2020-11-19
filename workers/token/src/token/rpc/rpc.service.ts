import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NativeTokenMetaInfo } from 'src/models';
import { HelperService } from '../../common';

@Injectable()
export class RpcService {
  private retried = 0;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly helper: HelperService,
  ) {}

  /**
   * Get Metadata for native token on fusion blockchain
   * @param tokenHash: string
   * @returns NativeTokenMetaInfo | null
   */
  async getTokenInfo(
    tokenHash: string,
    wait?: number,
  ): Promise<NativeTokenMetaInfo | null> {
    // The rpc provider may hangout request due to fequently request
    if (wait) {
      await this.helper.sleep(50);
    }

    const method = 'fsn_getAsset';
    const RPC_URL = this.config.get('rpc_url');
    return this.http
      .post(
        RPC_URL,
        {
          jsonrpc: '2.0',
          id: 1,
          method,
          params: [tokenHash, 'latest'],
        },
        { headers: { 'Content-Type': 'application/json' } },
      )
      .toPromise()
      .then(res => res.data)
      .then(data => data.result)
      .then(data => {
        if (data) {
          this.retried = 0;
          const {
            Name,
            Symbol,
            Total,
            Decimals,
            Description,
            CanChange,
          } = data;
          let info: string = undefined;
          try {
            const desc = JSON.parse(Description);
            if (Object.keys(desc)) info = JSON.stringify(desc);
          } catch {}
          const tokenData: NativeTokenMetaInfo = {
            hash: tokenHash,
            name: Name,
            symbol: Symbol as string,
            qty: Total / Math.pow(10, Decimals),
            precision: Decimals as number,
            canchange: CanChange,
          };
          if (info) {
            tokenData.info = info;
          }
          return tokenData;
        }
      })
      .catch(e => {
        this.retried += 1;
        if (this.retried > 4) {
          this.helper.logErrorMsg(`Get token meta information failed.`);
          this.helper.logError({
            method: 'getTokenInfo',
            e,
            data: tokenHash,
          });
          return null;
        }
        return this.getTokenInfo(tokenHash, 50);
      });
  }

  /**
   * Get token supply for native token
   * @param tokenHash: string
   * @returns number | undefined
   */
  async getTokenSupply(tokenHash: string): Promise<number | undefined> {
    return this.getTokenInfo(tokenHash).then(tokenData => {
      if (tokenData) return tokenData.qty;
      else return;
    });
  }
}
