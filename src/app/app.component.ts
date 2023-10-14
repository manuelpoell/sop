import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextMenuService } from './services/context-menu.service';
import { ThemeService } from './services/theme.service';
import OBR, { Item } from '@owlbear-rodeo/sdk';
import { ProximitiesService } from './services/proximities.service';
import { Subscription } from 'rxjs';
import { ProximityItemComponent } from './components/proximity-item.component';
import { Proximity } from './models/proximity.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ProximityItemComponent],
  template: `
    <div class="app-container">
      <div *ngIf="!referenceToken" class="app-placeholder">
        <span id="app-placeholder-text">Schmandi<br />Observes Proximity</span>
      </div>
      <ng-container *ngIf="referenceToken">
        <div class="reference-name-container">
          <span [style.color]="primaryColor">{{ referenceToken.name }}</span>
          <span class="clear-button" (click)="unsetReferenceToken()">&#x26CC;</span>
        </div>
        <app-proximity-item *ngFor="let item of proximities" [item]="item"></app-proximity-item>
      </ng-container>
    </div>
  `,
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  referenceToken: Item | null = null;
  proximities: Array<Proximity> = [];
  primaryColor?: string;
  private subscriptions = new Subscription();

  constructor(
    private contextMenuService: ContextMenuService,
    private themeService: ThemeService,
    private proximitiesService: ProximitiesService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    OBR.onReady(() => {
      this.contextMenuService.setup();
      OBR.theme.getTheme().then(
        (theme) => this.themeService.setTheme(theme),
        (error) => console.error(error)
      );
      OBR.theme.onChange((theme) => this.themeService.setTheme(theme));
      OBR.action.setHeight(225);
      OBR.scene.items.onChange(() => this.proximitiesService.updateProximities());
    });

    let s = this.proximitiesService.getReferenceTokenStream().subscribe((token) => {
      this.referenceToken = token;
      this.primaryColor = this.themeService.getTheme()?.primary.dark;
      this.cdRef.detectChanges();
    });
    this.subscriptions.add(s);

    s = this.proximitiesService.getProximitiesStream().subscribe((proximities) => {
      this.proximities = proximities.sort((a, b) => a.distance - b.distance);
      this.cdRef.detectChanges();
    });
  }

  unsetReferenceToken(): void {
    this.proximitiesService.setReferenceToken(null);
    OBR.action.setHeight(225);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
