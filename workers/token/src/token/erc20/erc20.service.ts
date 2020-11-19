import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenMetaInfo } from 'src/models';
import { HelperService } from '../../common';
import { abi } from './abi';

const Web3 = require('web3');

@Injectable()
export class Erc20Service {
  private retried = 0;
  private web3: any;

  /**
   * Instantiate web3 provider to get erc20 token information
   */
  constructor(config: ConfigService, private readonly helper: HelperService) {
    // https://web3js.readthedocs.io/en/v1.3.0/web3-eth.html#configuration
    const WSS_PROVIDER = config.get('wss_url');
    const provider = new Web3.providers.WebsocketProvider(WSS_PROVIDER, {
      timeout: 3000,
      keepalive: true,
      reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 50,
        onTimeout: false,
      },
    });
    console.log(WSS_PROVIDER);

    //reload application to restart
    provider.on('error', () => {
      console.log('error');
      process.exit();
    });
    provider.on('connect', () => {
      console.log('connect');
    });
    provider.on('disconnect', () => {
      console.log('disconnect');
      // reload process
      process.exit();
    });
    this.web3 = new Web3(provider);
  }

  /**
   * Get token metadata
   * @param tokenHash:string
   * @returns TokenMetaInfo
   */
  async getTokenInfo(
    tokenHash: string,
    wait?: number,
  ): Promise<TokenMetaInfo | null> {
    //
    if (wait) await this.helper.sleep(wait);
    const contract = this.getContract(tokenHash);
    const props = ['name', 'symbol', 'supply', 'decimals'];
    const promises = props.map(prop => this.getErc20Prop(contract, prop));

    return Promise.all(promises)
      .then(data => {
        const [name, symbol, supply, decimals] = data;
        const qty = supply / Math.pow(10, decimals);
        return {
          hash: tokenHash,
          name,
          supply,
          symbol,
          precision: decimals,
          qty,
        };
      })
      .catch(e => {
        this.retried += 1;
        if (this.retried > 4) {
          this.helper.logErrorMsg('Failed to get token meta information.');
          this.helper.logError({ method: 'getTokenInfo', data: tokenHash, e });
          return null;
        }
        return this.getTokenInfo(tokenHash, 50);
      });
  }

  /**
   * Get erc20 token supply(based on supply and token's decimals)
   * @param tokenHash:string
   * @returns number
   */
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
    console.log(contract);
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
