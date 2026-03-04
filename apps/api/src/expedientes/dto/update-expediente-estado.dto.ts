import { IsEnum } from 'class-validator';
import { ExpedienteEstado } from '../entities/expediente.entity';

export class UpdateExpedienteEstadoDto {
  @IsEnum(ExpedienteEstado)
  estado!: ExpedienteEstado;
}
