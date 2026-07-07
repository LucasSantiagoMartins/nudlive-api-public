import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const message = exception.message;
    const table = (exception as any).table || 'desconhecida';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let customMessage = 'Ocorreu um erro inesperado no banco de dados';

    if (message.includes('invalid input syntax for type uuid')) {
      status = HttpStatus.BAD_REQUEST;
      customMessage = 'O ID informado não está no formato UUID válido. Verifique os IDs que informaste';
    } else if (message.includes('duplicate key')) {
      status = HttpStatus.BAD_REQUEST;
      customMessage = 'Este registro já existe no sistema';
    } else if (message.includes('violates not-null constraint')) {
      status = HttpStatus.BAD_REQUEST;
      customMessage = 'Faltam informações obrigatórias';
    }

    console.log(`[Database Error] Tabela: ${table} | Erro: ${message}`);

    console.log({
      msg: customMessage,
      action: 'DATABASE_QUERY_ERROR',
      service: 'TypeOrmExceptionFilter',
      table: table,
      rawError: message,
      status: status
    });

    return response.status(status).json({
      message: customMessage,
    });
  }
}