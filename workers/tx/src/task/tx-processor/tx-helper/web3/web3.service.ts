import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HelperService } from '../../../../helper';
import { TokenMetaData, TokenSnapshot } from '../../../../models';
import { ITokenService } from '../itoken-service.interface';
import { abi } from './abi';

const Web3 = require('web3');

@Injectable()
export class Web3Service implements ITokenService {
  private retried = 0;
  private web3: any;

  constructor(
    private readonly config: ConfigService,
    private readonly helper: HelperService,
  ) {
    this.init();
  }

  /**
   * Get contract address from a contract creationg transaction hash
   * @param txHash: string;
   * @returns contractAddress:string;
   */
  async getContractAddress(txHash: string): Promise<string> {
    return this.web3.eth
      .getTransactionReceipt(txHash)
      .then(data => data.contractAddress)
      .then(contract => contract.toLowerCase())
      .catch(e => console.log);
  }

  /**
   * Get erc20 token meta information
   * @param hash: erc20 contract address hash
   * @returns token: TokenMetata | null
   */
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

  /**
   * Get token's symbol and token's decimals by token hash
   * @param contracAdress erc20 token contract address
   * @returns snapshot: TokenSnapshot | null
   */
  async getTokenSnapshot(contracAdress: string): Promise<TokenSnapshot | null> {
    if (this.retried) {
      await this.helper.sleep(200);
    }
    return this.getTokenInfo(contracAdress)
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
        return this.getTokenSnapshot(contracAdress);
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

  /**
   * Init web3 instance for interacting with fsn network/contract purpose
   */
  private init() {
    const WSS_PROVIDER = this.config.get('wss_url');
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
    const reload = () => {
      try {
        provider.disconnect();
        this.init();
      } catch {}
    };

    provider.on('error', e => {
      console.log(`provider error: ${JSON.stringify(e)}`);
      reload();
    });
    provider.on('disconnect', e => {
      console.log(`provider disconnect: ${JSON.stringify(e)}`);
      reload();
    });
    provider.on('connect', async () => {
      console.log('web3.service.ts wss connected...\n');
    });

    this.web3 = new Web3(provider);
  }
}
