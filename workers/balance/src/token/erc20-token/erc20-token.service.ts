import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../../common';
import { TokenSnapshot, ITokenHolder } from '../../models';
import { abi } from './abi';
import { IToken } from '../token.interface';

const Web3 = require('web3');

@Injectable()
export class Erc20TokenService extends CustomLogger implements IToken {
  private web3: any;

  constructor(config: ConfigService) {
    super('Erc20TokenService');
    const RPC_PROVIDER = config.get('rpc_url');
    this.web3 = new Web3(RPC_PROVIDER);
  }

  async getTokenSnapshot(address: string): Promise<TokenSnapshot> {
    const contract = this.getTokenContract(address);
    const props = ['symbol', 'decimals'];
    const promises = props.map(prop => this.getErc20Prop(contract, prop));

    const snapshot = await Promise.all(promises)
      .then(data => {
        const [symbol, precision] = data;
        return { symbol, precision };
      })
      .catch(e => {
        this.logError({ method: 'getTokenSnapshot', e });
        return null;
      });

    return snapshot;
  }

  async getTokenBalance(holder: ITokenHolder): Promise<string> {
    const { token, address } = holder;
    const contract = this.getTokenContract(token);
    return new Promise((resolve, reject) => {
      return contract.methods.balanceOf(address).call((err, res) => {
        if (res) resolve(res);
        if (err) reject(err);
      });
    });
  }

  private getTokenContract(token: string) {
    return new this.web3.eth.Contract(abi, token);
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
