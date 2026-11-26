import { Injectable, signal } from '@angular/core';

export interface HoverRevealState {
  visible: boolean;
  imageUrl: string;
  label: string;
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root'
})
export class HoverRevealService {
  state = signal<HoverRevealState>({
    visible: false,
    imageUrl: '',
    label: '',
    x: -300,
    y: -300
  });

  show(imageUrl: string, label: string, x: number, y: number) {
    this.state.set({
      visible: true,
      imageUrl,
      label,
      x,
      y
    });
  }

  move(x: number, y: number) {
    this.state.update(curr => ({
      ...curr,
      x,
      y
    }));
  }

  hide() {
    this.state.update(curr => ({
      ...curr,
      visible: false
    }));
  }
}
