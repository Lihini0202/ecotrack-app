import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import axios from 'axios';

const EditProfile = ({ route, navigation }) => {
  const { user } = route.params;
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);

  const handleUpdate = async () => {
    await axios.put(`http://192.168.56.1:5000/api/profile/${user._id}`, {
      email, username
    });
    navigation.goBack();
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <Button title="Save Changes" onPress={handleUpdate} />
    </View>
  );
};

export default EditProfile;
