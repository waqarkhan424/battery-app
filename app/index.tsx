'use client';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { fetch_animation_urls } from './actions/fetch_animation_urls';

export default function Index() {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      const list = await fetch_animation_urls('animal');
      setUrls(list);
    })();
  }, []);

  return (
    <FlatList
      data={urls}
      keyExtractor={u => u}
      renderItem={({ item }) => {
        const player = useVideoPlayer(item, player => {
          player.loop = true;
          player.play();
        });
        return (
          <VideoView
            player={player}
            allowsFullscreen
            allowsPictureInPicture
            style={{ width: 300, height: 300, margin: 10 }}
          />
        );
      }}
    />
  );
}
