import { ApplicationConfig } from '@angular/core';
import { ThemeService } from './services/theme.service';
import { ContextMenuService } from './services/context-menu.service';
import { ProximitiesService } from './services/proximities.service';

export const appConfig: ApplicationConfig = {
  providers: [ThemeService, ContextMenuService, ProximitiesService],
};
