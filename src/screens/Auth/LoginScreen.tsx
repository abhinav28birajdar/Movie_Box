import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../../auth/AuthContext';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      await signIn(email, password);
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
          <Text className="text-light-300 mt-2">Sign in to your account</Text>
        </View>

        <View className="mb-6">
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

        <View className="mb-8">
          <Text className="text-white mb-2">Password</Text>
          <TextInput
            className="w-full bg-dark-100 rounded-lg p-4 text-white"
            placeholder="Your password"
            placeholderTextColor="#9CA4AB"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className={`w-full rounded-lg p-4 items-center ${loading ? 'bg-dark-100' : 'bg-accent'}`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Sign In</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-light-300">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text className="text-accent">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;