import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export function useVideoDownload(videoUrl: string) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileName = videoUrl.split('/').pop()!;
  const tempFileUri = `${FileSystem.cacheDirectory}${fileName}`;

  // Extracted so we can call it from both useEffect and on focus
  const checkIfVideoExists = useCallback(async () => {
    try {
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
        setLocalUri(matched.uri);
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
      const downloadResult = await downloadResumable.downloadAsync();
      // Narrow the union: ensure uri exists
      if (!downloadResult?.uri) {
        throw new Error('Download failed');
      }
      const downloadedUri = downloadResult.uri;

      const asset = await MediaLibrary.createAssetAsync(downloadedUri);
      let album = await MediaLibrary.getAlbumAsync('BatteryAnimations');

      if (!album) {
        album = await MediaLibrary.createAlbumAsync(
          'BatteryAnimations',
          asset,
          false
        );
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      // Wait a moment for the gallery index to update
      await new Promise(res => setTimeout(res, 500));

      const refreshed = await MediaLibrary.getAssetsAsync({
        mediaType: 'video',
        first: 1000,
        album,
      });
      const updatedAsset = refreshed.assets.find(a => a.filename === fileName);
      if (updatedAsset) {
        setLocalUri(updatedAsset.uri);
        router.push({
          pathname: '/video-player/[videoUrl]',
          params: { videoUrl: encodeURIComponent(updatedAsset.uri) },
        });
      }
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
