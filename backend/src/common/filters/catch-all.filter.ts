import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch()
export class CatchAllFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    let msg = 'Internal server error';
    let status = 500;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      msg = exception.message;
    }

    const resData: any = { ok: false, msg };
    console.log(status, exception);
    return res.status(status).json(resData);
  }
}
