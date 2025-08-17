import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export function useVideoDownload(videoUrl: string) {
  const [localUri, setLocalUri] = useState<string | null>(null); // content://… when available
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  // keep the original filename from the URL (fallback safe)
  const fileName = videoUrl.split('/').pop() || 'default.mp4';
  const tempFileUri = (FileSystem.cacheDirectory ?? '') + fileName;

  // Build a playable URI safely: prefer AssetInfo.localUri, fallback to asset.uri (content://)
  const pickPlayableUri = (asset: MediaLibrary.Asset | null, info?: MediaLibrary.AssetInfo | null) => {
    return info?.localUri || asset?.uri || null;
  };

  // Find an exact filename match in the gallery (album first, then global)
  const findAssetInGalleryExact = useCallback(async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') return null;

    // 1) Try our album first (faster)
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

    // 2) Fallback: search all videos
    const all = await MediaLibrary.getAssetsAsync({
      mediaType: 'video',
      first: 1000,
    });
    return all.assets.find(a => a.filename === fileName) ?? null;
  }, [fileName]);

  // Refresh localUri from gallery (single source of truth)
  const refreshFromGallery = useCallback(async () => {
    try {
      const asset = await findAssetInGalleryExact();
      if (!asset) {
        setLocalUri(null); // not in gallery → must download
        return;
      }
      let info: MediaLibrary.AssetInfo | null = null;
      try { info = await MediaLibrary.getAssetInfoAsync(asset); } catch {}
      const playable = pickPlayableUri(asset, info);
      setLocalUri(playable);
    } catch (e) {
      setLocalUri(null);
    }
  }, [findAssetInGalleryExact]);

  // On mount / URL change
  useEffect(() => {
    refreshFromGallery();
  }, [refreshFromGallery]);

  // Also on screen focus (covers deletion while app is backgrounded)
  useFocusEffect(
    useCallback(() => {
      refreshFromGallery();
    }, [refreshFromGallery])
  );

  // Download → cache → create gallery asset → add to album → play from gallery
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

      // Create an asset from the temp file
      const asset = await MediaLibrary.createAssetAsync(tmp);

      // Ensure album exists, then add the asset
      let album = await MediaLibrary.getAlbumAsync('BatteryAnimations');
      if (!album) {
        album = await MediaLibrary.createAlbumAsync('BatteryAnimations', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      // Clean up temp (gallery now owns the data)
      try { await FileSystem.deleteAsync(tmp, { idempotent: true }); } catch {}

      // Update playable URI from gallery
      let info: MediaLibrary.AssetInfo | null = null;
      try { info = await MediaLibrary.getAssetInfoAsync(asset); } catch {}
      const playable = pickPlayableUri(asset, info);
      console.log("playable::::::::::::", playable)
      setLocalUri(playable);

      // Navigate to preview with content://
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
      console.log("localUri::::::::::", localUri)
      router.push({
        pathname: '/preview/[videoUrl]',
        params: { videoUrl: encodeURIComponent(localUri) },
      });
    } else {
      console.log('ℹ️ Not in gallery. Download required.');
    }
  };

  return {
    localUri,           // null means "show Download" in your UI
    downloading,
    progress,
    downloadAndSaveVideo,
    playVideo,
  };
}
