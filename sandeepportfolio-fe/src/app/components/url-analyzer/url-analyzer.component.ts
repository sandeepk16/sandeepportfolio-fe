import { Component, EventEmitter, Input, OnDestroy, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuditResult, UxAuditService } from '../../services/ux-audit.service';

export type AnalyzerState = 'idle' | 'validating' | 'analyzing' | 'completed' | 'failed';

const PROGRESS_MESSAGES = [
  'Checking website...',
  'Reviewing page structure...',
  'Analyzing navigation and content...',
  'Evaluating mobile experience...',
  'Generating UX priorities...',
  'Preparing your preview...'
];

// How often the progress message rotates while waiting on the real API call.
// This is NOT a fake countdown to a fixed duration — it just keeps cycling
// through the messages above until the real response arrives, however long
// that takes, then the UI jumps straight to the result.
const PROGRESS_ROTATE_MS = 4000;

@Component({
  selector: 'app-url-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './url-analyzer.component.html',
  styleUrls: ['./url-analyzer.component.scss']
})
export class UrlAnalyzerComponent implements OnDestroy {
  @Input() showTrustLine = true;
  @Input() variant: 'hero' | 'final' = 'hero';

  @Output() analyzed = new EventEmitter<AuditResult>();

  url = signal('');
  state = signal<AnalyzerState>('idle');
  error = signal('');
  progressMessage = signal(PROGRESS_MESSAGES[0]);

  private readonly urlPattern = /^(https?:\/\/)?([\w-]+\.)+[a-zA-Z]{2,}([\/\w\-._~:?#[\]@!$&'()*+,;=%]*)?$/;
  private progressTimer?: ReturnType<typeof setInterval>;

  constructor(private uxAuditService: UxAuditService) { }

  get isAnalyzing(): boolean {
    return this.state() === 'validating' || this.state() === 'analyzing';
  }

  onSubmit(): void {
    if (this.isAnalyzing) return;

    const value = this.url().trim();
    this.state.set('validating');
    this.error.set('');

    if (!value) {
      this.fail('Enter a website URL to continue.');
      return;
    }

    if (!this.urlPattern.test(value)) {
      this.fail('Enter a valid URL, e.g. yourwebsite.com');
      return;
    }

    const normalized = value.startsWith('http') ? value : `https://${value}`;

    this.state.set('analyzing');
    this.startProgressRotation();

    this.uxAuditService.runAudit(normalized).subscribe({
      next: (result) => {
        this.stopProgressRotation();
        this.state.set('completed');
        this.analyzed.emit(result);
      },
      error: (auditError: { message: string }) => {
        this.fail(auditError.message || 'Something went wrong. Please try again.');
      }
    });
  }

  ngOnDestroy(): void {
    this.stopProgressRotation();
  }

  onInputChange(): void {
    this.error.set('');
    if (this.state() === 'failed' || this.state() === 'completed') {
      this.state.set('idle');
    }
  }

  private fail(message: string): void {
    this.stopProgressRotation();
    this.state.set('failed');
    this.error.set(message);
  }

  private startProgressRotation(): void {
    let index = 0;
    this.progressMessage.set(PROGRESS_MESSAGES[0]);
    this.progressTimer = setInterval(() => {
      index = (index + 1) % PROGRESS_MESSAGES.length;
      this.progressMessage.set(PROGRESS_MESSAGES[index]);
    }, PROGRESS_ROTATE_MS);
  }

  private stopProgressRotation(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = undefined;
    }
  }
}
