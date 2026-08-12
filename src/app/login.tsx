import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_BASE_URL } from '../constants/api';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        try {
            // แก้ไขเส้นทางให้วิ่งมาที่เซิร์ฟเวอร์ในเครื่องเราที่พอร์ต 3000
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                // ส่งพารามิเตอร์ admin=true กลับไปที่หน้า Home
                router.replace('/?admin=true'); 
            } else {
                Alert.alert('Error', 'Invalid username or password.');
            }
        } catch (error) {
            Alert.alert('Error', 'Cannot connect to server.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.header}>🔐 Admin Login</Text>
                
                <TextInput 
                    style={styles.input} 
                    placeholder="Username" 
                    placeholderTextColor="#9CA3AF"
                    value={username} 
                    onChangeText={setUsername} 
                    autoCapitalize="none" 
                />
                
                <TextInput 
                    style={styles.input} 
                    placeholder="Password" 
                    placeholderTextColor="#9CA3AF"
                    value={password} 
                    onChangeText={setPassword} 
                    secureTextEntry 
                />

                <Pressable style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </Pressable>

                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Back to Home</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FDF6F6' },
    card: { width: '100%', maxWidth: 400, backgroundColor: '#ffffff', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#F8E1E1', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, textAlign: 'center', color: '#B5838D' },
    input: { backgroundColor: '#FFF9F9', borderWidth: 1, borderColor: '#F8E1E1', padding: 12, marginBottom: 15, borderRadius: 12, fontSize: 16, color: '#4A4A4A' },
    button: { backgroundColor: '#B5838D', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 5 },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    backButton: { marginTop: 15, alignItems: 'center' },
    backButtonText: { color: '#999', fontSize: 14 }
});