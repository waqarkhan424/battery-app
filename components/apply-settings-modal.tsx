import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
};

export default function ApplySettingsModal({ visible, onClose, onApply }: Props) {
  const [duration, setDuration] = useState('1 minute');
  const [closeMethod, setCloseMethod] = useState('Single Tap To Hide');

  const [showDurationOptions, setShowDurationOptions] = useState(false);
  const [showCloseOptions, setShowCloseOptions] = useState(false);

  if (!visible) return null;

  return (
    <View className="absolute bottom-24 left-4 right-4 bg-slate-800 rounded-3xl p-6 z-30">
      <Text className="text-white text-xl font-bold text-center mb-4">Apply Settings</Text>

      <Text className="text-white mb-2">Please select animation time duration</Text>

      {/* Duration Dropdown */}
      <View className="bg-slate-700 rounded-lg mb-4">
        <Pressable
          onPress={() => setShowDurationOptions(!showDurationOptions)}
          className="px-4 py-3 flex-row justify-between items-center"
        >
          <Text className="text-white">{duration}</Text>
          <Ionicons
            name={showDurationOptions ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="white"
          />
        </Pressable>
        {showDurationOptions && (
          <View className="border-t border-slate-600 px-4 pb-2">
            {['10 seconds', '30 seconds', '1 minute', 'Always']
              .filter((option) => option !== duration)
              .map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    setDuration(option);
                    setShowDurationOptions(false);
                  }}
                >
                  <Text className="text-slate-300 py-1">{option}</Text>
                </Pressable>
              ))}
          </View>
        )}
      </View>

      <Text className="text-white mb-2">Closing Method</Text>

      {/* Close Method Dropdown */}
      <View className="bg-slate-700 rounded-lg mb-4">
        <Pressable
          onPress={() => setShowCloseOptions(!showCloseOptions)}
          className="px-4 py-3 flex-row justify-between items-center"
        >
          <Text className="text-white">{closeMethod}</Text>
          <Ionicons
            name={showCloseOptions ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="white"
          />
        </Pressable>
        {showCloseOptions && (
          <View className="border-t border-slate-600 px-4 pb-2">
            {['Single Tap To Hide', 'Double Tap To Hide']
              .filter((option) => option !== closeMethod)
              .map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    setCloseMethod(option);
                    setShowCloseOptions(false);
                  }}
                >
                  <Text className="text-slate-300 py-1">{option}</Text>
                </Pressable>
              ))}
          </View>
        )}
      </View>

      {/* Buttons */}
      <View className="flex-row justify-between">
        <Pressable
          onPress={onClose}
          className="bg-slate-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">No</Text>
        </Pressable>

        <Pressable
          onPress={onApply}
          className="bg-cyan-400 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Apply</Text>
        </Pressable>
      </View>
    </View>
  );
}
