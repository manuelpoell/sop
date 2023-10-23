import { Injectable } from '@angular/core';
import OBR, { Item, Vector2 } from '@owlbear-rodeo/sdk';
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
    const fogs = await OBR.scene.items.getItems((item) => item.layer === 'FOG' && item.visible);
    for (let token of characters) {
      if (this.invisibleToken(token, fogs)) continue;
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

  private invisibleToken(token: Item, fogs: Array<Item>): boolean {
    if (!this.referenceToken) return true;
    const insideFogOfWar: Array<boolean> = fogs.map((fog: any) =>
      this.isInPolygon(
        this.convertPosition(token.position),
        this.convertToPolygon(this.convertPosition(fog.position), fog['commands'])
      )
    );
    return insideFogOfWar.some((inside) => inside) || !token.visible || token.id === this.referenceToken.id;
  }

  // https://stackoverflow.com/a/29915728
  private isInPolygon(point: Array<number>, vs: Array<Array<number>>): boolean {
    const x = point[0];
    const y = point[1];

    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0];
      const yi = vs[i][1];
      const xj = vs[j][0];
      const yj = vs[j][1];

      const intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  private convertPosition(position: Vector2): Array<number> {
    return [position.x, position.y];
  }

  private convertToPolygon(start: Array<number>, commands: Array<Array<number>>): Array<Array<number>> {
    return commands.map((cmd) => [start[0] + cmd[1], start[1] + cmd[2]]).slice(0, -1);
  }
}
