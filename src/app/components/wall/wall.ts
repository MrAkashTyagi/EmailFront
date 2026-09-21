import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';

import {
  MatTooltipModule
} from '@angular/material/tooltip';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  concatMap,
  finalize,
  from,
  toArray
} from 'rxjs';

import {
  NotificationService
} from '../../service/notification-service';

import {
  WallMedia,
  WallService
} from '../../service/wall-service';
import { AuthService } from '../../service/auth-service';

interface SelectedWallFile {

  file: File;

  previewUrl: string;

  mediaType: 'IMAGE' | 'VIDEO';
}

interface DisplayWallMedia
  extends WallMedia {

  displayUrl: string;

  layoutClass:
  | 'tall'
  | 'wide'
  | 'square'
  | 'hero';
}

@Component({
  selector: 'app-wall',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './wall.html',
  styleUrls: ['./wall.css']
})
export class Wall
  implements OnInit, OnDestroy {

  private readonly wallService =
    inject(WallService);

  private readonly notificationService =
    inject(NotificationService);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly platformId =
    inject(PLATFORM_ID);

  readonly wallMedia =
    signal<DisplayWallMedia[]>([]);

  readonly selectedFiles =
    signal<SelectedWallFile[]>([]);

  readonly loading =
    signal(false);

  readonly uploading =
    signal(false);

  readonly uploadCompleted =
    signal(0);

  readonly previewMedia =
    signal<DisplayWallMedia | null>(
      null
    );

  readonly authService = inject(AuthService);

  caption = '';

  readonly selectedCount =
    computed(
      () =>
        this.selectedFiles().length
    );

  readonly uploadProgressText =
    computed(() => {

      if (!this.uploading()) {
        return '';
      }

      return `${this.uploadCompleted()} of ${this.selectedCount()} uploaded`;
    });

  ngOnInit(): void {

    if (!this.isBrowser()) {
      return;
    }

    this.loadWall();
  }

  ngOnDestroy(): void {

    this.revokeSelectedPreviews();

    this.revokeWallDisplayUrls();
  }

  private isBrowser(): boolean {

    return isPlatformBrowser(
      this.platformId
    );
  }

  loadWall(): void {

    this.loading.set(true);

    this.wallService
      .getAllMedia()
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: mediaList => {

          this.loadMediaContent(
            mediaList || []
          );
        },

        error: error => {

          console.error(
            'Wall load failed:',
            error
          );

          this.loading.set(false);

          this.notificationService.error(
            'Wall media load nahi ho paya.'
          );
        }
      });
  }

  private loadMediaContent(
    mediaList: WallMedia[]
  ): void {

    this.revokeWallDisplayUrls();

    if (mediaList.length === 0) {

      this.wallMedia.set([]);

      this.loading.set(false);

      return;
    }

    from(mediaList)
      .pipe(
        concatMap(media =>
          this.wallService
            .getMediaContent(
              media.id
            )
            .pipe(
              concatMap(blob => {


                const layouts = [
                  'hero',
                  'tall',
                  'wide',
                  'square'
                ] as const;;

                const displayMedia:
                  DisplayWallMedia = {
                  ...media,

                  displayUrl:
                    URL.createObjectURL(
                      blob
                    ),

                  layoutClass:
                    layouts[
                    Math.floor(
                      Math.random() *
                      layouts.length
                    )
                    ]
                };

                return [
                  displayMedia
                ];
              })
            )
        ),

        toArray(),

        finalize(() => {
          this.loading.set(false);
        }),

        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: displayMedia => {

          this.wallMedia.set(
            displayMedia
          );
        },

        error: error => {

          console.error(
            'Media content load failed:',
            error
          );

          this.notificationService.error(
            'Kuch wall files load nahi ho payi.'
          );
        }
      });
  }

  onFilesSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }

    const validFiles:
      SelectedWallFile[] = [];

    const rejectedFiles:
      string[] = [];

    Array.from(
      input.files
    ).forEach(file => {

      const mediaType =
        this.resolveMediaType(
          file
        );

      if (!mediaType) {

        rejectedFiles.push(
          file.name
        );

        return;
      }

      if (
        file.size >
        100 * 1024 * 1024
      ) {

        rejectedFiles.push(
          file.name
        );

        return;
      }

      validFiles.push({
        file,

        previewUrl:
          URL.createObjectURL(
            file
          ),

        mediaType
      });
    });

    this.selectedFiles.update(
      currentFiles => [
        ...currentFiles,
        ...validFiles
      ]
    );

    if (
      rejectedFiles.length > 0
    ) {
      this.notificationService.warning(
        `${rejectedFiles.length} invalid or oversized file(s) skipped.`
      );
    }

    input.value = '';
  }

  private resolveMediaType(
    file: File
  ): 'IMAGE' | 'VIDEO' | null {

    if (
      file.type.startsWith(
        'image/'
      )
    ) {
      return 'IMAGE';
    }

    if (
      file.type.startsWith(
        'video/'
      )
    ) {
      return 'VIDEO';
    }

    return null;
  }

  removeSelectedFile(
    index: number
  ): void {

    const selectedFile =
      this.selectedFiles()[index];

    if (selectedFile) {

      URL.revokeObjectURL(
        selectedFile.previewUrl
      );
    }

    this.selectedFiles.update(
      files =>
        files.filter(
          (_, fileIndex) =>
            fileIndex !== index
        )
    );
  }

  clearSelectedFiles(): void {

    this.revokeSelectedPreviews();

    this.selectedFiles.set([]);
  }

  uploadSelectedFiles(): void {

    const selectedFiles =
      this.selectedFiles();

    if (
      selectedFiles.length === 0 ||
      this.uploading()
    ) {
      return;
    }

    this.uploading.set(true);

    this.uploadCompleted.set(0);

    const caption =
      this.caption.trim();

    from(selectedFiles)
      .pipe(
        concatMap(selectedFile =>
          this.wallService
            .uploadMedia(
              selectedFile.file,
              caption
            )
        ),

        finalize(() => {
          this.uploading.set(false);
        }),

        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: () => {

          this.uploadCompleted.update(
            count => count + 1
          );
        },

        error: error => {

          console.error(
            'Wall upload failed:',
            error
          );

          this.notificationService.error(
            'Media upload complete nahi ho paya.'
          );
        },

        complete: () => {

          const uploadedCount =
            selectedFiles.length;

          this.notificationService.success(
            `${uploadedCount} media file(s) uploaded successfully.`
          );

          this.clearSelectedFiles();

          this.caption = '';

          this.uploadCompleted.set(0);

          this.loadWall();
        }
      });
  }

  openPreview(
    media: DisplayWallMedia
  ): void {

    this.previewMedia.set(
      media
    );
  }

  closePreview(): void {

    this.previewMedia.set(
      null
    );
  }

  deleteMedia(
    media: DisplayWallMedia,
    event?: Event
  ): void {

    event?.stopPropagation();

    const confirmed =
      confirm(
        'Do you want to delete this media?'
      );

    if (!confirmed) {
      return;
    }

    this.wallService
      .deleteMedia(
        media.id
      )
      .pipe(
        takeUntilDestroyed(
          this.destroyRef
        )
      )
      .subscribe({
        next: () => {

          URL.revokeObjectURL(
            media.displayUrl
          );

          this.wallMedia.update(
            items =>
              items.filter(
                item =>
                  item.id !== media.id
              )
          );

          if (
            this.previewMedia()?.id ===
            media.id
          ) {
            this.closePreview();
          }

          this.notificationService.success(
            'Media deleted successfully.'
          );
        },

        error: error => {

          console.error(
            'Media delete failed:',
            error
          );

          this.notificationService.error(
            'Media delete nahi ho paya.'
          );
        }
      });
  }

  formatFileSize(
    size: number
  ): string {

    if (size < 1024) {
      return `${size} B`;
    }

    if (
      size <
      1024 * 1024
    ) {
      return `${(
        size / 1024
      ).toFixed(1)
        } KB`;
    }

    return `${(
      size /
      (
        1024 * 1024
      )
    ).toFixed(1)
      } MB`;
  }

  trackMedia(
    _: number,
    media: DisplayWallMedia
  ): number {

    return media.id;
  }

  private revokeSelectedPreviews():
    void {

    this.selectedFiles()
      .forEach(file => {

        URL.revokeObjectURL(
          file.previewUrl
        );
      });
  }

  private revokeWallDisplayUrls():
    void {

    this.wallMedia()
      .forEach(media => {

        URL.revokeObjectURL(
          media.displayUrl
        );
      });
  }

  downloadMedia(
    media: DisplayWallMedia,
    event: Event
  ): void {

    event.stopPropagation();

    const link =
      document.createElement('a');

    link.href =
      media.displayUrl;

    link.download =
      media.originalFileName;

    link.click();
  }
  downloadAllMedia(): void {

    this.wallService
      .downloadAllMedia()
      .subscribe({

        next: blob => {

          const url =
            URL.createObjectURL(
              blob
            );

          const link =
            document.createElement(
              'a'
            );

          link.href =
            url;

          link.download =
            'WeddingWall.zip';

          link.click();

          URL.revokeObjectURL(
            url
          );
        },

        error: () => {

          this.notificationService.error(
            'Download failed.'
          );
        }
      });
  }

  readonly imageCount =
    computed(
      () =>
        this.wallMedia()
          .filter(
            media =>
              media.mediaType
              === 'IMAGE'
          )
          .length
    );

  readonly videoCount =
    computed(
      () =>
        this.wallMedia()
          .filter(
            media =>
              media.mediaType
              === 'VIDEO'
          )
          .length
    );

}
