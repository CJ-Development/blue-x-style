import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-policies-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './policies-page.component.html',
  styleUrls: ['./policies-page.component.scss']
})
export class PoliciesPageComponent {}
