import { Ionicons } from '@expo/vector-icons';
import * as Device from 'expo-device';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeviceInfoScreen() {
  const [info, setInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    setInfo({
      'Brand': Device.brand ?? 'N/A',
      'Manufacturer': Device.manufacturer ?? 'N/A',
      'Model Name': Device.modelName ?? 'N/A',
      'Design Name': Device.designName ?? 'N/A',
      'Device Name': Device.deviceName ?? 'N/A',
      'OS Version': Device.osVersion ?? 'N/A',
      'Device Type': String(Device.deviceType ?? 'N/A'),
      'Is Physical Device': Device.isDevice ? 'Yes' : 'No',
      'Device Year': Device.deviceYearClass?.toString() ?? 'N/A',
      'Product Name': Device.productName ?? 'N/A',
      'Total RAM': Device.totalMemory
        ? `${(Device.totalMemory / 1_000_000_000).toFixed(2)} GB`
        : 'N/A',
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="flex-col gap-4">
          {Object.entries(info).map(([label, value], index) => (
            <View
              key={index}
              className="w-full bg-surface p-4 rounded-2xl shadow-md"
            >
              <View className="mb-2 flex-row items-center gap-2">
                <Ionicons name="hardware-chip-outline" size={20} color="#94a3b8" />
                <Text className="text-secondary text-sm">{label}</Text>
              </View>
              <Text className="text-white text-lg font-semibold">{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
