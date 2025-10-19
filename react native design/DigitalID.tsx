import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// Digital ID component - shows QR code, user's name and position, and an optional photo.
// Copy-paste ready. If you don't have `react-native-qrcode-svg`, you can replace the QR component with an Image of a generated QR.

type Props = {
  userId: string | number;
  name: string;
  position?: string;
  photo?: any; // image source
};

export default function DigitalID({ userId, name, position, photo }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {photo ? <Image source={photo} style={styles.photo} /> : <View style={styles.photoPlaceholder}><Text style={styles.photoInitial}>{name ? name.charAt(0) : 'U'}</Text></View>}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.position}>{position || 'Professor'}</Text>
        </View>
      </View>

      <View style={styles.qrWrap}>
        <QRCode value={String(userId)} size={140} />
      </View>

      <Text style={styles.idText}>ID: {userId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    width: 320,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  photoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e6f4f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  photoInitial: {
    fontSize: 22,
    color: '#0ea5a4',
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  position: {
    color: '#475569',
    marginTop: 4,
  },
  qrWrap: {
    marginTop: 18,
    alignItems: 'center',
  },
  idText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#64748b',
  },
});
