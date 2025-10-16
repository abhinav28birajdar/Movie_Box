import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { router } from 'expo-router';
import AuthService from '../../services/authService';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = await AuthService.register({
        name,
        email,
        password,
        confirmPassword
      });
      
      if (result.success) {
        Alert.alert('Success', result.message, [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignIn = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="flex-1 bg-black"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo */}
          <View className="items-center mb-8">
            <Image 
              source={require('../../assets/images/logo.png')}
              className="w-20 h-20 mb-4"
              resizeMode="contain"
            />
            <Text className="text-white text-3xl font-bold">Movie Box</Text>
            <Text className="text-gray-400 text-lg mt-2">Create your account</Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-white text-sm font-medium mb-2">Full Name</Text>
              <TextInput
                className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500"
                placeholder="Enter your full name"
                placeholderTextColor="#6B7280"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View>
              <Text className="text-white text-sm font-medium mb-2">Email</Text>
              <TextInput
                className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500"
                placeholder="Enter your email"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View>
              <Text className="text-white text-sm font-medium mb-2">Password</Text>
              <View className="relative">
                <TextInput
                  className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 pr-12"
                  placeholder="Enter your password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  className="absolute right-4 top-3"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text className="text-blue-500 text-sm">
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-white text-sm font-medium mb-2">Confirm Password</Text>
              <View className="relative">
                <TextInput
                  className="bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 pr-12"
                  placeholder="Confirm your password"
                  placeholderTextColor="#6B7280"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  className="absolute right-4 top-3"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text className="text-blue-500 text-sm">
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className={`bg-blue-600 py-3 rounded-lg mt-6 ${isLoading ? 'opacity-50' : ''}`}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text className="text-white text-center text-lg font-semibold">
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View className="mt-6">
            <Text className="text-gray-400 text-sm text-center">
              By signing up, you agree to our{' '}
              <Text className="text-blue-500">Terms of Service</Text>
              {' '}and{' '}
              <Text className="text-blue-500">Privacy Policy</Text>
            </Text>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-gray-700" />
            <Text className="text-gray-400 px-4">or</Text>
            <View className="flex-1 h-px bg-gray-700" />
          </View>

          {/* Social Sign Up */}
          <View className="space-y-3">
            <TouchableOpacity className="bg-gray-800 py-3 rounded-lg border border-gray-700">
              <Text className="text-white text-center font-medium">Continue with Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-gray-800 py-3 rounded-lg border border-gray-700">
              <Text className="text-white text-center font-medium">Continue with Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-400">Already have an account? </Text>
            <TouchableOpacity onPress={navigateToSignIn}>
              <Text className="text-blue-500 font-medium">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}