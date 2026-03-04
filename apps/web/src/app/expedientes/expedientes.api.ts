import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../core/api-base-url.token';

export interface ExpedienteDto {
  id: string;
  numero: string;
  clienteNombre: string;
  estado: 'ABIERTO' | 'EN_PROCESO' | 'CERRADO';
  fechaApertura: string | null;
  fechaCierre: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArchivoDto {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: string;
  createdAt: string;
}

export interface CargaLoteDto {
  id: string;
  titulo: string;
  descripcion: string | null;
  createdAt: string;
  archivos: ArchivoDto[];
}

export interface CreateExpedientePayload {
  numero: string;
  clienteNombre: string;
  estado?: ExpedienteDto['estado'];
  fechaApertura?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ExpedientesApi {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly baseUrl: string,
  ) {}

  listExpedientes() {
    return this.http.get<ExpedienteDto[]>(`${this.baseUrl}/expedientes`);
  }

  createExpediente(payload: CreateExpedientePayload) {
    return this.http.post<ExpedienteDto>(`${this.baseUrl}/expedientes`, payload);
  }

  getExpediente(id: string) {
    return this.http.get<ExpedienteDto>(`${this.baseUrl}/expedientes/${encodeURIComponent(id)}`);
  }

  updateExpedienteEstado(id: string, estado: ExpedienteDto['estado']) {
    return this.http.patch<ExpedienteDto>(`${this.baseUrl}/expedientes/${encodeURIComponent(id)}`, { estado });
  }

  listLotes(expedienteId: string) {
    return this.http.get<CargaLoteDto[]>(
      `${this.baseUrl}/expedientes/${encodeURIComponent(expedienteId)}/lotes`,
    );
  }

  createLote(expedienteId: string, payload: { titulo: string; descripcion?: string }, files: File[]) {
    const fd = new FormData();
    fd.set('titulo', payload.titulo);
    if (payload.descripcion != null) fd.set('descripcion', payload.descripcion);
    for (const f of files) fd.append('files', f);

    return this.http.post<CargaLoteDto>(
      `${this.baseUrl}/expedientes/${encodeURIComponent(expedienteId)}/lotes`,
      fd,
    );
  }

  downloadUrl(archivoId: string) {
    return `${this.baseUrl}/archivos/${encodeURIComponent(archivoId)}/download`;
  }
}

