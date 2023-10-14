import { Injectable } from '@angular/core';
import { Theme } from '@owlbear-rodeo/sdk';

@Injectable()
export class ThemeService {
  private theme: Theme | null = null;

  setTheme(theme: Theme): void {
    this.theme = theme;
    document.body.style.color = theme.text.primary;
    document.getElementById('app-placeholder-text')!.style.color = theme.text.secondary;
  }

  getTheme(): Theme | null {
    return this.theme;
  }
}
