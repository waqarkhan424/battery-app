import * as Device from 'expo-device';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

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
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-cyan-400 text-2xl font-bold mb-4">📱 Android Device Info</Text>
      {Object.entries(info).map(([label, value]) => (
        <View key={label} className="mb-2">
          <Text className="text-slate-400">
            {label}: <Text className="text-white">{value}</Text>
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
