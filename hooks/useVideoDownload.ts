import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

/**
 * We persist a copy under FileSystem.documentDirectory ("file://").
 * This avoids flaky content:// URIs after process death.
 */
export function useVideoDownload(videoUrl: string) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileName = videoUrl.split('/').pop()!;
  const tempFileUri = `${FileSystem.cacheDirectory}${fileName}`;
  const appDir = `${FileSystem.documentDirectory}videos/`;
  const appFileUri = `${appDir}${fileName}`;

  const ensureAppDir = async () => {
    try {
      const info = await FileSystem.getInfoAsync(appDir);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
      }
    } catch {}
  };

  const checkIfVideoExists = useCallback(async () => {
    try {
      // Prefer our sandbox copy if present
      const appInfo = await FileSystem.getInfoAsync(appFileUri);
      if (appInfo.exists) {
        setLocalUri(appFileUri);
        return;
      }

      // Optional: look in gallery and offer play if found (but we’ll still copy)
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return;

      const album = await MediaLibrary.getAlbumAsync('BatteryAnimations');
      if (!album) return;

      const assets = await MediaLibrary.getAssetsAsync({
        mediaType: 'video',
        first: 1000,
        album,
      });

      const matched = assets.assets.find(a => a.filename === fileName);
      if (matched) {
        // Copy out to our sandbox to get a stable file:// path
        await ensureAppDir();
        // Some assets expose content://; copyAsync can ingest via its localUri
        const info = await MediaLibrary.getAssetInfoAsync(matched);
        if (info.localUri) {
          await FileSystem.copyAsync({ from: info.localUri, to: appFileUri });
          setLocalUri(appFileUri);
        }
      }
    } catch (error) {
      console.error('Error checking video:', error);
    }
  }, [fileName, appFileUri]);

  useEffect(() => {
    checkIfVideoExists();
  }, [checkIfVideoExists]);

  useFocusEffect(
    useCallback(() => {
      checkIfVideoExists();
    }, [checkIfVideoExists])
  );

  const downloadAndSaveVideo = async () => {
    setDownloading(true);
    setProgress(0);

    const downloadResumable = FileSystem.createDownloadResumable(
      videoUrl,
      tempFileUri,
      {},
      ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
        const pct = totalBytesWritten / totalBytesExpectedToWrite;
        setProgress(Math.round(pct * 100));
      }
    );

    try {
      const result = await downloadResumable.downloadAsync();
      if (!result?.uri) throw new Error('Download failed');
      const downloadedUri = result.uri;

      // 1) Copy to our sandbox path (stable file://)
      await ensureAppDir();
      await FileSystem.copyAsync({ from: downloadedUri, to: appFileUri });
      setLocalUri(appFileUri);

      // 2) (Optional) Add to gallery album for visibility
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          const asset = await MediaLibrary.createAssetAsync(downloadedUri);
          let album = await MediaLibrary.getAlbumAsync('BatteryAnimations');
          if (!album) {
            album = await MediaLibrary.createAlbumAsync('BatteryAnimations', asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
        }
      } catch (e) {
        // Gallery add is best-effort
        console.warn('Could not add to gallery:', e);
      }

      // Go to player with the sandbox file://
      router.push({
        pathname: '/video-player/[videoUrl]',
        params: { videoUrl: encodeURIComponent(appFileUri) },
      });
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const playVideo = () => {
    if (localUri) {
      router.push({
        pathname: '/video-player/[videoUrl]',
        params: { videoUrl: encodeURIComponent(localUri) },
      });
    }
  };

  return {
    localUri,
    downloading,
    progress,
    downloadAndSaveVideo,
    playVideo,
  };
}
