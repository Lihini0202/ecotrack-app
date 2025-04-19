import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Importing icons from Expo

const WelcomeScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const scaleValue = new Animated.Value(1);
  const fadeAnim = new Animated.Value(1);

  const handlePress = () => {
    setIsLoading(true);
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        navigation.navigate('AuthScreen');
        setIsLoading(false);
      }, 1500);
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Added a leaf icon for a nature-themed app */}
        <Ionicons name="leaf" size={80} color="white" style={styles.icon} />
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.brand}>EcoTrack</Text>
        <Text style={styles.subtitle}>Sustainable Living Companion</Text>
      </Animated.View>

      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity 
          onPress={handlePress}
          style={styles.button}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Get Started</Text>
              {/* Added a chevron-forward icon to the button */}
              <Ionicons name="chevron-forward" size={24} color="white" style={styles.buttonIcon} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
    backgroundColor: '#66BB6A', // Lighter green background
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20, // Space below the icon
  },
  title: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.9)', // Brighter white text
    fontFamily: 'Poppins-SemiBold', // Bold font
    fontWeight: '600', // Ensure boldness
  },
  brand: {
    fontSize: 42,
    color: 'white',
    fontFamily: 'Poppins-Bold', // Bold font
    fontWeight: '700', // Ensure boldness
    marginVertical: 10,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)', // Brighter white text
    fontFamily: 'Poppins-SemiBold', // Bold font
    fontWeight: '600', // Ensure boldness
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold', // Bold font
    fontWeight: '600', // Ensure boldness
    letterSpacing: 1,
  },
  buttonIcon: {
    marginLeft: 10, // Space between text and icon
  },
});

export default WelcomeScreen;