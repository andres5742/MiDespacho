import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpedientesController } from './expedientes.controller';
import { ExpedientesService } from './expedientes.service';
import { Expediente } from './entities/expediente.entity';
import { CargaLote } from './entities/carga-lote.entity';
import { ArchivoExpediente } from './entities/archivo-expediente.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expediente, CargaLote, ArchivoExpediente])],
  controllers: [ExpedientesController],
  providers: [ExpedientesService, SeedService],
})
export class ExpedientesModule {}

