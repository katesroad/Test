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

  constructor(private readonly configService: ConfigService) {
    super('Erc20TokenService');
    this.init();
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
        process.exit();
        provider.disconnect();
        this.init();
      } catch {}
    };
    provider.on('error', () => {
      console.log('error');
      reload();
    });
    provider.on('connect', () => console.log('connect'));
    provider.on('disconnect', () => {
      console.log('disconnect');
      reload();
    });
    this.web3 = new Web3(provider);
  }
}
