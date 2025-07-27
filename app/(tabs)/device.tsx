import * as Device from 'expo-device';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function DeviceInfoScreen() {
  const [info, setInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    setInfo({
      brand: Device.brand,
      manufacturer: Device.manufacturer,
      modelName: Device.modelName,
      designName: Device.designName,
      deviceName: Device.deviceName,
      osVersion: Device.osVersion,
      deviceType: Device.deviceType,
      isDevice: Device.isDevice,
      deviceYearClass: Device.deviceYearClass,
      productName: Device.productName,
      totalMemory: Device.totalMemory,
    });
  }, []);

  return (
    <ScrollView className="flex-1 bg-background p-4">
      {Object.entries(info).map(([key, value]) => (
        <View key={key} className="mb-2">
          <Text className="text-slate-400 capitalize">
            {key.replace(/([A-Z])/g, ' $1')}: <Text className="text-white">{String(value)}</Text>
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
