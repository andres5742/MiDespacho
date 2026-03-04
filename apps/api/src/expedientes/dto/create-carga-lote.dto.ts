import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCargaLoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titulo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descripcion?: string;
}

