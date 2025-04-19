import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';

const API_KEY = 'AIzaSyCVUulfmiJxNidKgK0vNiYNw1CiHvJVMNc'; 
const SEARCH_QUERY = 'eco friendly';

const VideosScreen = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=${encodeURIComponent(
            SEARCH_QUERY
          )}&part=snippet&type=video&order=date&maxResults=10`
        );
        const data = await response.json();
        console.log('YouTube API Data:', data);
        setVideos(data.items);
      } catch (error) {
        console.error('Error fetching YouTube videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#2e7d32" />;
  }

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id.videoId}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${item.id.videoId}`)}>
          <View style={styles.card}>
            <Image source={{ uri: item.snippet.thumbnails.medium.url }} style={styles.image} />
            <Text style={styles.title}>{item.snippet.title}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 4,
  },
  image: {
    height: 200,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default VideosScreen;
