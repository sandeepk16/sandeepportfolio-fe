import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UrlAnalyzerComponent } from '../../components/url-analyzer/url-analyzer.component';
import { SEOService } from '../../services/seo.service';
import { AuditResult } from '../../services/ux-audit.service';

interface ProcessStep {
  step: string;
  icon: string;
  title: string;
  description: string;
}

interface DeliverableItem {
  icon: string;
  title: string;
  description: string;
}

interface CategoryScore {
  label: string;
  score: number;
}

interface ReportSection {
  title: string;
}

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-ux-audit',
  standalone: true,
  imports: [CommonModule, RouterModule, UrlAnalyzerComponent],
  templateUrl: './ux-audit.component.html',
  styleUrls: ['./ux-audit.component.scss']
})
export class UxAuditComponent implements OnInit {
  private seoService = inject(SEOService);

  @ViewChild('previewSection') previewSection?: ElementRef<HTMLElement>;

  // Populated by the real audit pipeline once app-url-analyzer emits a
  // completed AuditResult — no hardcoded preview data anymore.
  auditResult = signal<AuditResult | null>(null);

  readonly categoryLabels: Record<keyof AuditResult['categories'], string> = {
    navigation: 'Navigation',
    accessibility: 'Accessibility',
    mobile: 'Mobile',
    visualHierarchy: 'Visual Hierarchy',
    conversion: 'Conversion',
    content: 'Content'
  };

  categoryScores = computed<CategoryScore[]>(() => {
    const result = this.auditResult();
    if (!result) return [];
    return (Object.keys(this.categoryLabels) as Array<keyof AuditResult['categories']>).map((key) => ({
      label: this.categoryLabels[key],
      score: result.categories[key]
    }));
  });

  topPriorities = computed(() => this.auditResult()?.topPriorities ?? []);

  readonly processSteps: ProcessStep[] = [
    {
      step: '01',
      icon: 'pi-link',
      title: 'Enter Website URL',
      description: 'Paste any live URL. No sign-up, no credit card, nothing installed on your site.'
    },
    {
      step: '02',
      icon: 'pi-cog',
      title: 'AI Analyzes Your Website',
      description: 'Automated checks scan navigation, layout, accessibility and mobile behaviour in minutes.'
    },
    {
      step: '03',
      icon: 'pi-eye',
      title: 'Preview Top UX Priorities',
      description: 'See your overall score and the issues most likely to be costing you conversions.'
    },
    {
      step: '04',
      icon: 'pi-file-check',
      title: 'Unlock the Full Report',
      description: 'Get the complete, consultant-reviewed audit with a prioritized action plan.'
    }
  ];

  readonly deliverables: DeliverableItem[] = [
    { icon: 'pi-gauge', title: 'Overall UX Score', description: 'A single benchmark score showing where your site stands today.' },
    { icon: 'pi-sitemap', title: 'Navigation Review', description: 'How easily real users can find what they came for.' },
    { icon: 'pi-mobile', title: 'Mobile Experience', description: 'Usability across phones and tablets, where most traffic lands.' },
    { icon: 'pi-shield', title: 'Accessibility Review', description: 'Gaps that quietly exclude users and create legal risk.' },
    { icon: 'pi-chart-line', title: 'Conversion Opportunities', description: 'Friction points between a visitor and a decision.' },
    { icon: 'pi-flag', title: 'Top 5 UX Priorities', description: 'The fixes worth doing first, ranked by impact.' },
    { icon: 'pi-briefcase', title: 'Business Impact', description: 'What each issue is likely costing you in leads or sales.' },
    { icon: 'pi-clock', title: 'Implementation Estimate', description: 'Realistic effort and timeline for your team or mine.' },
    { icon: 'pi-file-pdf', title: 'Professional PDF', description: 'A shareable document for founders, stakeholders and developers.' }
  ];

