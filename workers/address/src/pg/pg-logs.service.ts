import { Injectable } from '@nestjs/common';
import Knex from 'knex';
import { InjectKnex } from 'nestjs-knex';
import { HelperService } from 'src/common';
import { WorkerLog } from 'src/models';

@Injectable()
export class PgLogsService {
  private readonly table = 'worker-logs';

  constructor(
    @InjectKnex() private knex: Knex,
    private readonly helper: HelperService,
  ) {}

  createLogRecord(logData: WorkerLog) {
    if (!logData.data) return;
    this.knex(this.table)
      .insert(logData)
      .catch(e => {
        this.helper.logError({ method: 'createLogRecord', e, data: logData });
      });
  }
}
