import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, EMPTY, Observable, catchError, map, of, switchMap } from 'rxjs';

export const WHATS_NEW_SEEN_VERSION_KEY = 'faith-giving:whats-new:last-seen-version';

export interface AppVersionInfo {
  version: string;
  buildVersion?: string;
  buildNumber?: string;
  buildDate?: string;
  environment?: string;
}

export interface WhatsNewItem {
  title: string;
  description?: string;
}

export interface WhatsNewContent {
  version: string;
  title: string;
  items: WhatsNewItem[];
}

export interface WhatsNewState {
  version: AppVersionInfo;
  content: WhatsNewContent;
}

@Injectable({ providedIn: 'root' })
export class AppVersionService {
  private readonly whatsNewSubject = new BehaviorSubject<WhatsNewState | null>(null);
  private readonly metadataRequestOptions = {
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  };
  readonly whatsNew$ = this.whatsNewSubject.asObservable();
  private initialized = false;

  constructor(private http: HttpClient) {}

  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.loadVersionInfo().pipe(
      switchMap((version) => {
        if (!this.shouldShowVersion(version.version)) {
          return EMPTY;
        }

        return this.loadWhatsNewContent(version).pipe(
          map((content) => ({ version, content }))
        );
      }),
      catchError(() => EMPTY)
    ).subscribe((state) => this.whatsNewSubject.next(state));
  }

  dismissCurrentVersion(): void {
    const state = this.whatsNewSubject.value;

    if (!state) {
      return;
    }

    this.setLastSeenVersion(state.version.version);
    this.whatsNewSubject.next(null);
  }

  shouldShowVersion(version: string): boolean {
    if (!version) {
      return false;
    }

    return this.getLastSeenVersion() !== version;
  }

  private loadVersionInfo(): Observable<AppVersionInfo> {
    return this.http.get<Partial<AppVersionInfo>>(this.assetUrl('version.json'), this.metadataRequestOptions).pipe(
      map((version) => this.normalizeVersionInfo(version))
    );
  }

  private loadWhatsNewContent(version: AppVersionInfo): Observable<WhatsNewContent> {
    return this.http.get<Partial<WhatsNewContent>>(this.assetUrl('whats-new.json'), this.metadataRequestOptions).pipe(
      map((content) => this.normalizeWhatsNewContent(content, version)),
      catchError(() => of(this.defaultWhatsNewContent(version)))
    );
  }

  private assetUrl(fileName: string): string {
    return `./assets/${fileName}?v=${Date.now()}`;
  }

  private normalizeVersionInfo(version: Partial<AppVersionInfo> | null | undefined): AppVersionInfo {
    return {
      version: String(version?.version || '0.0.0'),
      buildVersion: version?.buildVersion ? String(version.buildVersion) : undefined,
      buildNumber: version?.buildNumber ? String(version.buildNumber) : undefined,
      buildDate: version?.buildDate ? String(version.buildDate) : undefined,
      environment: version?.environment ? String(version.environment) : undefined,
    };
  }

  private normalizeWhatsNewContent(
    content: Partial<WhatsNewContent> | null | undefined,
    version: AppVersionInfo
  ): WhatsNewContent {
    if (!content || content.version !== version.version || !Array.isArray(content.items)) {
      return this.defaultWhatsNewContent(version);
    }

    const items = content.items
      .filter((item) => item?.title && typeof item.title === 'string')
      .map((item) => ({
        title: item.title.trim(),
        description: typeof item.description === 'string' ? item.description.trim() : '',
      }))
      .filter((item) => item.title.length > 0);

    if (items.length === 0) {
      return this.defaultWhatsNewContent(version);
    }

    return {
      version: version.version,
      title: content.title ? String(content.title) : `What's New in v${version.version}`,
      items,
    };
  }

  private defaultWhatsNewContent(version: AppVersionInfo): WhatsNewContent {
    return {
      version: version.version,
      title: `What's New in v${version.version}`,
      items: [
        {
          title: 'Faith Giving was updated',
          description: 'This version includes the latest improvements and fixes.',
        },
      ],
    };
  }

  private getLastSeenVersion(): string | null {
    try {
      return window.localStorage.getItem(WHATS_NEW_SEEN_VERSION_KEY);
    } catch {
      return null;
    }
  }

  private setLastSeenVersion(version: string): void {
    try {
      window.localStorage.setItem(WHATS_NEW_SEEN_VERSION_KEY, version);
    } catch {
      // Ignore storage failures so the modal can still be dismissed for this session.
    }
  }
}
