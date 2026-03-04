import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'expedientes',
  },
  {
    path: 'expedientes',
    loadComponent: () =>
      import('./expedientes/expedientes-index.page').then((m) => m.ExpedientesIndexPage),
  },
  {
    path: 'expedientes/:id',
    loadComponent: () => import('./expedientes/expediente.page').then((m) => m.ExpedientePage),
  },
  { path: '**', redirectTo: 'expedientes' },
];
