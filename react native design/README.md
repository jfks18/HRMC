React Native design components

Files:
- Login.tsx: Simple login screen component (no external UI libs required).
- DigitalID.tsx: Digital ID card component showing a QR code (requires `react-native-qrcode-svg` or replace with an Image).

Copy-paste usage examples:

1) Login usage

import React from 'react';
import { SafeAreaView } from 'react-native';
import Login from './Login';

export default function App() {
  const handleLogin = (email: string, password: string) => {
    // Hook into your auth system here
    console.log('login', email, password);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Login onLogin={handleLogin} />
    </SafeAreaView>
  );
}

2) DigitalID usage

import React from 'react';
import { SafeAreaView } from 'react-native';
import DigitalID from './DigitalID';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
      <DigitalID userId={12345} name="Prof. Jane Doe" position="Head of Department" />
    </SafeAreaView>
  );
}

Notes
- If you can't or don't want to install `react-native-qrcode-svg`, replace the QR component with an Image component that loads a pre-generated QR code URL.
- These components are intentionally dependency-light so you can paste them into an Expo or bare React Native project.
