import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expediente, ExpedienteEstado } from './entities/expediente.entity';
import { CargaLote } from './entities/carga-lote.entity';
import { ArchivoExpediente } from './entities/archivo-expediente.entity';
import { CreateCargaLoteDto } from './dto/create-carga-lote.dto';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ExpedientesService {
  constructor(
    @InjectRepository(Expediente)
    private readonly expedientesRepo: Repository<Expediente>,
    @InjectRepository(CargaLote)
    private readonly lotesRepo: Repository<CargaLote>,
    @InjectRepository(ArchivoExpediente)
    private readonly archivosRepo: Repository<ArchivoExpediente>,
  ) {}

  async listExpedientes() {
    return this.expedientesRepo.find({
      order: { updatedAt: 'DESC' },
      take: 25,
    });
  }

  async createExpediente(dto: CreateExpedienteDto) {
    const numero = dto.numero.trim();
    const clienteNombre = dto.clienteNombre.trim();

    if (!numero || !clienteNombre) {
      throw new BadRequestException('Número y cliente son obligatorios');
    }

    const existing = await this.expedientesRepo.findOne({ where: { numero } });
    if (existing) {
      throw new BadRequestException('Ya existe un expediente con ese número');
    }

    const expediente = this.expedientesRepo.create({
      numero,
      clienteNombre,
      estado: dto.estado ?? ExpedienteEstado.ABIERTO,
      fechaApertura: dto.fechaApertura ?? new Date().toISOString().slice(0, 10),
      fechaCierre: null,
    });

    return this.expedientesRepo.save(expediente);
  }

  async getExpedienteOrThrow(id: string) {
    const exp = await this.expedientesRepo.findOne({ where: { id } });
    if (!exp) throw new NotFoundException('Expediente no encontrado');
    return exp;
  }

  async updateEstado(id: string, estado: ExpedienteEstado) {
    const expediente = await this.getExpedienteOrThrow(id);
    expediente.estado = estado;
    if (estado === ExpedienteEstado.CERRADO && !expediente.fechaCierre) {
      expediente.fechaCierre = new Date().toISOString().slice(0, 10);
    }
    return this.expedientesRepo.save(expediente);
  }

  async listLotes(expedienteId: string) {
    await this.getExpedienteOrThrow(expedienteId);
    return this.lotesRepo.find({
      where: { expediente: { id: expedienteId } },
      relations: { archivos: true },
      order: { createdAt: 'DESC', archivos: { createdAt: 'ASC' } },
    });
  }

  async createLoteWithFiles(expedienteId: string, dto: CreateCargaLoteDto, files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('Debes adjuntar al menos un archivo');
    if (files.length > 20) throw new BadRequestException('Máximo 20 archivos por carga');

    const expediente = await this.getExpedienteOrThrow(expedienteId);
    const lote = await this.lotesRepo.save(
      this.lotesRepo.create({
        expediente,
        titulo: dto.titulo,
        descripcion: dto.descripcion?.trim() ? dto.descripcion.trim() : null,
      }),
    );

    const baseDir = path.join(process.cwd(), 'storage', 'expedientes', expedienteId, lote.id);
    await fs.mkdir(baseDir, { recursive: true });

    try {
      const archivos: ArchivoExpediente[] = [];

      for (const file of files) {
        const safeName = sanitizeFilename(file.originalname);
        const storedName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${safeName}`;
        const storagePath = path.join(baseDir, storedName);

        await fs.writeFile(storagePath, file.buffer);

        archivos.push(
          this.archivosRepo.create({
            lote,
            originalName: file.originalname,
            storedName,
            mimeType: file.mimetype,
            sizeBytes: String(file.size),
            storagePath,
          }),
        );
      }

      await this.archivosRepo.save(archivos);
      return this.lotesRepo.findOneOrFail({ where: { id: lote.id }, relations: { archivos: true } });
    } catch (err) {
      await this.lotesRepo.delete({ id: lote.id });
      throw err;
    }
  }

  async getArchivoOrThrow(id: string) {
    const archivo = await this.archivosRepo.findOne({
      where: { id },
      relations: { lote: { expediente: true } },
    });
    if (!archivo) throw new NotFoundException('Archivo no encontrado');
    return archivo;
  }
}

function sanitizeFilename(name: string) {
  const base = path.basename(name);
  return base.replace(/[^\w.\-() ]+/g, '_');
}

