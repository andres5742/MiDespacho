import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expediente, ExpedienteEstado } from './entities/expediente.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Expediente)
    private readonly expedientesRepo: Repository<Expediente>,
  ) {}

  async onApplicationBootstrap() {
    const existing = await this.expedientesRepo.count();
    if (existing > 0) return;

    const exp = this.expedientesRepo.create({
      numero: 'EXP-2026-0001',
      clienteNombre: 'Laura Pérez',
      estado: ExpedienteEstado.EN_PROCESO,
      fechaApertura: new Date().toISOString().slice(0, 10),
      fechaCierre: null,
    });

    const saved = await this.expedientesRepo.save(exp);
    this.logger.log(`Seeded expediente ${saved.id} (${saved.numero})`);
  }
}

