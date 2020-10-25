import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Erc20TokenInfo, TokenInfo } from 'src/models';
import { CustomLogger } from '../../common/custom-logger';
import { abi } from './abi';

const Web3 = require('web3');

@Injectable()
export class Erc20Service extends CustomLogger {
  private web3: any;

  constructor(config: ConfigService) {
    super(`Erc20Service`);
    const RPC_PROVIDER = config.get('rpc_url');
    this.web3 = new Web3(RPC_PROVIDER);
  }

  async getTokenInfoByIssueTxHash(hash: string): Promise<Partial<TokenInfo>> {
    if (hash.length !== 66) return {};
    this.logInfo({
      method: 'getTokenInfoByIssueTxHash',
      data: hash,
    });

    const { address, issuer } = await this.web3.eth
      .getTransactionReceipt(hash)
      .then(data => {
        if (!data) return {};
        const { contractAddress, from } = data;
        return {
          address: contractAddress.toLowerCase(),
          issuer: from,
        };
      })
      .catch(e => ({}));

    if (!address) return null;

    const token = await this.getTokenInfoByTokenHash(address);
    if (token) return { ...token, issuer };
    else return null;
  }

  async getTokenInfoByTokenHash(
    contractAddress: string,
  ): Promise<Erc20TokenInfo> {
    const contract = this.getContract(contractAddress);
    const props = ['symbol', 'name', 'decimals', 'totalSupply'];
    const promises = props.map(prop => this.getErc20Prop(contract, prop));

    return Promise.all(promises)
      .then(data => {
        let [symbol, name, precision, qty] = data;
        qty = +qty;
        precision = +precision;
        qty = qty / Math.pow(10, precision);
        const token = { symbol, name, precision, qty, hash: contractAddress };
        return token;
      })
      .catch(e => {
        this.logError({
          method: 'getTokenInfo',
          e,
          data: contractAddress,
        });
        return null;
      });
  }

  async getTokenSupply(tokenHash: string): Promise<number> {
    const props = ['totalSupply', 'decimals'];
    const contract = this.getContract(tokenHash);
    const promises = [];
    props.map(prop => this.getErc20Prop(contract, prop));

    return Promise.all(promises)
      .then(data => {
        const [supply, decimals] = data;
        return +supply / Math.pow(+decimals, 10);
      })
      .catch(e => -1);
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
