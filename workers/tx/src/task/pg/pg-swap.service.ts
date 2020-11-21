import { Injectable } from '@nestjs/common';
import { HelperService } from '../../helper';

@Injectable()
export class PgSwapService {
  constructor(private readonly helper: HelperService) {}

  async getSwap(swapID: string, provider: any) {
    const trx = await provider();
    return trx
      .select('from_tokens', 'to_tokens', 'owner')
      .from('swaps')
      .where({ hash: swapID })
      .first()
      .limit(1)
      .then(record => {
        const { from_tokens = [], to_tokens = [], owner = '' } = record || {};
        return { FromAssetID: from_tokens, ToAssetID: to_tokens, owner };
      })
      .catch(e => {
        this.helper.logError({ method: 'getSwap', e });
        process.exit();
      });
  }

  async trackSwap(swap: any, provider: any) {
    const trx = await provider();
    const { hash, ...swapData } = swap;
    const isExist = await trx
      .from('swaps')
      .where({ hash })
      .select('hash')
      .limit(1)
      .first()
      .catch(e => {
        console.log(e);
        process.exit();
      });

    if (isExist || !swapData.owner) {
      return trx
        .update(swapData)
        .from('swaps')
        .where({ hash })
        .then(() => {
          this.helper.logInfoMsg(`updated swap ${hash}`);
          return true;
        })
        .catch(e => {
          this.helper.logErrorMsg(`update swap ${hash} failed`);
          console.log(e);
          return false;
        });
    }
    return trx
      .insert(swap)
      .into('swaps')
      .then(() => {
        this.helper.logInfoMsg(`created swap ${hash}`);
        return true;
      })
      .catch(e => {
        this.helper.logErrorMsg(`create swap ${hash} failed`);
        console.log(e, swap);
        return false;
      });
  }
}
