import { Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
    BatteryState,
    useBatteryLevel,
    useBatteryState,
    useLowPowerMode,
} from 'expo-battery';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        return 'Discharging';
      case BatteryState.UNKNOWN:
        return 'Unknown';
      default:
        return 'Unknown';
    }
  };

  const infoCards = [
    {
      icon: <MaterialCommunityIcons name="battery" size={24} color="#38bdf8" />,
      label: 'Level',
      value:
        batteryLevel !== null
          ? `${Math.round(batteryLevel * 100)}%`
          : 'Unknown',
    },
    {
      icon: <Entypo name="flash" size={24} color="#facc15" />,
      label: 'State',
      value: getBatteryStateLabel(batteryState),
    },
    {
      icon: <Ionicons name="battery-charging-outline" size={24} color="#10b981" />,
      label: 'Low Power',
      value: lowPowerMode ? 'Enabled' : 'Disabled',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="flex-col gap-4">
          {infoCards.map((card, index) => (
            <View
              key={index}
              className="w-full bg-surface p-4 rounded-2xl shadow-md"
            >
              <View className="mb-2">{card.icon}</View>
              <Text className="text-secondary text-sm">{card.label}</Text>
              <Text className="text-white text-lg font-semibold">{card.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
