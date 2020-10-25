import { QueryCmdDto } from './query-cmd.dto';

export class QuerTxsCmdDto extends QueryCmdDto {
  address?: string;
  token?: string;
}
