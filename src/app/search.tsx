import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <Text style={styles.title}>Search Glasses</Text>
      <View style={styles.searchBox}>
        <TextInput 
          style={styles.input} 
          placeholder="Type glasses name (e.g., Vintage)..." 
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity style={styles.btn}><Text style={{color: '#FFF'}}>Search</Text></TouchableOpacity>
      </View>
      <Text style={{marginTop: 20, color: '#888'}}>* Type to search through our real-time database.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6F6', padding: 20, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 50, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#B5838D', marginBottom: 20 },
  searchBox: { flexDirection: 'row', width: '100%', maxWidth: 500 },
  input: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 25, borderWidth: 1, borderColor: '#F8E1E1' },
  btn: { backgroundColor: '#B5838D', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 25, marginLeft: 10 }
});