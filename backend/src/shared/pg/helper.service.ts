import { Injectable } from '@nestjs/common';

@Injectable()
export class HelperService {
  getOrderAndOperatorByCmd(cmd: string): { order: string; operator: string } {
    let order: string;
    if (cmd === 'first' || cmd === 'next') order = 'desc';
    if (cmd === 'last' || cmd == 'prev') order = 'asc';

    let operator = '>';
    if (cmd === 'next') operator = '<';
    if (cmd === 'prev') operator = '>';

    return { order, operator };
  }
}
