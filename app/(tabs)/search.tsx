import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import SearchBar from "@/components/SearchBar";
import { searchMovies } from "@/services/movieApi";
import { useRouter } from "expo-router";

const Search = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (query.trim() === '') return;
    setLoading(true);
    const movies = await searchMovies(query);
    setResults(movies);
    setLoading(false);
  };

  return (
    <View className='flex-1 bg-primary px-5'>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onPress={handleSearch}
        placeholder="Search for a movie..."
      />
      {loading ? (
        <ActivityIndicator size="large" color="#fff" className="mt-8" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/movie/${item.id}`)}>
              <View className="mb-4 p-2 bg-gray-800 rounded-lg">
                <Text className="text-white text-lg font-semibold">{item.title}</Text>
                <Text className="text-gray-400 text-sm">Rating: {item.vote_average}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <Text className="text-white text-center mt-8">No movies found.</Text>
          )}
        />
      )}
    </View>
  )
}

export default Search

const styles = StyleSheet.create({})