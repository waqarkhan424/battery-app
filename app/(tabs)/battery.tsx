import { BatteryState, useBatteryLevel, useBatteryState, useLowPowerMode } from 'expo-battery';
import { ScrollView, Text, View } from 'react-native';

export default function BatteryScreen() {
  const batteryLevel = useBatteryLevel();
  const batteryState = useBatteryState();
  const lowPowerMode = useLowPowerMode();

  const getBatteryStateLabel = (state: BatteryState | null) => {
    switch (state) {
      case BatteryState.CHARGING:
        return 'Charging';
      case BatteryState.FULL:
        return 'Full';
      case BatteryState.UNPLUGGED:
        return 'Unplugged';
      case BatteryState.UNKNOWN:
        return 'Unknown';
      default:
        return 'Unknown';
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="mb-3">
        <Text className="text-slate-400">
          Battery Level:{' '}
          <Text className="text-white">{batteryLevel !== null ? `${Math.round(batteryLevel * 100)}%` : 'Unknown'}</Text>
        </Text>
      </View>

      <View className="mb-3">
        <Text className="text-slate-400">
          Charging State:{' '}
          <Text className="text-white">{getBatteryStateLabel(batteryState)}</Text>
        </Text>
      </View>

      <View className="mb-3">
        <Text className="text-slate-400">
          Low Power Mode:{' '}
          <Text className="text-white">{lowPowerMode ? 'Enabled' : 'Disabled'}</Text>
        </Text>
      </View>
    </ScrollView>
  );
}
