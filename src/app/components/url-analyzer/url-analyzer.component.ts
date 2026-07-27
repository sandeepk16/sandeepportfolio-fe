import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-url-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './url-analyzer.component.html',
  styleUrls: ['./url-analyzer.component.scss']
})
export class UrlAnalyzerComponent {
  @Input() showTrustLine = true;
  @Input() variant: 'hero' | 'final' = 'hero';

  @Output() analyzed = new EventEmitter<string>();

  url = signal('');
  isAnalyzing = signal(false);
  error = signal('');

  private readonly urlPattern = /^(https?:\/\/)?([\w-]+\.)+[a-zA-Z]{2,}([\/\w\-._~:?#[\]@!$&'()*+,;=%]*)?$/;

  onSubmit(): void {
    const value = this.url().trim();

    if (!value) {
      this.error.set('Enter a website URL to continue.');
      return;
    }

    if (!this.urlPattern.test(value)) {
      this.error.set('Enter a valid URL, e.g. yourwebsite.com');
      return;
    }

    this.error.set('');
    this.isAnalyzing.set(true);

    const normalized = value.startsWith('http') ? value : `https://${value}`;

    setTimeout(() => {
      this.isAnalyzing.set(false);
      this.analyzed.emit(normalized);
    }, 2200);
  }
}
