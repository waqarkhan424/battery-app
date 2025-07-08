import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Battery from 'expo-battery';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export default function BatteryScreen() {
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

    const scale = useSharedValue(1);

    useEffect(() => {
        const animate = () => {
            scale.value = withRepeat(
                withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
        };
        animate();
    }, []);

    useEffect(() => {
        (async () => {
            const level = await Battery.getBatteryLevelAsync();
            setBatteryLevel(Math.round(level * 100));
        })();
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <ThemedView style={styles.container}>
            <Animated.View style={[styles.batteryIcon, animatedStyle]} />
            <ThemedText style={styles.text}>Battery Level: {batteryLevel !== null ? `${batteryLevel}%` : 'Loading...'}</ThemedText>
            <ThemedText>This is your charging animation screen!</ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    batteryIcon: {
        width: 100,
        height: 200,
        backgroundColor: '#0a7ea4',
        borderRadius: 20,
        marginBottom: 20,
    },
    text: {
        fontSize: 18,
    },
});
