import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ExpedienteDto, ExpedientesApi } from './expedientes.api';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule],
  template: `
    <div class="min-h-screen">
      <div class="mx-auto max-w-6xl px-6 py-10">
        <div class="flex items-start justify-between gap-6">
          <div>
            <div class="text-sm text-slate-300/80">MiDespacho · Expedientes</div>
            <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white">Expedientes</h1>
            <p class="mt-2 max-w-2xl text-sm text-slate-300/80">
              Módulo de demostración para carga y visualización de archivos por expediente (carga múltiple
              por lote con título y descripción).
            </p>
          </div>

          <div class="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-soft md:block">
            <div class="text-xs text-slate-300/70">Estado</div>
            <div class="mt-1 text-sm text-slate-100">Demo técnica</div>
          </div>
        </div>

        <div class="mt-8 rounded-2xl border border-white/10 bg-white/5 shadow-soft">
          <div class="grid gap-0 border-b border-white/10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div class="border-b border-white/10 px-5 py-4 md:border-b-0 md:border-r">
              <div class="flex items-center justify-between gap-4">
                <div class="text-sm font-medium text-slate-100">Listado</div>
                <button
                  class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 hover:bg-white/10"
                  (click)="load()"
                  [disabled]="loading()"
                >
                  Recargar
                </button>
              </div>
            </div>

            <div class="px-5 py-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-medium text-slate-100">Nuevo expediente</div>
                  <div class="mt-1 text-xs text-slate-300/70">
                    Alta rápida para pruebas (número, cliente y estado).
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid gap-0 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div class="border-b border-white/10 p-5 md:border-b-0 md:border-r">
            @if (error()) {
              <div class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                {{ error() }}
              </div>
            }

            @if (loading()) {
              <div class="grid gap-3">
                <div class="h-16 rounded-xl bg-white/5"></div>
                <div class="h-16 rounded-xl bg-white/5"></div>
                <div class="h-16 rounded-xl bg-white/5"></div>
              </div>
            } @else {
              @if (!expedientes()?.length) {
                <div class="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  No hay expedientes aún.
                </div>
              } @else {
                <div class="grid gap-3">
                  @for (e of expedientes()!; track e.id) {
                    <a
                      class="group block rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
                      [routerLink]="['/expedientes', e.id]"
                    >
                      <div class="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div class="text-sm text-slate-300/80">#{{ e.numero }}</div>
                          <div class="mt-1 text-base font-semibold text-white">
                            {{ e.clienteNombre }}
                          </div>
                          <div class="mt-1 text-xs text-slate-300/70">
                            Actualizado {{ e.updatedAt | date: 'medium' }}
                          </div>
                        </div>
                        <span
                          class="rounded-full border px-3 py-1 text-xs"
                          [class.border-emerald-400/30]="e.estado === 'ABIERTO' || e.estado === 'EN_PROCESO'"
                          [class.bg-emerald-500/10]="e.estado === 'ABIERTO' || e.estado === 'EN_PROCESO'"
                          [class.text-emerald-100]="e.estado === 'ABIERTO' || e.estado === 'EN_PROCESO'"
                          [class.border-slate-400/20]="e.estado === 'CERRADO'"
                          [class.bg-slate-500/10]="e.estado === 'CERRADO'"
                          [class.text-slate-100]="e.estado === 'CERRADO'"
                        >
                          {{ e.estado }}
                        </span>
                      </div>
                    </a>
                  }
                </div>
              }
            }
          </div>

          <div class="p-5">
            <form class="grid gap-3" (submit)="create($event)">
              <div class="grid gap-2 md:grid-cols-[1fr_1.4fr] md:items-center">
                <label class="text-xs text-slate-300/80">Número</label>
                <input
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-white/20"
                  [(ngModel)]="numero"
                  name="numero"
                  placeholder="Ej. EXP-2026-0002"
                  required
                  maxlength="80"
                />
              </div>
              <div class="grid gap-2 md:grid-cols-[1fr_1.4fr] md:items-center">
                <label class="text-xs text-slate-300/80">Cliente</label>
                <input
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-white/20"
                  [(ngModel)]="clienteNombre"
                  name="clienteNombre"
                  placeholder="Nombre del cliente"
                  required
                  maxlength="140"
                />
              </div>
              <div class="grid gap-2 md:grid-cols-[1fr_1.4fr] md:items-center">
                <label class="text-xs text-slate-300/80">Estado</label>
                <select
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-white/20"
                  [(ngModel)]="estado"
                  name="estado"
                >
                  <option class="bg-slate-900" value="ABIERTO">ABIERTO</option>
                  <option class="bg-slate-900" value="EN_PROCESO">EN_PROCESO</option>
                  <option class="bg-slate-900" value="CERRADO">CERRADO</option>
                </select>
              </div>
              <div class="grid gap-2 md:grid-cols-[1fr_1.4fr] md:items-center">
                <label class="text-xs text-slate-300/80">Fecha de apertura</label>
                <input
                  type="date"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-white/20"
                  [(ngModel)]="fechaApertura"
                  name="fechaApertura"
                />
              </div>

              @if (createError()) {
                <div class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-100">
                  {{ createError() }}
                </div>
              }

              <div class="flex items-center justify-between gap-3 pt-1">
                <div class="text-[11px] text-slate-300/70">
                  Este formulario es solo para la demo del reto (no incluye validaciones complejas de negocio).
                </div>
                <button
                  class="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15 disabled:opacity-50"
                  type="submit"
                  [disabled]="creating() || !numero.trim() || !clienteNombre.trim()"
                >
                  @if (creating()) { Creando… } @else { Crear expediente }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ExpedientesIndexPage implements OnInit {
  private readonly api = inject(ExpedientesApi);

  loading = signal(true);
  error = signal<string | null>(null);
  expedientes = signal<ExpedienteDto[] | null>(null);

  numero = '';
  clienteNombre = '';
  estado: ExpedienteDto['estado'] = 'EN_PROCESO';
  fechaApertura: string | null = null;
  creating = signal(false);
  createError = signal<string | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);

    this.api.listExpedientes().subscribe({
      next: (data) => {
        this.expedientes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        const msg = typeof err?.message === 'string' ? err.message : 'No se pudo cargar el listado.';
        this.error.set(msg);
        this.loading.set(false);
      },
    });
  }

  create(ev: Event) {
    ev.preventDefault();
    this.createError.set(null);
    this.creating.set(true);

    this.api
      .createExpediente({
        numero: this.numero.trim(),
        clienteNombre: this.clienteNombre.trim(),
        estado: this.estado,
        fechaApertura: this.fechaApertura || undefined,
      })
      .subscribe({
        next: () => {
          this.numero = '';
          this.clienteNombre = '';
          this.fechaApertura = null;
          this.creating.set(false);
          this.load();
        },
        error: (err) => {
          const msg =
            err?.error?.message ||
            (typeof err?.message === 'string' ? err.message : 'No se pudo crear el expediente.');
          this.createError.set(String(msg));
          this.creating.set(false);
        },
      });
  }
}

