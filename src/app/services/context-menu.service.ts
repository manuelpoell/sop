import { Injectable } from '@angular/core';
import OBR from '@owlbear-rodeo/sdk';
import { ID } from '../utils/config';
import { ProximitiesService } from './proximities.service';

@Injectable()
export class ContextMenuService {
  constructor(private proximitiesService: ProximitiesService) {}

  setup(): void {
    const that = this;
    OBR.contextMenu.create({
      id: `${ID}/context-menu`,
      icons: [
        {
          icon: '/assets/app-icon.svg',
          label: 'SOP - Set as reference point',
          filter: {
            every: [{ key: 'layer', value: 'CHARACTER' }],
          },
        },
      ],
      onClick(context) {
        that.proximitiesService.setReferenceToken(context.items[0]);
      },
    });
  }
}
