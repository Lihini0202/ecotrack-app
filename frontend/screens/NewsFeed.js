import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";

// Import your sub-screens
import NewsScreen from './NewsScreen';
import VideosScreen from './VideosScreen';


const Stack = createStackNavigator();

const NewsFeedHome = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const scaleValue1 = new Animated.Value(1);
  const scaleValue2 = new Animated.Value(1);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const handlePressIn = (scaleValue) => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (scaleValue) => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* News Card */}
      <TouchableOpacity
        onPressIn={() => handlePressIn(scaleValue1)}
        onPressOut={() => handlePressOut(scaleValue1)}
        onPress={() => navigation.navigate("NewsScreen")}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.card, { transform: [{ scale: scaleValue1 }] }]}>
          <FontAwesome name="newspaper-o" size={48} color="#2e7d32" />
          <Text style={styles.text}>News</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Videos Card */}
      <TouchableOpacity
        onPressIn={() => handlePressIn(scaleValue2)}
        onPressOut={() => handlePressOut(scaleValue2)}
        onPress={() => navigation.navigate("VideosScreen")}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.card, { transform: [{ scale: scaleValue2 }] }]}>
          <FontAwesome name="video-camera" size={48} color="#2e7d32" />
          <Text style={styles.text}>Videos</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

// Nested navigator
const NewsFeed = () => {
  return (
    <Stack.Navigator initialRouteName="NewsFeedHome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NewsFeedHome" component={NewsFeedHome} />
      <Stack.Screen name="NewsScreen" component={NewsScreen} />
      <Stack.Screen name="VideosScreen" component={VideosScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2e7d32",
    padding: 20,
  },
  card: {
    width: 250,
    height: 150,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    padding: 20,
  },
  text: {
    color: "#2e7d32",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    fontFamily: "Poppins-SemiBold",
  },
});

export default NewsFeed;
