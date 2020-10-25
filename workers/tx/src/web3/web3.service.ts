import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { abi } from './abi';

const Web3 = require('web3');

@Injectable()
export class Web3Service {
  web3: any;

  constructor(config: ConfigService) {
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

  async getTokenInfo(contractAddress: string): Promise<any> {
    const contract = this.getContract(contractAddress);
    const props = ['symbol', 'decimals', 'totalSupply'];
    const promises = props.map(prop => this.getErc20Prop(contract, prop));

    return Promise.all(promises)
      .then(data => {
        const [symbol, precision, qty] = data;
        const value = +qty / Math.pow(10, +precision);
        return { symbol, value, token: contractAddress };
      })
      .catch(e => {
        return null;
      });
  }

  private getContract(address: string) {
    return new this.web3.eth.Contract(abi, address);
  }

  private getErc20Prop(contract: any, prop: string): Promise<any> {
    return new Promise((resolve, reject) => {
      contract.methods[prop]().call((err, res) => {
        if (err) {
          reject(err);
        }
        if (res) {
          resolve(res);
        }
      });
    });
  }
}
