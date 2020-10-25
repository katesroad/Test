import { Injectable } from '@nestjs/common';
import { MongoService } from './mongo/mongo.service';
import { Erc20Service } from './erc20/erc20.service';
import { RpcService } from './rpc/rpc.service';
import { TokenInfo } from '../models';
import { CustomLogger } from '../common';

@Injectable()
export class TokenService extends CustomLogger {
  constructor(
    private mongo: MongoService,
    private erc20: Erc20Service,
    private rpc: RpcService,
  ) {
    super('TokenSerivice');
  }

  async getTokenInfoByTokenHash(hash: string): Promise<Partial<TokenInfo>> {
    const isErc20 = hash.length === 42;
    this.logInfo({
      method: 'getTokenInfoByTokenHash',
      data: { hash, erc20: isErc20 },
    });
    if (hash.length === 42) return this.erc20.getTokenInfoByTokenHash(hash);

    const getTokenIssueInfo = this.mongo.getTokenInfoByTokenHash(hash);
    const getTokenMetaInfo = this.rpc.getTokenInfo(hash);
    return Promise.all([getTokenIssueInfo, getTokenMetaInfo]).then(data => {
      const [mongoData, rcpData] = data;
      return { ...mongoData, ...rcpData };
    });
  }

  async getTokenByTxHash(hash: string, type?: string): Promise<any> {
    if (type === 'fusion') {
      const token = await this.mongo.getTokenInfoByIssueTxHash(hash);
      const metaData = await this.rpc.getTokenInfo(token.hash);
      return { ...token, ...metaData };
    }
    if (type === 'erc20') {
      return this.erc20.getTokenInfoByIssueTxHash(hash);
    }
  }

  async getTokenSupply(tokenHash: string) {
    if (tokenHash.length === 42) return this.erc20.getTokenSupply(tokenHash);
    else
      return this.rpc
        .getTokenInfo(tokenHash)
        .then(token => token.qty)
        .catch(e => -1);
  }
}
