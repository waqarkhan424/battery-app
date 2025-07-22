import { useEvent } from 'expo';
import { useVideoPlayer, VideoSource, VideoView } from 'expo-video';
import { View } from 'react-native';

type Props = { url: string };

export default function VideoCard({ url }: Props) {
    const player = useVideoPlayer(
        url as VideoSource,
        player => {
            player.loop = true;
            player.muted = true;
            player.play();
        }
    );

    // Correct payload usage via useEvent
    const { isPlaying } = useEvent(
        player,
        'playingChange',
        { isPlaying: player.playing }
    );

    return (
        <View className="w-32 h-40 rounded-lg overflow-hidden bg-black mr-3">
            <VideoView
                player={player}
                className="w-full h-full"
                contentFit="cover"
                allowsFullscreen={false}
                allowsPictureInPicture={false}
            />
        </View>
    );
}
