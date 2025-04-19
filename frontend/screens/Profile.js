import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const navigation = useNavigation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      const res = await axios.get(`http://192.168.56.1:5000/api/profile/${userId}`, {
        headers: { 'x-auth-token': token }
      });

      setProfile(res.data);
      setFirstName(res.data.user?.firstName || '');
      setLastName(res.data.user?.lastName || '');
      setPhone(res.data.user?.phone || '');
      setAddress(res.data.user?.address || '');
      setLoading(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to load profile');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      await axios.put(`http://192.168.56.1:5000/api/profile/${userId}`, {
        firstName,
        lastName,
        phone,
        address
      });
      Alert.alert('Success', 'Profile updated!');
      fetchProfile();
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleDelete = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      await axios.delete(`http://192.168.56.1:5000/api/profile/${userId}`);
      await AsyncStorage.clear();
      Alert.alert('Account Deleted', 'Your profile has been deleted.');
      navigation.replace('AuthScreen');
    } catch (err) {
      Alert.alert('Error', 'Failed to delete account');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('AuthScreen');
  };

  if (loading) return <ActivityIndicator size="large" color="#00f" />;
  if (!profile) return <Text>No profile found.</Text>;

  const { goals, quizScores, activity } = profile;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>👤 My Profile</Text>

      <Text style={styles.label}>First Name</Text>
      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

      <Text style={styles.label}>Last Name</Text>
      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#eee' }]}
        value={profile.user.email}
        editable={false}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} />

      <Text style={styles.label}>Address</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} />

      <View style={styles.buttonGroup}>
        <Button title="Update Profile" color="#2196F3" onPress={handleUpdate} />
        <View style={{ height: 10 }} />
        <Button title="Delete Account" color="#d32f2f" onPress={handleDelete} />
        <View style={{ height: 10 }} />
        <Button title="Logout" color="#757575" onPress={handleLogout} />
      </View>

      <Text style={styles.sectionTitle}>🎯 Goals</Text>
      {Array.isArray(goals) && goals.length ? (
        goals.map((goal, idx) => (
          <Text key={idx} style={styles.listItem}>
            - {goal.topic}: {goal.action}
          </Text>
        ))
      ) : (
        <Text style={styles.noData}>No goals found.</Text>
      )}

      <Text style={styles.sectionTitle}>📊 Quiz Scores</Text>
      {Array.isArray(quizScores) && quizScores.length ? (
        quizScores.map((quiz, idx) => (
          <Text key={idx} style={styles.listItem}>
            {new Date(quiz.date).toDateString()}: {quiz.score}/{quiz.totalQuestions}
          </Text>
        ))
      ) : (
        <Text style={styles.noData}>No quiz scores yet.</Text>
      )}

      <Text style={styles.sectionTitle}>📅 Activities</Text>
      {Array.isArray(activity?.activities) && activity.activities.length ? (
        activity.activities.map((act, idx) => (
          <Text key={idx} style={styles.listItem}>
            {new Date(act.date).toDateString()} - {act.action}
          </Text>
        ))
      ) : (
        <Text style={styles.noData}>No activity records.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
    color: '#4caf50'
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 15
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 10,
    color: '#333'
  },
  listItem: {
    fontSize: 15,
    marginBottom: 5
  },
  noData: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666'
  },
  buttonGroup: {
    marginTop: 10,
    marginBottom: 30
  }
});

export default Profile;
