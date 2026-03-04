import { Body, Controller, Get, Param, Patch, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CreateCargaLoteDto } from './dto/create-carga-lote.dto';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteEstadoDto } from './dto/update-expediente-estado.dto';
import { ExpedientesService } from './expedientes.service';
import * as fs from 'fs/promises';

@Controller()
export class ExpedientesController {
  constructor(private readonly service: ExpedientesService) {}

  @Get('expedientes')
  listExpedientes() {
    return this.service.listExpedientes();
  }

  @Post('expedientes')
  createExpediente(@Body() dto: CreateExpedienteDto) {
    return this.service.createExpediente(dto);
  }

  @Get('expedientes/:id')
  getExpediente(@Param('id') id: string) {
    return this.service.getExpedienteOrThrow(id);
  }

  @Patch('expedientes/:id')
  updateExpediente(@Param('id') id: string, @Body() dto: UpdateExpedienteEstadoDto) {
    return this.service.updateEstado(id, dto.estado);
  }

  @Get('expedientes/:id/lotes')
  listLotes(@Param('id') id: string) {
    return this.service.listLotes(id);
  }

  @Post('expedientes/:id/lotes')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  createLote(
    @Param('id') id: string,
    @Body() dto: CreateCargaLoteDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.service.createLoteWithFiles(id, dto, files);
  }

  @Get('archivos/:id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const archivo = await this.service.getArchivoOrThrow(id);
    try {
      await fs.access(archivo.storagePath);
    } catch {
      return res.status(404).json({ message: 'Archivo no disponible en storage' });
    }

    res.setHeader('Content-Type', archivo.mimeType);
    return res.download(archivo.storagePath, archivo.originalName);
  }
}

