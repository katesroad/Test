import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenMetaData, TokenSnapshot } from '../../../../models';
import { CustomLogger } from '../../../../common';
import { abi } from './abi';

const Web3 = require('web3');

@Injectable()
export class Web3Service extends CustomLogger {
  private web3: any;

  constructor(config: ConfigService) {
    super('Erc20TokenService');
    const RPC_PROVIDER = config.get('rpc_url');
    this.web3 = new Web3(RPC_PROVIDER);
  }

  async getContractAddress(txHash: string): Promise<string> {
    return this.web3.eth
      .getTransactionReceipt(txHash)
      .then(data => data.contractAddress)
      .then(contract => contract.toLowerCase())
      .catch(e => console.log);
  }

  async getTokenInfo(hash: string): Promise<TokenMetaData | null> {
    const contract = new this.web3.eth.Contract(abi, hash);
    const props = ['symbol', 'name', 'decimals', 'totalSupply'];
    const promises = props.map(prop => this.getErc20Prop(contract, prop));
    return Promise.all(promises)
      .then(data => {
        let [symbol, name, precision, qty] = data;
        qty = qty / Math.pow(10, precision);
        return {
          hash,
          symbol,
          name,
          precision,
          qty,
        };
      })
      .catch(e => null);
  }

  async getTokenSnapshot(address: string): Promise<TokenSnapshot> {
    return this.getTokenInfo(address)
      .then(data => {
        const { symbol, precision } = data;
        return { symbol, precision };
      })
      .catch(e => null);
  }

  private getErc20Prop(contract: any, prop: string): Promise<any> {
    return new Promise((resolve, reject) => {
      contract.methods[prop]().call((err, res) => {
        if (err) reject(err);
        if (res) resolve(res);
      });
    });
  }
}
