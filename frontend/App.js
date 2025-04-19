import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import WelcomeScreen from './screens/WelcomeScreen';
import AuthScreen from './screens/AuthScreen';
import HomeDashboard from './screens/HomeDashboard';
import GoalTracker from './screens/GoalTracker';
import EducationalHub from './screens/EducationalHub';
import VirtualCoach from './screens/VirtualCoach';
import NewsFeed from './screens/NewsFeed';
import NewsScreen from './screens/NewsScreen';
import VideosScreen from './screens/VideosScreen';

// ✅ Import these
import Profile from './screens/Profile';
import EditProfile from './screens/EditProfile';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AuthScreen" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeDashboard} options={{ title: 'EcoTrack Dashboard', headerStyle: { backgroundColor: '#388E3C' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="Profile" component={Profile} options={{ title: 'My Profile', headerStyle: { backgroundColor: '#388E3C' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="GoalTracker" component={GoalTracker} options={{ title: 'Goal Tracker', headerStyle: { backgroundColor: '#388E3C' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="EducationalHub" component={EducationalHub} options={{ title: 'Educational Hub', headerStyle: { backgroundColor: '#388E3C' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="VirtualCoach" component={VirtualCoach} options={{ title: 'Virtual Coach', headerStyle: { backgroundColor: '#388E3C' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="NewsFeed" component={NewsFeed} options={{ title: 'News Feed', headerStyle: { backgroundColor: '#388E3C' }, headerTintColor: '#fff' }} />
        <Stack.Screen name="NewsScreen" component={NewsScreen} options={{ title: 'News' }} />
        <Stack.Screen name="VideosScreen" component={VideosScreen} options={{ title: 'Videos' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
