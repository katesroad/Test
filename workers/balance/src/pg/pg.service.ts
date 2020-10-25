import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { PgAssetBalanceService } from './pg-asset-balance.service';
import { PgErc20BalanceService } from './pg-erc20-balance.service';
import { ITokenBalance, ITokenHolder } from '../models';

@Injectable()
export class PgService {
  constructor(
    @InjectKnex() readonly knex: Knex,
    private assetBalance: PgAssetBalanceService,
    private erc20Balance: PgErc20BalanceService,
  ) {}

  getTrxProvider() {
    return this.knex.transactionProvider();
  }

  checkExistence(balance: ITokenHolder, provider: any): Promise<any> {
    const { token, address } = balance;
    const holder = { token, address };
    if (this.isErc20Token(token)) {
      return this.erc20Balance.checkExistence(holder, provider);
    }
    return this.assetBalance.checkExistence(holder, provider);
  }

  createBalanceRecord(
    balance: Partial<ITokenBalance>,
    provider: any,
  ): Promise<boolean> {
    const { token } = balance;
    if (this.isErc20Token(token)) {
      return this.erc20Balance.createBalanceRecord(balance, provider);
    }
    return this.assetBalance.createBalanceRecord(balance, provider);
  }

  updateBalanceRecord(
    balance: Partial<ITokenBalance>,
    provider: any,
  ): Promise<boolean> {
    const { token } = balance;
    if (this.isErc20Token(token)) {
      return this.erc20Balance.updateBalanceRecord(balance, provider);
    }
    return this.assetBalance.updateBalanceRecord(balance, provider);
  }

  delBalanceRecord(balance: ITokenHolder, provider: any): Promise<boolean> {
    const { token } = balance;
    if (this.isErc20Token(token)) {
      return this.erc20Balance.delBalanceRecord(balance, provider);
    }
    return this.assetBalance.delBalanceRecord(balance, provider);
  }

  private isErc20Token(token: string): boolean {
    return token.length === 42;
  }
}
