import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ThemeService } from '../../theme/theme.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './nav-bar.html',
  styleUrls: ['./nav-bar.css']
})
export class NavBar {
  protected readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);

  protected readonly isDarkTheme = computed(() => this.themeService.isDark());
  protected readonly themeToggleLabel = computed(() =>
    this.themeService.isDark() ? '☀️ Light mode' : '🌙 Dark mode'
  );
  protected readonly themeTogglePressed = computed(() => (this.themeService.isDark() ? 'true' : 'false'));

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}

