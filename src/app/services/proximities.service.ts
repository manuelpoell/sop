import { Injectable } from '@angular/core';
import OBR, { Item } from '@owlbear-rodeo/sdk';
import { BehaviorSubject, Observable } from 'rxjs';
import { Proximity } from '../models/proximity.model';

@Injectable()
export class ProximitiesService {
  private referenceToken: Item | null = null;
  private referenceToken$ = new BehaviorSubject<Item | null>(null);
  private proximities$ = new BehaviorSubject<Array<Proximity>>([]);

  async updateProximities(): Promise<void> {
    if (!this.referenceToken) return;

    const characters = await OBR.scene.items.getItems((item) => item.layer === 'CHARACTER');
    const proximities: Array<Proximity> = [];
    const currentMeasurement = await OBR.scene.grid.getMeasurement();
    const scale = await OBR.scene.grid.getScale();
    await OBR.scene.grid.setMeasurement('EUCLIDEAN');
    for (let token of characters) {
      if (!token.visible || token.id === this.referenceToken.id) continue;
      const distance = await OBR.scene.grid.getDistance(this.referenceToken.position, token.position);
      proximities.push({
        name: token.name,
        distance: Math.floor(distance * scale.parsed.multiplier),
        unit: scale.parsed.unit,
      });
    }
    await OBR.scene.grid.setMeasurement(currentMeasurement);
    const minHeight = 225;
    const newHeight = 75 + proximities.length * 50;
    OBR.action.setHeight(newHeight > minHeight ? newHeight : minHeight);
    this.proximities$.next(proximities);
  }

  setReferenceToken(item: Item | null): void {
    this.referenceToken = item;
    this.referenceToken$.next(this.referenceToken);
    this.updateProximities();
  }

  getProximitiesStream(): Observable<Array<Proximity>> {
    return this.proximities$.asObservable();
  }

  getReferenceTokenStream(): Observable<Item | null> {
    return this.referenceToken$.asObservable();
  }
}
