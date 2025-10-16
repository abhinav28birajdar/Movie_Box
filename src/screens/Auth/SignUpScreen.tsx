import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = StackScreenProps<AuthStackParamList, 'SignUp'>;

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await signUp(email, password);
      // If signup is successful and doesn't throw, navigate back to login
      navigation.navigate('Login');
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-5 bg-primary">
      <View className="w-full max-w-sm">
        <View className="items-center mb-8">
          <Image 
            source={require('../../../assets/images/logo.png')} 
            className="w-24 h-24 mb-4" 
          />
          <Text className="text-white text-3xl font-bold">Movie Box</Text>
          <Text className="text-light-300 mt-2">Create a new account</Text>
        </View>

        <View className="mb-4">
          <Text className="text-white mb-2">Email</Text>
          <TextInput
            className="w-full bg-dark-100 rounded-lg p-4 text-white"
            placeholder="Your email"
            placeholderTextColor="#9CA4AB"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <Text className="text-white mb-2">Password</Text>
          <TextInput
            className="w-full bg-dark-100 rounded-lg p-4 text-white"
            placeholder="Create password"
            placeholderTextColor="#9CA4AB"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <View className="mb-8">
          <Text className="text-white mb-2">Confirm Password</Text>
          <TextInput
            className="w-full bg-dark-100 rounded-lg p-4 text-white"
            placeholder="Confirm password"
            placeholderTextColor="#9CA4AB"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className={`w-full rounded-lg p-4 items-center ${loading ? 'bg-dark-100' : 'bg-accent'}`}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Sign Up</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-light-300">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-accent">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SignUpScreen;