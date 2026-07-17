import { useEffect, useState } from 'react';
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

// ลิงก์ Raw URL จาก GitHub 
const PRODUCTS_URL = 'https://raw.githubusercontent.com/Nichakamon15948/ming-optic-app/refs/heads/main/products.json';

export default function Index() {
  // เปลี่ยนจากฝังข้อมูล เป็นกล่องว่างๆ รอรับจาก GitHub
  const [products, setProducts] = useState([]);

  // ดึงข้อมูลจาก GitHub ทันทีที่เปิดแอป
  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(PRODUCTS_URL);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    }
    
    loadProducts();
  }, []);

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

      {/* รายการสินค้า 3 ชิ้น (อิงตามตัวแปรเดิมของแกเป๊ะ!) */}
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