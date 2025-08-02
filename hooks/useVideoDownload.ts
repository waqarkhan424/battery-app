import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

export function useVideoDownload(videoUrl: string) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileName = videoUrl.split('/').pop()!;
  const tempFileUri = `${FileSystem.cacheDirectory}${fileName}`;

  useEffect(() => {
    const checkIfVideoExists = async () => {
      try {
        const permissions = await MediaLibrary.requestPermissionsAsync();
        if (permissions.status !== 'granted') return;

        const album = await MediaLibrary.getAlbumAsync('BatteryAnimations');
        if (!album) return;

        const assets = await MediaLibrary.getAssetsAsync({
          mediaType: 'video',
          first: 1000,
          album,
        });

        const matched = assets.assets?.find((a) => a.filename === fileName);
        if (matched) {
          setLocalUri(matched.uri);
        }
      } catch (error) {
        console.error('Error checking video in gallery:', error);
      }
    };

    checkIfVideoExists();
  }, [videoUrl]);

  const downloadAndSaveVideo = async () => {
    setDownloading(true);
    setProgress(0);

    const downloadResumable = FileSystem.createDownloadResumable(
      videoUrl,
      tempFileUri,
      {},
      (downloadProgress) => {
        const percent =
          downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite;
        setProgress(Math.round(percent * 100));
      }
    );

    try {
      const result = await downloadResumable.downloadAsync();
      if (!result?.uri) throw new Error('Download failed');

      const asset = await MediaLibrary.createAssetAsync(result.uri);
      let album = await MediaLibrary.getAlbumAsync('BatteryAnimations');

      if (!album) {
        album = await MediaLibrary.createAlbumAsync('BatteryAnimations', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      await new Promise((res) => setTimeout(res, 500));

      const refreshedAssets = await MediaLibrary.getAssetsAsync({
        mediaType: 'video',
        first: 1000,
        album,
      });

      const updatedAsset = refreshedAssets.assets.find((a) => a.filename === fileName);
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
