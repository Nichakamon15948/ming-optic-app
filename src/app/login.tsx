import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_BASE_URL } from '../constants/api';

const C = {
  bg: '#0F172A', surface: '#1E293B', surface2: '#263548',
  border: '#334155', gold: '#C9A84C', text: '#F1F5F9', textMuted: '#94A3B8',
};

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        if (data.token) {
          try {
            localStorage.setItem('admin_token', data.token);
          } catch (e) {
            console.log('localStorage error:', e);
          }
        }
        router.replace('/?admin=true');
      } else {
        Alert.alert('Login Failed', 'Invalid username or password.');
      }
    } catch (error) {
      Alert.alert('Error', 'Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background decoration */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.card}>
        {/* Logo */}
        <Text style={styles.logoText}>MING OPTIC</Text>
        <Text style={styles.logoSub}>Admin Portal</Text>

        <View style={styles.divider} />

        <Text style={styles.title}>🔐 Sign In</Text>
        <Text style={styles.subtitle}>Enter your credentials to access the admin panel</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter username"
          placeholderTextColor={C.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor={C.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginBtnText}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </Text>
        </Pressable>

        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back to Store</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: C.bg,
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  bgCircle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(201,168,76,0.06)', top: -80, right: -80,
  },
  bgCircle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(201,168,76,0.04)', bottom: 60, left: -60,
  },
  card: {
    width: '100%', maxWidth: 400,
    backgroundColor: C.surface,
    padding: 32, borderRadius: 20,
    borderWidth: 1, borderColor: C.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  logoText: {
    fontSize: 22, fontWeight: '900', color: C.gold,
    letterSpacing: 4, textAlign: 'center',
  },
  logoSub: { color: C.textMuted, fontSize: 12, textAlign: 'center', marginTop: 4, letterSpacing: 2 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 24 },
  title: { color: C.text, fontSize: 22, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: C.textMuted, fontSize: 13, marginBottom: 24, lineHeight: 18 },
  label: { color: C.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
    padding: 13, borderRadius: 10, fontSize: 15, color: C.text,
    outlineStyle: 'none',
  },
  loginBtn: {
    backgroundColor: C.gold, padding: 15, borderRadius: 12,
    alignItems: 'center', marginTop: 28,
  },
  loginBtnDisabled: { backgroundColor: '#5a4a1e' },
  loginBtnText: { color: '#0F172A', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
  backBtn: { alignItems: 'center', marginTop: 16, padding: 8 },
  backBtnText: { color: C.textMuted, fontSize: 14 },
});