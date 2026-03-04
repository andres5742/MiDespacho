import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { CargaLoteDto, ExpedienteDto, ExpedientesApi } from './expedientes.api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  template: `
    <div class="min-h-screen">
      <div class="mx-auto max-w-6xl px-6 py-10">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <a
              class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 hover:bg-white/10"
              routerLink="/expedientes"
            >
              Volver
            </a>
            <div>
              <div class="text-xs text-slate-300/70">Expediente</div>
              <h1 class="mt-1 text-2xl font-semibold tracking-tight text-white">
                @if (expediente()) {
                  {{ expediente()!.numero }} · {{ expediente()!.clienteNombre }}
                } @else {
                  Cargando…
                }
              </h1>
            </div>
          </div>

          @if (expediente()) {
            <div class="flex flex-wrap items-center gap-3">
              <div class="flex items-center gap-2">
                <label class="text-xs text-slate-300/70">Estado</label>
                <select
                  class="rounded-full border px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-white/30"
                  [class.border-emerald-400/30]="estadoSeleccionado !== 'CERRADO'"
                  [class.bg-emerald-500/10]="estadoSeleccionado !== 'CERRADO'"
                  [class.text-emerald-100]="estadoSeleccionado !== 'CERRADO'"
                  [class.border-slate-400/20]="estadoSeleccionado === 'CERRADO'"
                  [class.bg-slate-500/10]="estadoSeleccionado === 'CERRADO'"
                  [class.text-slate-100]="estadoSeleccionado === 'CERRADO'"
                  [(ngModel)]="estadoSeleccionado"
                  (change)="cambiarEstado()"
                  [disabled]="updatingEstado()"
                  name="estado"
                >
                  <option value="ABIERTO" class="bg-slate-900 text-slate-100">ABIERTO</option>
                  <option value="EN_PROCESO" class="bg-slate-900 text-slate-100">EN_PROCESO</option>
                  <option value="CERRADO" class="bg-slate-900 text-slate-100">CERRADO</option>
                </select>
                @if (updatingEstado()) {
                  <span class="text-xs text-slate-400">Guardando…</span>
                }
              </div>

              <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200">
                <div class="text-slate-300/70">Apertura</div>
                <div class="mt-0.5 font-medium text-slate-100">
                  {{ expediente()!.fechaApertura ?? '—' }}
                </div>
              </div>

              <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200">
                <div class="text-slate-300/70">Última actualización</div>
                <div class="mt-0.5 font-medium text-slate-100">
                  {{ expediente()!.updatedAt | date: 'medium' }}
                </div>
              </div>
            </div>
          }
        </div>

        <div class="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div class="grid gap-6">
            <div class="rounded-2xl border border-white/10 bg-white/5 shadow-soft">
              <div class="border-b border-white/10 px-5 py-4">
                <div class="text-sm font-medium text-slate-100">Nueva carga (lote)</div>
                <div class="mt-1 text-xs text-slate-300/70">
                  Carga múltiple en una sola acción. Cada lote queda registrado con título y descripción.
                </div>
              </div>

              <form class="grid gap-4 p-5" (submit)="submit($event)">
                <div class="grid gap-2">
                  <label class="text-xs text-slate-300/80">Título</label>
                  <input
                    class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none focus:border-white/20"
                    [(ngModel)]="titulo"
                    name="titulo"
                    placeholder="Ej. Evidencia — Comunicaciones con contraparte"
                    required
                    maxlength="120"
                  />
                </div>

                <div class="grid gap-2">
                  <label class="text-xs text-slate-300/80">Descripción</label>
                  <textarea
                    class="min-h-24 w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none focus:border-white/20"
                    [(ngModel)]="descripcion"
                    name="descripcion"
                    placeholder="Contexto del conjunto de archivos (opcional)."
                    maxlength="2000"
                  ></textarea>
                </div>

                <div class="grid gap-2">
                  <label class="text-xs text-slate-300/80">Archivos</label>
                  <div class="rounded-xl border border-dashed border-white/15 bg-white/5 p-4">
                    <input type="file" multiple (change)="onFiles($event)" />
                    <div class="mt-2 text-xs text-slate-300/70">
                      Seleccionados: <span class="text-slate-100">{{ selectedFiles().length }}</span>
                      (máx. 20 · máx. 25MB c/u)
                    </div>
                    @if (selectedFiles().length) {
                      <ul class="mt-3 grid gap-1">
                        @for (f of selectedFiles(); track f.name + f.size) {
                          <li class="flex items-center justify-between gap-3 text-xs text-slate-200">
                            <span class="truncate">{{ f.name }}</span>
                            <span class="shrink-0 text-slate-300/70">{{ formatBytes(f.size) }}</span>
                          </li>
                        }
                      </ul>
                    }
                  </div>
                </div>

                @if (submitError()) {
                  <div class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-100">
                    {{ submitError() }}
                  </div>
                }

                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div class="text-xs text-slate-300/70">
                    Los archivos se almacenan en el servidor y se listan por lote.
                  </div>
                  <button
                    class="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 disabled:opacity-50"
                    [disabled]="submitting() || !(titulo.trim() && selectedFiles().length > 0)"
                    type="submit"
                  >
                    @if (submitting()) { Subiendo… } @else { Subir lote }
                  </button>
                </div>
              </form>
            </div>

            <div class="rounded-2xl border border-white/10 bg-white/5 shadow-soft">
              <div class="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                <div>
                  <div class="text-sm font-medium text-slate-100">Archivos del expediente</div>
                  <div class="mt-1 text-xs text-slate-300/70">
                    Agrupados por lote. Total: <span class="text-slate-100">{{ totalArchivos() }}</span>
                  </div>
                </div>
                <button
                  class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 hover:bg-white/10"
                  (click)="reload()"
                  [disabled]="loading()"
                >
                  Recargar
                </button>
              </div>

              <div class="p-5">
                @if (error()) {
                  <div class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                    {{ error() }}
                  </div>
                }

                @if (loading()) {
                  <div class="grid gap-3">
                    <div class="h-28 rounded-xl bg-white/5"></div>
                    <div class="h-28 rounded-xl bg-white/5"></div>
                  </div>
                } @else {
                  @if (!lotes()?.length) {
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                      Aún no hay cargas para este expediente.
                    </div>
                  } @else {
                    <div class="grid gap-4">
                      @for (l of lotes()!; track l.id) {
                        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div class="flex flex-wrap items-start justify-between gap-4">
                            <div class="min-w-0">
                              <div class="text-xs text-slate-300/70">
                                {{ l.createdAt | date: 'medium' }}
                              </div>
                              <div class="mt-1 truncate text-base font-semibold text-white">
                                {{ l.titulo }}
                              </div>
                              @if (l.descripcion) {
                                <div class="mt-1 text-sm text-slate-200/80">
                                  {{ l.descripcion }}
                                </div>
                              }
                            </div>
                            <div class="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100">
                              {{ l.archivos.length }} archivo(s)
                            </div>
                          </div>

                          <div class="mt-4 overflow-hidden rounded-xl border border-white/10">
                            <div class="grid grid-cols-[1fr_auto] gap-0 bg-white/5 px-3 py-2 text-xs text-slate-300/80">
                              <div>Archivo</div>
                              <div class="text-right">Tamaño</div>
                            </div>
                            <div class="divide-y divide-white/10">
                              @for (a of l.archivos; track a.id) {
                                <div class="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-2">
                                  <a
                                    class="truncate text-sm text-slate-100 hover:underline"
                                    [href]="api.downloadUrl(a.id)"
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {{ a.originalName }}
                                  </a>
                                  <div class="text-right text-xs text-slate-300/70">
                                    {{ formatBytes(+a.sizeBytes) }}
                                  </div>
                                </div>
                              }
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  }
                }
              </div>
            </div>
          </div>

          <aside class="grid content-start gap-6">
            <div class="rounded-2xl border border-white/10 bg-white/5 shadow-soft">
              <div class="border-b border-white/10 px-5 py-4">
                <div class="text-sm font-medium text-slate-100">Contexto</div>
                <div class="mt-1 text-xs text-slate-300/70">Secciones no funcionales (mock de módulo completo)</div>
              </div>
              <div class="grid gap-3 p-5 text-sm">
                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div class="text-xs text-slate-300/70">Próximas acciones</div>
                  <ul class="mt-2 grid gap-2 text-slate-100">
                    <li class="flex items-center justify-between gap-3">
                      <span>Generar escrito</span>
                      <span class="text-xs text-slate-300/60">Próximamente</span>
                    </li>
                    <li class="flex items-center justify-between gap-3">
                      <span>Asignar responsable</span>
                      <span class="text-xs text-slate-300/60">Próximamente</span>
                    </li>
                    <li class="flex items-center justify-between gap-3">
                      <span>Registrar audiencia</span>
                      <span class="text-xs text-slate-300/60">Próximamente</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  `,
})
export class ExpedientePage implements OnInit, OnDestroy {
  readonly api = inject(ExpedientesApi);
  private readonly route = inject(ActivatedRoute);

  private sub?: Subscription;

  loading = signal(true);
  submitting = signal(false);
  updatingEstado = signal(false);
  error = signal<string | null>(null);
  submitError = signal<string | null>(null);

  expediente = signal<ExpedienteDto | null>(null);
  lotes = signal<CargaLoteDto[] | null>(null);
  estadoSeleccionado: ExpedienteDto['estado'] = 'ABIERTO';

  titulo = '';
  descripcion = '';
  selectedFiles = signal<File[]>([]);

  totalArchivos = computed(() => (this.lotes()?.reduce((acc, l) => acc + (l.archivos?.length ?? 0), 0) ?? 0));

  ngOnInit() {
    this.sub = this.route.paramMap.subscribe(() => this.reload());
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  reload() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    const exp$ = this.api.getExpediente(id);
    const lotes$ = this.api.listLotes(id);

    forkJoin({ exp: exp$, lotes: lotes$ }).subscribe({
      next: ({ exp, lotes }) => {
        this.expediente.set(exp);
        this.estadoSeleccionado = exp.estado;
        this.lotes.set(lotes);
        this.loading.set(false);
      },
      error: (err) => {
        const msg = typeof err?.message === 'string' ? err.message : 'No se pudo cargar el expediente.';
        this.error.set(msg);
        this.loading.set(false);
      },
    });
  }

  onFiles(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.selectedFiles.set(files.slice(0, 20));
  }

  cambiarEstado() {
    const estado = this.estadoSeleccionado;
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || !estado) return;
    this.updatingEstado.set(true);
    this.api.updateExpedienteEstado(id, estado).subscribe({
      next: (exp) => {
        this.expediente.set(exp);
        this.estadoSeleccionado = exp.estado;
        this.updatingEstado.set(false);
      },
      error: () => {
        this.estadoSeleccionado = this.expediente()!.estado;
        this.updatingEstado.set(false);
      },
    });
  }

  submit(ev: Event) {
    ev.preventDefault();
    const expId = this.route.snapshot.paramMap.get('id');
    if (!expId) return;

    this.submitError.set(null);
    this.submitting.set(true);

    this.api
      .createLote(expId, { titulo: this.titulo.trim(), descripcion: this.descripcion.trim() || undefined }, this.selectedFiles())
      .subscribe({
        next: () => {
          this.titulo = '';
          this.descripcion = '';
          this.selectedFiles.set([]);
          this.submitting.set(false);
          this.reload();
        },
        error: (err) => {
          const msg =
            err?.error?.message ||
            (typeof err?.message === 'string' ? err.message : 'No se pudo subir el lote.');
          this.submitError.set(String(msg));
          this.submitting.set(false);
        },
      });
  }

  formatBytes(bytes: number) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }
}

