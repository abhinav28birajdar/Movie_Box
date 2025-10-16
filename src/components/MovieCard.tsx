import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { TMDB_IMAGE_BASE_URL } from '../utils/constants';

interface MovieCardProps {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
  onPress: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ id, title, poster_path, release_date, vote_average, onPress }) => {
  const imageUrl = poster_path ? `${TMDB_IMAGE_BASE_URL}${poster_path}` : 'https://via.placeholder.com/150x225?text=No+Image';

  return (
    <TouchableOpacity className="bg-dark-200 rounded-lg overflow-hidden shadow-md mb-4" onPress={onPress}>
      <View className="flex-row">
        <Image source={{ uri: imageUrl }} className="w-24 h-36" />
        <View className="flex-1 p-3 justify-center">
          <Text className="font-bold text-white text-lg mb-1" numberOfLines={2}>{title}</Text>
          {release_date && <Text className="text-light-300 text-sm">Released: {release_date.substring(0, 4)}</Text>}
          {vote_average !== undefined && <Text className="text-light-300 text-sm">Rating: {vote_average.toFixed(1)}/10</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MovieCard;