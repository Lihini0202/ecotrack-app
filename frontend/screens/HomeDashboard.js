import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

const HomeDashboard = ({ navigation, route }) => {
  const user = route?.params?.user;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Welcome{user?.firstName ? `, ${user.firstName}` : ''} to EcoTrack
      </Text>

      {/* My Profile Section */}
      <TouchableOpacity style={styles.section} onPress={() => navigation.navigate('Profile')}>
        <View style={styles.iconContainer}>
          <Ionicons name="person" size={30} color="#FFFFFF" />
        </View>
        <Text style={styles.sectionTitle}>My Profile</Text>
        <Text style={styles.sectionDescription}>Edit your personal details and preferences.</Text>
      </TouchableOpacity>

      {/* Goal Tracker Section */}
      <TouchableOpacity style={styles.section} onPress={() => navigation.navigate('GoalTracker')}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="track-changes" size={30} color="#FFFFFF" />
        </View>
        <Text style={styles.sectionTitle}>Goal Tracker</Text>
        <Text style={styles.sectionDescription}>Track and set sustainability goals.</Text>
      </TouchableOpacity>

      {/* Educational Hub Section */}
      <TouchableOpacity style={styles.section} onPress={() => navigation.navigate('EducationalHub')}>
        <View style={styles.iconContainer}>
          <FontAwesome name="book" size={30} color="#FFFFFF" />
        </View>
        <Text style={styles.sectionTitle}>Educational Hub</Text>
        <Text style={styles.sectionDescription}>Learn sustainable living practices.</Text>
      </TouchableOpacity>

      {/* Virtual Coach Section */}
      <TouchableOpacity style={styles.section} onPress={() => navigation.navigate('VirtualCoach')}>
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubbles" size={30} color="#FFFFFF" />
        </View>
        <Text style={styles.sectionTitle}>Virtual Coach</Text>
        <Text style={styles.sectionDescription}>Get personalized sustainability tips.</Text>
      </TouchableOpacity>

      {/* News Feed Section */}
      <TouchableOpacity style={styles.section} onPress={() => navigation.navigate('NewsFeed')}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="newspaper" size={30} color="#FFFFFF" />
        </View>
        <Text style={styles.sectionTitle}>News Feed</Text>
        <Text style={styles.sectionDescription}>Stay updated with eco-news.</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#388E3C',
    marginBottom: 40,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#4CAF50',
    width: '100%',
    maxWidth: 350,
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    backgroundColor: '#388E3C',
    borderRadius: 50,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 15,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default HomeDashboard;
