import { Injectable } from '@nestjs/common';
import { Web3Service } from './tx-helper/web3';
import { RawTx, TokenData, TokenMetaData, TxAssetsAndData } from '../../models';
import { WorkerClientService } from '../worker-client';
import { PgService } from '../pg';

@Injectable()
export class ContractCreateService {
  constructor(
    private readonly web3: Web3Service,
    private workerClient: WorkerClientService,
    private pg: PgService,
  ) {}

  async getTxsTokensAndData(rawTx: RawTx): Promise<TxAssetsAndData<any>> {
    const { hash, log, timestamp, from } = rawTx;
    const contract = await this.web3.getContractAddress(hash);
    if (!contract) return { data: log, tokens: [] };

    let tokens = [];
    let data = null;
    const tokenMetaData: TokenMetaData = await this.web3.getTokenInfo(contract);
    const addressMsg: any = {
      address: contract,
      contract: true,
      active_at: timestamp,
      create_at: timestamp,
    };
    if (tokenMetaData) {
      const token: TokenData = {
        ...tokenMetaData,
        issue_tx: hash,
        issuer: from,
        create_at: timestamp,
        active_at: timestamp,
        token_type: 1,
      };
      await this.pg.saveTokenInfo(token);
      addressMsg.erc20 = true;
      data = token;
      tokens = [contract];
    } else {
      data = { contract };
    }

    this.workerClient.notifyAddressInfo([addressMsg]);

    return { data, tokens };
  }
}
