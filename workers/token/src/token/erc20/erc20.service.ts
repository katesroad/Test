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
    // https://web3js.readthedocs.io/en/v1.3.0/web3-eth.html#configuration
    const WSS_PROVIDER = config.get('wss_url');
    this.web3 = new Web3(WSS_PROVIDER, {
      timeout: 3000,
      keepalive: true,
      reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 50,
        onTimeout: false,
      },
    });
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
    const contract = this.getContract(tokenHash);
    const supply = await this.getErc20Prop(contract, 'totalSupply');
    const precision = await this.getErc20Prop(contract, 'decimals');
    return supply / Math.pow(10, precision);
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
