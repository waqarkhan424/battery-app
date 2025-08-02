import { useVideoDownload } from '@/hooks/useVideoDownload';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';

type Props = {
  video: {
    id?: string | number;
    url: string;
    thumbnail: string;
  };
  styleClass?: string;
};

export default function VideoItemCard({ video, styleClass }: Props) {
  const {
    localUri,
    downloading,
    progress,
    downloadAndSaveVideo,
    playVideo,
  } = useVideoDownload(video.url);

  const handlePress = () => {
    if (localUri) {
      playVideo();
    } else {
      downloadAndSaveVideo();
    }
  };

  return (
    <Pressable onPress={handlePress} className={styleClass}>
      <Image
        source={{ uri: video.thumbnail }}
        style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
        resizeMode="cover"
      />
      <View className="absolute bottom-2 left-0 right-0 px-2 flex-row justify-between items-center">
        {downloading ? (
          <>
            <Text className="text-white text-xs">{progress}%</Text>
            <ActivityIndicator size="small" color="white" />
          </>
        ) : (
          !localUri && (
            <View className="w-full items-end">
              <Ionicons
                name="cloud-download-outline"
                size={20}
                color="white"
                style={{ opacity: 0.8 }}
              />
            </View>
          )
        )}
      </View>
    </Pressable>
  );
}
