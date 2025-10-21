import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AuthService from '@/services/authService';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await AuthService.signIn(formData.email, formData.password);

      if (error) {
        Alert.alert('Login Error', error.message);
      } else {
        // Navigate to main app
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-black"
    >
      <ScrollView className="flex-1 px-6">
        <View className="flex-1 justify-center py-12">
          <View className="mb-8">
            <Text className="text-4xl font-bold text-white text-center mb-2">
              Welcome Back
            </Text>
            <Text className="text-gray-400 text-center text-base">
              Sign in to your Movie Box account
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-white text-base mb-2">Email</Text>
              <TextInput
                className="bg-gray-800 text-white px-4 py-3 rounded-lg text-base"
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className="text-white text-base mb-2">Password</Text>
              <TextInput
                className="bg-gray-800 text-white px-4 py-3 rounded-lg text-base"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            className="mt-2 self-end"
            onPress={() => router.push('/auth/forgot-password')}
          >
            <Text className="text-red-500 text-sm">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`mt-8 py-4 rounded-lg ${loading ? 'bg-gray-600' : 'bg-red-600'}`}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-400">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text className="text-red-500 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}