import { useSettingsStore } from '@/store/settings';
import * as Battery from 'expo-battery';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function ChargingListener() {
  const { enableAnimations, appliedAnimation } = useSettingsStore();
  console.log("enableAnimations::::::::::", enableAnimations)
  console.log("appliedAnimation:::::::::::::", appliedAnimation)

  useEffect(() => {
    const subscription = Battery.addBatteryStateListener(({ batteryState }) => {
      console.log("subscription::::::::::::", subscription)
      if (
        batteryState === Battery.BatteryState.CHARGING &&
        enableAnimations &&
        appliedAnimation
      ) {
        router.push({
          pathname: '/video-player/[videoUrl]',
          params: { videoUrl: encodeURIComponent(appliedAnimation) },
        });
      }
    });

    return () => subscription.remove();
  }, [appliedAnimation, enableAnimations]);

  return null;
}
