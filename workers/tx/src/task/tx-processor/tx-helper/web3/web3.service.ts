import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenMetaData, TokenSnapshot } from '../../../../models';
import { CustomLogger } from '../../../../common';
import { abi } from './abi';

const Web3 = require('web3');

@Injectable()
export class Web3Service extends CustomLogger {
  private retried = 0;
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
      .catch(e => {
        console.log(e);
        return null;
      });
  }

  async getTokenSnapshot(address: string): Promise<TokenSnapshot> {
    if (this.retried) {
      await this.sleep(200);
    }
    return this.getTokenInfo(address)
      .then(data => {
        const { symbol, precision } = data;
        return { symbol, precision };
      })
      .then(snapshot => {
        if (snapshot) {
          this.retried = 0;
          return snapshot;
        } else {
          console.log(`Get erc20 token snapshot failed`);
	  return null;
        }
      })
      .catch(e => {
        this.retried += 1;
        if (this.retried > 4) {
          console.log(
            `retried 4 times, did not work for getting token snapshot.`,
          );
         return null;
        }
        return this.getTokenSnapshot(address);
      });
  }

  private getErc20Prop(contract: any, prop: string): Promise<any> {
    return new Promise((resolve, reject) => {
      contract.methods[prop]().call((err, res) => {
        if (err) reject(err);
        if (res) resolve(res);
      });
    });
  }

  private sleep(ms: number) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(null);
      }, ms);
    });
  }
}
