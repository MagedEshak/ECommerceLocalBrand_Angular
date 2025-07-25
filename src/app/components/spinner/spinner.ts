import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SpinnerService } from '../../shared/services/SpinnerService/spinner-service';

@Component({
  selector: 'app-spinner',
  imports: [CommonModule],
  templateUrl: './spinner.html',
  styleUrls: ['./spinner.css'],
})
export class Spinner {
  constructor(public spinnerService: SpinnerService) {}
}
