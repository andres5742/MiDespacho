import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <div class="relative min-h-screen">
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_10%,rgba(59,130,246,0.22),transparent_60%),radial-gradient(900px_500px_at_80%_30%,rgba(16,185,129,0.16),transparent_55%),radial-gradient(800px_500px_at_50%_90%,rgba(168,85,247,0.12),transparent_55%)]"
      ></div>
      <div class="relative">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('web');
}
