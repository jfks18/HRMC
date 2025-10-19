import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

// A simple, copy-paste-ready React Native login screen component.
// No external UI libraries required. Replace "onLogin" with your auth logic.

type Props = {
  onLogin?: (email: string, password: string) => void;
  logo?: any; // optional logo source
};

export default function Login({ onLogin, logo }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (onLogin) onLogin(email.trim(), password);
    // otherwise, you can add navigation logic here
  };

  return (
    <View style={styles.container}>
      {logo ? <Image source={logo} style={styles.logo} resizeMode="contain" /> : null}
      <Text style={styles.title}>Welcome Back</Text>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="name@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCompleteType="email"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Forgot your password?</Text>
        <Text style={styles.smallText}>•</Text>
        <Text style={styles.footerText}>Contact support</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f7fafc',
  },
  logo: {
    width: 120,
    height: 60,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#0f172a',
  },
  inputWrapper: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    color: '#0f172a',
  },
  button: {
    height: 48,
    backgroundColor: '#0ea5a4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#475569',
    fontSize: 13,
  },
  smallText: {
    marginHorizontal: 8,
    color: '#94a3b8',
  },
});
