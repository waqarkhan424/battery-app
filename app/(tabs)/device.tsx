import * as Device from 'expo-device';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatDeviceType(t: Device.DeviceType | null | undefined) {
  switch (t) {
    case Device.DeviceType.PHONE:
      return 'Phone';
    case Device.DeviceType.TABLET:
      return 'Tablet';
    case Device.DeviceType.DESKTOP:
      return 'Desktop';
    case Device.DeviceType.TV:
      return 'TV';
    default:
      return 'Unknown';
  }
}

export default function DeviceInfoScreen() {
  const [info, setInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    setInfo({
      Brand: Device.brand ?? 'N/A',
      Manufacturer: Device.manufacturer ?? 'N/A',
      'Model Name': Device.modelName ?? 'N/A',
      'Design Name': Device.designName ?? 'N/A',
      'Device Name': Device.deviceName ?? 'N/A',
      'OS Version': Device.osVersion ?? 'N/A',
      'Device Type': formatDeviceType(Device.deviceType),
      'Is Physical Device': Device.isDevice ? 'Yes' : 'No',
      'Device Year': Device.deviceYearClass?.toString() ?? 'N/A',
      'Product Name': Device.productName ?? 'N/A',
      'Total RAM': Device.totalMemory
        ? `${(Device.totalMemory / 1_000_000_000).toFixed(2)} GB`
        : 'N/A',
    });
  }, []);

  const entries = Object.entries(info);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Simple header */}
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">Your Device</Text>
        <Text className="text-secondary mt-1">
          Basic information about your phone
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Minimalist list with separators */}
        <View className="mx-4 border border-slate-800/60 rounded-xl overflow-hidden">
          {entries.map(([label, value], idx) => (
            <View
              key={label}
              className={`flex-row items-start justify-between px-4 py-3 ${
                idx < entries.length - 1 ? 'border-b border-slate-800/60' : ''
              }`}
            >
              <Text className="text-secondary text-sm">{label}</Text>
              <Text className="text-white text-base font-medium max-w-[60%] text-right">
                {value}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
