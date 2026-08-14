import { StyleSheet, Text, View } from 'react-native';

export default function ProductsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stock Inventory</Text>
      <View style={styles.card}>
        <Text style={styles.item}>Vintage Sunglasses: 12 units</Text>
        <Text style={styles.item}>Titanium Eyeglasses: 5 units</Text>
        <Text style={styles.item}>Blue Light Glasses: 20 units</Text>
      </View>
      <Text style={[styles.title, {fontSize: 18, marginTop: 20}]}>Total Stock: 37 units</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#C9A84C', marginBottom: 15 },
  card: { backgroundColor: '#1E293B', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#334155', width: '100%', maxWidth: 400 },
  item: { fontSize: 16, color: '#F1F5F9', marginVertical: 8, fontWeight: '500' }
});