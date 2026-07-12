import { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function Index() {
  const [products] = useState([
    { id: '1', name: 'Vintage Sunglasses', stock: '12', price: '฿1,200', image: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQ6a0QF-oqnS3BAXYST2SsTWzFk8zyNoaQvd4dFgx-EvZURp_koMRTzfF3GZ3blAgjgQ5Z5uUJFYTzbZV9heu0itsnmrWBA4ExLyFc4vt1qcYS4fRJcwvX1mbNxKZ9QTfTP4Sod8Xg&usqp=CAc' },
    { id: '2', name: 'Titanium Eyeglasses', stock: '5', price: '฿6,650', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwuADm05QBrUk2Bnqrdb_330B_x9JGfdvA2jO-4zIggA&s=10' },
    { id: '3', name: 'Blue Light Glasses', stock: '20', price: '฿890', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShI-Ru471Ttu3Tb1RnyproXG1vMUrESmAdDEwEapzwSQ&s=10' },
  ]);

  const [search, setSearch] = useState('');
  const filteredProducts = search === '' ? products : products.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* ส่วนสโลแกนร้าน ใต้แถบ Header ของระบบ */}
      <View style={styles.header}>
        <Text style={styles.slogan}>"Your Vision, Our Passion"</Text>
      </View>

      {/* ช่องค้นหาสินค้า */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search for your glasses..." 
          value={search}
          onChangeText={setSearch} 
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text style={{color: 'white', fontWeight: '600'}}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* รายการสินค้า 3 ชิ้น */}
      <ScrollView style={{ flex: 1 }}>
        {filteredProducts.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.glassImage} />
            <View style={{ marginLeft: 15, flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.info}>Stock: {item.stock} units</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6F6' },
  header: { paddingBottom: 15, paddingTop: 5, backgroundColor: '#FFF', alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 4 },
  slogan: { fontSize: 13, color: '#999', fontStyle: 'italic' },
  searchContainer: { flexDirection: 'row', padding: 20, alignItems: 'center', maxWidth: 800, alignSelf: 'center', width: '100%' },
  searchInput: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 25, elevation: 2, borderWidth: 1, borderColor: '#F8E1E1' },
  searchButton: { padding: 12, backgroundColor: '#B5838D', borderRadius: 25, marginLeft: 10, paddingHorizontal: 25 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 20, marginHorizontal: 20, marginBottom: 15, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#F8E1E1', maxWidth: 800, alignSelf: 'center', width: '90%' },
  glassImage: { width: 70, height: 70, borderRadius: 15, backgroundColor: '#eee' },
  name: { fontSize: 16, fontWeight: '500', color: '#4A4A4A' },
  info: { color: '#999', fontSize: 12, marginTop: 5 },
  price: { color: '#B5838D', fontWeight: 'bold', marginTop: 5 },
});