import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, TimeoutError, catchError, throwError, timeout } from 'rxjs';

import { environment } from '../../environments/environment';

export interface AuditCategories {
  navigation: number;
  accessibility: number;
  mobile: number;
  conversion: number;
  visualHierarchy: number;
  content: number;
}

export interface AuditPriority {
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  businessImpact: string;
  recommendation: string;
  estimatedEffort: 'Low' | 'Medium' | 'High';
}

export interface AuditResult {
  auditId: string;
  website: string;
  status: 'processing' | 'completed' | 'failed';

  overallScore: number;

  categories: AuditCategories;

  topPriorities: AuditPriority[];

  summary: string;

  screensReviewed: number;

  generatedAt: string;

  // Only present once the backend actually knows the paid report's real
  // finding count — the component falls back to generic copy when absent.
  additionalFindingsCount?: number;
}

export interface AuditError {
  code: string;
  message: string;
}

// An analysis can genuinely take a while (real browser + real LLM call) —
// this is a client-side safety cap, not a claimed completion time.
const REQUEST_TIMEOUT_MS = 150000;

@Injectable({
  providedIn: 'root'
})
export class UxAuditService {

  constructor(private http: HttpClient) { }

  runAudit(url: string): Observable<AuditResult> {
    return this.http.post<AuditResult>(`${environment.apiUrl}/audit`, { url }).pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((err: unknown) => throwError(() => this.toAuditError(err)))
    );
  }

  private toAuditError(err: unknown): AuditError {
    if (err instanceof HttpErrorResponse) {
      const apiError = err.error?.error as { code?: string; message?: string } | undefined;
      if (apiError?.message) {
        return { code: apiError.code || 'API_ERROR', message: apiError.message };
      }
      if (err.status === 0) {
        return {
          code: 'NETWORK_ERROR',
          message: 'Could not reach the audit service. Check your connection and try again.'
        };
      }
      return {
        code: 'API_ERROR',
        message: 'Something went wrong while analyzing that website. Please try again.'
      };
    }

    if (err instanceof TimeoutError) {
      return {
        code: 'TIMEOUT',
        message: 'The analysis is taking longer than expected. Please try again in a moment.'
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'Something went wrong while analyzing that website. Please try again.'
    };
  }
}
