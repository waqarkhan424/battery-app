import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

type Props = {
    url: string;
};

export default function VideoCard({ url }: Props) {
    const ref = useRef<VideoView>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const player = useVideoPlayer({ uri: url }, (p) => {
        p.loop = true;
        p.play(); // Autoplay when loaded
    });

    useEffect(() => {
        const sub = player.addListener('playingChange', (payload) => {
            setIsPlaying(payload.isPlaying);
        });
        return () => sub.remove();
    }, [player]);

    return (
        <View className="w-32 h-40 rounded-lg overflow-hidden bg-black mr-3">
            <VideoView
                ref={ref}
                className="w-full h-full"
                player={player}
                contentFit="cover"
                nativeControls={false}
            />
        </View>
    );
}
