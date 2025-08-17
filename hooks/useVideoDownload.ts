import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export function useVideoDownload(videoUrl: string) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileName = videoUrl.split('/').pop() || 'default.mp4';
  const tempFileUri = FileSystem.cacheDirectory! + fileName;
  const appDir = FileSystem.documentDirectory! + 'BatteryAnimations/';
  const appFileUri = appDir + fileName;

  const ensureAppDir = async () => {
    const dirInfo = await FileSystem.getInfoAsync(appDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
      console.log('📁 Created app directory');
    }
  };

  const checkIfVideoExists = useCallback(async () => {
    try {
      const appInfo = await FileSystem.getInfoAsync(appFileUri);
      if (appInfo.exists) {
        console.log('✅ Found video in app storage');
        setLocalUri(appFileUri);
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        const assets = await MediaLibrary.getAssetsAsync({
          mediaType: 'video',
          first: 200,
        });

        // 🔒 Exact filename match (no false positives from partial matches)
        const matched = assets.assets.find((a) => a.filename === fileName);

        if (matched) {
          const info = await MediaLibrary.getAssetInfoAsync(matched);
          if (info.localUri) {
            await FileSystem.copyAsync({ from: info.localUri, to: appFileUri });
            console.log('📀 Copied video from gallery to app storage');
            setLocalUri(appFileUri);
          }
        }
      }
    } catch (error) {
      console.error('⚠️ Error checking video:', error);
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
    console.log('⬇️ Download started:', fileName);
    setDownloading(true);
    setProgress(0);

    const downloadResumable = FileSystem.createDownloadResumable(
      videoUrl,
      tempFileUri,
      {},
      ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
        const pct = Math.round((totalBytesWritten / totalBytesExpectedToWrite) * 100);
        setProgress(pct);
      }
    );

    try {
      const result = await downloadResumable.downloadAsync();
      if (!result?.uri) throw new Error('Download failed');
      const downloadedUri = result.uri;

      await ensureAppDir();
      await FileSystem.copyAsync({ from: downloadedUri, to: appFileUri });
      setLocalUri(appFileUri);
      console.log('✅ Download complete & saved:', appFileUri);

      // Optional: Add to gallery
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          const asset = await MediaLibrary.createAssetAsync(downloadedUri);
          let album = await MediaLibrary.getAlbumAsync('BatteryAnimations');
          if (!album) {
            await MediaLibrary.createAlbumAsync('BatteryAnimations', asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
          console.log('📀 Added to gallery album');
        }
      } catch (e) {
        console.warn('⚠️ Could not add to gallery:', e);
      }

      router.push({
        pathname: '/preview/[videoUrl]',
        params: { videoUrl: encodeURIComponent(appFileUri) },
      });
    } catch (err) {
      console.error('❌ Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const playVideo = () => {
    if (localUri) {
      console.log('▶️ Playing video:', localUri);
      router.push({
        pathname: '/preview/[videoUrl]',
        params: { videoUrl: encodeURIComponent(localUri) },
      });
    } else {
      console.log('ℹ️ No video found. Download required.');
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
