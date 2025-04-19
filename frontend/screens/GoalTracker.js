import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const topics = [
  {
    id: 'travel',
    title: 'Sustainable Travel',
    icon: 'bicycle',
    question: 'How did you travel today?',
    options: [
      { name: 'Walk', icon: 'walking' },
      { name: 'Bus', icon: 'bus' },
      { name: 'Car', icon: 'car' },
      { name: 'Train', icon: 'train' },
      { name: 'Bicycle', icon: 'bicycle' },
    ],
  },
  {
    id: 'energy',
    title: 'Energy Conservation',
    icon: 'lightbulb',
    question: 'What did you do to conserve energy today?',
    options: [
      { name: 'Turned off lights', icon: 'lightbulb' },
      { name: 'Used renewable energy', icon: 'solar-panel' },
      { name: 'Unplugged devices', icon: 'plug' },
      { name: 'Reduced AC usage', icon: 'snowflake' },
    ],
  },
  {
    id: 'waste',
    title: 'Waste Reduction',
    icon: 'recycle',
    question: 'What did you do to reduce waste today?',
    options: [
      { name: 'Recycled', icon: 'recycle' },
      { name: 'Composted', icon: 'leaf' },
      { name: 'Used reusable bags', icon: 'shopping-bag' },
      { name: 'Avoided single-use plastics', icon: 'trash' },
    ],
  },
  {
    id: 'water',
    title: 'Water Conservation',
    icon: 'tint',
    question: 'What did you do to save water today?',
    options: [
      { name: 'Shorter showers', icon: 'shower' },
      { name: 'Fixed leaks', icon: 'wrench' },
      { name: 'Used a water-efficient appliance', icon: 'tint' },
      { name: 'Collected rainwater', icon: 'cloud-rain' },
    ],
  },
  {
    id: 'food',
    title: 'Sustainable Food',
    icon: 'utensils',
    question: 'What did you do to eat sustainably today?',
    options: [
      { name: 'Ate plant-based meals', icon: 'leaf' },
      { name: 'Reduced food waste', icon: 'trash-restore' },
      { name: 'Bought local produce', icon: 'shopping-basket' },
      { name: 'Composted food scraps', icon: 'recycle' },
    ],
  },
  {
    id: 'shopping',
    title: 'Eco-Friendly Shopping',
    icon: 'shopping-cart',
    question: 'What did you do to shop sustainably today?',
    options: [
      { name: 'Bought second-hand', icon: 'tshirt' },
      { name: 'Used reusable bags', icon: 'shopping-bag' },
      { name: 'Avoided plastic packaging', icon: 'box' },
      { name: 'Supported eco-friendly brands', icon: 'heart' },
    ],
  },
];

const GoalTracker = () => {
  const [activities, setActivities] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStoredActivities();
  }, []);

  const loadStoredActivities = async () => {
    try {
      const stored = await AsyncStorage.getItem('activities');
      if (stored) setActivities(JSON.parse(stored));
    } catch (err) {
      console.error('Failed to load activities:', err);
    }
  };

  const storeActivities = async (newActivities) => {
    try {
      await AsyncStorage.setItem('activities', JSON.stringify(newActivities));
    } catch (err) {
      console.error('Failed to save activities:', err);
    }
  };

  const logActivity = async () => {
    if (selectedTopic && selectedOption) {
      const newActivity = {
        id: Date.now(),
        topic: selectedTopic.title,
        action: selectedOption.name,
        date: new Date().toLocaleDateString(),
      };

      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('authToken');

        if (!token) {
          Alert.alert('Error', 'No token found. Please log in.');
          return;
        }

        const response = await fetch('http://192.168.56.1:5000/api/goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token, // ✅ FIXED HERE
          },
          body: JSON.stringify({
            topic: newActivity.topic,
            action: newActivity.action,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to log activity');
        }

        const data = await response.json();
        console.log('Activity logged successfully:', data);

        const updatedActivities = [...activities, newActivity];
        setActivities(updatedActivities);
        await storeActivities(updatedActivities);

        setSelectedTopic(null);
        setSelectedOption(null);
      } catch (error) {
        console.error('Error logging activity:', error);
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const calculateProgress = () => Math.min((activities.length / 10) * 100, 100);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌍 Eco Tracker</Text>
      <Text style={styles.description}>
        Track your eco-friendly actions and contribute to a greener planet!
      </Text>

      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Your Monthly Progress</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${calculateProgress()}%` }]} />
        </View>
        <Text style={styles.progressText}>{calculateProgress().toFixed(0)}% Goal Achieved</Text>
      </View>

      <View style={styles.topicContainer}>
        <Text style={styles.subTitle}>Choose a Topic</Text>
        <View style={styles.topicButtons}>
          {topics.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={[
                styles.topicButton,
                selectedTopic?.id === topic.id && styles.selectedTopic,
              ]}
              onPress={() => {
                setSelectedTopic(topic);
                setSelectedOption(null);
              }}
            >
              <FontAwesome5 name={topic.icon} size={24} color="#4CAF50" />
              <Text style={styles.topicText}>{topic.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {selectedTopic && (
        <View style={styles.optionsContainer}>
          <Text style={styles.questionText}>{selectedTopic.question}</Text>
          <View style={styles.optionButtons}>
            {selectedTopic.options.map((option) => (
              <TouchableOpacity
                key={option.name}
                style={[
                  styles.optionButton,
                  selectedOption?.name === option.name && styles.selectedOption,
                ]}
                onPress={() => setSelectedOption(option)}
              >
                <FontAwesome5 name={option.icon} size={24} color="#4CAF50" />
                <Text style={styles.optionText}>{option.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[
              styles.logButton,
              (!selectedOption || loading) && { backgroundColor: '#A5D6A7' },
            ]}
            onPress={logActivity}
            disabled={!selectedOption || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.logButtonText}>Log Activity</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.activityLog}>
        <Text style={styles.activityLogTitle}>Activity Log</Text>
        {activities.length === 0 ? (
          <Text style={styles.noActivitiesText}>No activities logged yet.</Text>
        ) : (
          activities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <FontAwesome5
                name={topics.find((t) => t.title === activity.topic)?.icon || 'leaf'}
                size={20}
                color="#4CAF50"
              />
              <Text style={styles.activityText}>
                {activity.date}: {activity.topic} - {activity.action}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  progressContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 10,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#C8E6C9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#388E3C',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 10,
    textAlign: 'center',
  },
  topicContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 10,
    textAlign: 'center',
  },
  topicButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topicButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    backgroundColor: '#F1F8E9',
    width: '48%',
    marginBottom: 10,
  },
  selectedTopic: {
    borderColor: '#388E3C',
    backgroundColor: '#DCEDC8',
  },
  topicText: {
    fontSize: 14,
    color: '#388E3C',
    marginTop: 5,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  questionText: {
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    backgroundColor: '#F1F8E9',
    width: '48%',
    marginBottom: 10,
  },
  selectedOption: {
    borderColor: '#388E3C',
    backgroundColor: '#DCEDC8',
  },
  optionText: {
    fontSize: 14,
    color: '#388E3C',
    marginTop: 5,
    textAlign: 'center',
  },
  logButton: {
    backgroundColor: '#388E3C',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityLog: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  activityLogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 10,
  },
  noActivitiesText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
});

export default GoalTracker;
