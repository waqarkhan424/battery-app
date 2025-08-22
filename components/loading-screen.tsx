import { ActivityIndicator, Image, Text, View } from 'react-native';

export default function LoadingScreen() {
  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: '#0B0820' }} // match styles.xml splash color
    >
      {/* Centered app logo */}
      <Image
        source={require('../assets/logo.png')}
        style={{ width: 120, height: 120, marginBottom: 16 }}
        resizeMode="contain"
      />

      {/* Real loading spinner */}
      <ActivityIndicator size="large" />

      {/* App name under the spinner */}
      <Text className="mt-3 text-base" style={{ color: 'white' }}>
        Charging Animation
      </Text>
    </View>
  );
}
