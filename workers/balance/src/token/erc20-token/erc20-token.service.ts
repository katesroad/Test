import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenSnapshot, ITokenHolder } from '../../models';
import { abi } from './abi';
import { IToken } from '../token.interface';
import { HelperService } from '../../common';

const Web3 = require('web3');

@Injectable()
export class Erc20TokenService implements IToken {
  private web3: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly helper: HelperService,
  ) {
    this.init();
  }

  /**
   * Get token key information including token symbol and decimails
   * @param address string
   * @returns {symbol:string, precision:string}
   */
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
        this.helper.logError({ method: 'getTokenSnapshot', e });
        return null;
      });

    return snapshot;
  }

  /**
   * get erc20 token raw balance for an address
   * @param holder {address:string, token:string}
   * @return string
   */
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

  /**
   * Init web3 instance for interacting with smart contract purpose
   */
  private init() {
    // https://web3js.readthedocs.io/en/v1.3.0/web3-eth.html#configuration
    const provider = new Web3.providers.WebsocketProvider(
      this.configService.get('wss_url'),
      {
        timeout: 3000,
        keepalive: true,
        reconnect: {
          auto: true,
          delay: 5000, // ms
          maxAttempts: 50,
          onTimeout: false,
        },
      },
    );
    const reload = () => {
      try {
        provider.disconnect();
        this.init();
      } catch {}
    };
    provider.on('error', () => {
      console.log('error');
      reload();
    });
    provider.on('connect', () => console.log('web3 for balance worker connected!!'));
    provider.on('disconnect', () => {
      console.log('disconnect');
      reload();
    });
    this.web3 = new Web3(provider);
  }
}
