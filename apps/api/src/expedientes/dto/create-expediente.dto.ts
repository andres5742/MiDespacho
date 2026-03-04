import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ExpedienteEstado } from '../entities/expediente.entity';

export class CreateExpedienteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  numero!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  clienteNombre!: string;

  @IsOptional()
  @IsEnum(ExpedienteEstado)
  estado?: ExpedienteEstado;

  @IsOptional()
  @IsDateString()
  fechaApertura?: string;
}