  readonly reportSections: ReportSection[] = [
    { title: 'Executive Summary' },
    { title: 'UX Scorecard' },
    { title: 'Screens Reviewed' },
    { title: 'Navigation Audit' },
    { title: 'Accessibility Audit' },
    { title: 'Mobile Review' },
    { title: 'Conversion Review' },
    { title: 'Top Priorities' },
    { title: 'Priority Matrix' },
    { title: 'Business Impact' },
    { title: 'Implementation Estimate' },
    { title: 'Developer Recommendations' },
    { title: 'Roadmap' },
    { title: 'Next Steps' }
  ];

  readonly credentials = [
    { icon: 'pi-verified', label: 'UX Consultant' },
    { icon: 'pi-palette', label: 'Product Designer' },
    { icon: 'pi-code', label: 'Front-end Developer' }
  ];

  readonly expertReviewIncludes = [
    'The full AI-assisted report',
    '1-on-1 UX consultation with me',
    'An implementation roadmap',
    'Wireframes for key screens',
    'Developer handoff guidance'
  ];

  faqs: FaqItem[] = [
    {
      question: 'How accurate is the audit?',
      answer: 'The automated scan reliably catches structural and technical UX issues — navigation depth, accessibility gaps, mobile behaviour and layout patterns. Every free preview reflects real analysis of your site. The paid report goes further: I personally review the findings and add the judgment calls a scan alone can’t make.',
      open: false
    },
    {
      question: 'Is it AI generated?',
      answer: 'AI does the scanning and drafting — it reads faster than any human could. But the prioritization, business framing and recommendations in your full report are shaped by 16+ years of UX consulting, not left to the model alone.',
      open: false
    },
    {
      question: 'How long does it take?',
      answer: 'The free preview is ready in 2–5 minutes. The complete professional report, including my review, is delivered within 48 hours.',
      open: false
    },
    {
      question: 'Will I receive a PDF?',
      answer: 'Yes. The complete report is delivered as a professional PDF you can share with co-founders, stakeholders or your development team.',
      open: false
    },
    {
      question: 'Can you redesign my website?',
      answer: 'Yes. The audit is the starting point — many clients move into an Expert UX Review for hands-on consultation, wireframes and implementation guidance, or a full design engagement.',
      open: false
    }
  ];

  ngOnInit(): void {
    this.seoService.updatePageMetadata({
      title: 'AI-Assisted Website UX Audit - Sundeep Kumar | 16+ Years UX Consulting',
      description: 'Get a free AI-powered UX audit of your website, backed by 16+ years of UX consulting experience. See your UX score, top priorities and conversion opportunities in minutes.',
      keywords: 'Website UX Audit, UX Review, AI UX Analysis, Conversion Optimization, UX Consultant, Website Analysis, UX Score, Sundeep Kumar',
      ogTitle: 'Know What to Fix Before You Redesign',
      ogDescription: 'An AI-assisted UX audit built on 16+ years of UX consulting experience. Free preview, no login required.',
      ogImage: 'https://sundeepk.in/assets/images/og-ux-audit.jpg',
      ogUrl: 'https://sundeepk.in/ux-audit',
      canonicalUrl: '/ux-audit'
    });

    this.seoService.addStructuredData(
      this.seoService.getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'UX Audit', url: '/ux-audit' }
      ])
    );

    this.seoService.addStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Website UX Audit',
      provider: {
        '@type': 'Person',
        name: 'Sundeep Kumar'
      },
      areaServed: 'Worldwide',
      description: 'AI-assisted website UX audit combining automated analysis with 16+ years of UX consulting experience.',
      offers: {
        '@type': 'Offer',
        price: '999',
        priceCurrency: 'INR'
      }
    });

    this.seoService.addStructuredData({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: this.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    });
  }

  onAnalyzed(result: AuditResult): void {
    this.auditResult.set(result);
    setTimeout(() => {
      this.previewSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  toggleFaq(faq: FaqItem): void {
    faq.open = !faq.open;
  }

  displayUrl(): string {
    const website = this.auditResult()?.website;
    if (!website) return 'your website';
    return website.replace(/^https?:\/\//, '');
  }
}
