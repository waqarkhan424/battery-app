// FILE: hooks/useVideoDownload.ts (Option A - gallery only, stable content://)
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export function useVideoDownload(videoUrl: string) {
  const [localUri, setLocalUri] = useState<string | null>(null); // content://… when available
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileName = videoUrl.split('/').pop() || 'default.mp4';
  const tempFileUri = (FileSystem.cacheDirectory ?? '') + fileName;

  // Prefer content:// (asset.uri). Fall back to file:// if needed.
  const pickPlayableUri = (asset: MediaLibrary.Asset | null, info?: MediaLibrary.AssetInfo | null) => {
    return asset?.uri || info?.localUri || null;
  };

  const findAssetInGalleryExact = useCallback(async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') return null;

    const album = await MediaLibrary.getAlbumAsync('BatteryAnimations');
    if (album) {
      const inAlbum = await MediaLibrary.getAssetsAsync({
        album,
        mediaType: 'video',
        first: 600,
      });
      const exact = inAlbum.assets.find(a => a.filename === fileName);
      if (exact) return exact;
    }

    const all = await MediaLibrary.getAssetsAsync({
      mediaType: 'video',
      first: 1000,
    });
    return all.assets.find(a => a.filename === fileName) ?? null;
  }, [fileName]);

  const refreshFromGallery = useCallback(async () => {
    try {
      const asset = await findAssetInGalleryExact();
      if (!asset) {
        setLocalUri(null);
        return;
      }
      let info: MediaLibrary.AssetInfo | null = null;
      try { info = await MediaLibrary.getAssetInfoAsync(asset); } catch {}
      const playable = pickPlayableUri(asset, info);
      setLocalUri(playable);
    } catch {
      setLocalUri(null);
    }
  }, [findAssetInGalleryExact]);

  useEffect(() => { refreshFromGallery(); }, [refreshFromGallery]);
  useFocusEffect(useCallback(() => { refreshFromGallery(); }, [refreshFromGallery]));

  const downloadAndSaveVideo = async () => {
    setDownloading(true);
    setProgress(0);

    const downloadResumable = FileSystem.createDownloadResumable(
      videoUrl,
      tempFileUri,
      {},
      ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
        const pct = totalBytesExpectedToWrite > 0
          ? Math.round((totalBytesWritten / totalBytesExpectedToWrite) * 100)
          : 0;
        setProgress(pct);
      }
    );

    try {
      const result = await downloadResumable.downloadAsync();
      if (!result?.uri) throw new Error('Download failed');
      const tmp = result.uri;

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') throw new Error('MediaLibrary permission denied');

      // 1) Create asset (initially goes to DCIM or similar)
      let asset = await MediaLibrary.createAssetAsync(tmp);

      // 2) Ensure album and add (this may MOVE the file)
      let album = await MediaLibrary.getAlbumAsync('BatteryAnimations');
      if (!album) {
        album = await MediaLibrary.createAlbumAsync('BatteryAnimations', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      // 3) Re-find the asset by filename to get its final, post-move URI
      const refreshed = await findAssetInGalleryExact();
      if (refreshed) asset = refreshed;

      // 4) Clean temp
      try { await FileSystem.deleteAsync(tmp, { idempotent: true }); } catch {}

      // 5) Use stable content:// for playback
      let info: MediaLibrary.AssetInfo | null = null;
      try { info = await MediaLibrary.getAssetInfoAsync(asset); } catch {}
      const playable = pickPlayableUri(asset, info);
      console.log("playable:::::11111:::::", playable)
      setLocalUri(playable);

      router.push({
        pathname: '/preview/[videoUrl]',
        params: { videoUrl: encodeURIComponent(playable || '') },
      });
    } catch (err) {
      console.error('❌ Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const playVideo = () => {
    if (localUri) {
      console.log("localUri:::::222222:::", localUri)
      router.push({
        pathname: '/preview/[videoUrl]',
        params: { videoUrl: encodeURIComponent(localUri) },
      });
    } else {
      console.log('ℹ️ Not in gallery. Download required.');
    }
  };

  return { localUri, downloading, progress, downloadAndSaveVideo, playVideo };
}
