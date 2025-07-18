import { ResizeMode, Video } from 'expo-av';
import { useRef } from 'react';
import { View } from 'react-native';

type Props = {
    url: string;
};

export default function VideoCard({ url }: Props) {
    const videoRef = useRef(null);

    return (
        <View className="w-32 h-40 rounded-lg overflow-hidden bg-black mr-3">
            <Video
                ref={videoRef}
                source={{ uri: url }}
                style={{ width: '100%', height: '100%' }}
                resizeMode={ResizeMode.COVER}
                isLooping
                shouldPlay
                useNativeControls={false}
            />
        </View>
    );
}
