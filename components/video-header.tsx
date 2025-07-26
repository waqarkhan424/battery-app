import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function VideoHeader() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );

      setCurrentDate(
        now.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000;

    const timeout = setTimeout(() => {
      updateTime();
      const interval = setInterval(updateTime, 60000);
      return () => clearInterval(interval);
    }, msToNextMinute);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View className="absolute top-10 left-0 right-0 items-center z-10">
      <Text className="text-white text-4xl font-bold">{currentTime}</Text>
      <Text className="text-white text-base">{currentDate}</Text>
    </View>
  );
}
