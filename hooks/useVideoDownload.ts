import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

/**
 * We persist a copy under FileSystem.documentDirectory ("file://")
 * to avoid flaky content:// URIs after process death.
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

      // Optional: look in gallery and offer play if found (we’ll still copy)
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
        await ensureAppDir();
        // Copy out to our sandbox to get a stable file:// path
        try {
          await FileSystem.copyAsync({ from: matched.uri, to: appFileUri });
          setLocalUri(appFileUri);
        } catch {
          // Fallback to the original uri if copy fails (still works while app is alive)
          setLocalUri(matched.uri);
        }
      }
    } catch (error) {
      console.error('Error checking video in gallery:', error);
    }
  }, [fileName]);

  // Initial check on mount
  useEffect(() => {
    checkIfVideoExists();
  }, [checkIfVideoExists]);

  // Re-run check whenever this screen regains focus
  useFocusEffect(
    useCallback(() => {
      checkIfVideoExists();
    }, [checkIfVideoExists])
  );

  const downloadAndSaveVideo = async () => {
    setDownloading(true);
    setProgress(0);

    try {
      const resumable = FileSystem.createDownloadResumable(
        videoUrl,
        tempFileUri,
        {},
        (dp) => {
          const pct = dp.totalBytesWritten / (dp.totalBytesExpectedToWrite || 1);
          setProgress(Math.max(0, Math.min(100, Math.round(pct * 100))));
        }
      );

      const result = await resumable.downloadAsync();
      if (!result?.uri) throw new Error('Download failed');

      // Save to gallery (optional nice-to-have)
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        let album = await MediaLibrary.getAlbumAsync('BatteryAnimations');
        if (!album) {
          album = await MediaLibrary.createAlbumAsync(
            'BatteryAnimations',
            await MediaLibrary.createAssetAsync(result.uri),
            false
          );
        } else {
          const asset = await MediaLibrary.createAssetAsync(result.uri);
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
      }

      // Copy into our sandbox for a stable file:// path
      await ensureAppDir();
      await FileSystem.copyAsync({ from: result.uri, to: appFileUri });
      setLocalUri(appFileUri);
    } catch (e) {
      console.error('Download error', e);
    } finally {
      setDownloading(false);
    }
  };

  const playVideo = () => {
    if (!localUri) return;
    router.push({
      pathname: '/video-player/[videoUrl]',
      params: { videoUrl: encodeURIComponent(localUri) },
    });
  };

  return {
    localUri,
    downloading,
    progress,
    downloadAndSaveVideo,
    playVideo,
  };
}
