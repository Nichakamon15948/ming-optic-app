import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PRODUCTS_URL = 'https://raw.githubusercontent.com/Nichakamon15948/ming-optic-app/refs/heads/main/products.json';

export default function Index() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  
  const isAdmin = params.admin === 'true';
  const newProductParam = params.newProduct ? JSON.parse(decodeURIComponent(params.newProduct)) : null;
  const updatedProductParam = params.updatedProduct ? JSON.parse(decodeURIComponent(params.updatedProduct)) : null;

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(PRODUCTS_URL);
        const githubData = await response.json();
        
        let localProducts = [];
        try {
          const saved = localStorage.getItem('ming_local_products');
          if (saved) {
            localProducts = JSON.parse(saved);
          }
        } catch (e) {
          console.log("Local storage not available");
        }

        let combinedProducts = [...localProducts, ...githubData];

        if (newProductParam) {
          const exists = combinedProducts.some(item => item.id === newProductParam.id);
          if (!exists) {
            combinedProducts = [newProductParam, ...combinedProducts];
          }
        }

        if (updatedProductParam) {
          combinedProducts = combinedProducts.map(item => 
            item.id === updatedProductParam.id ? updatedProductParam : item
          );
        }

        const uniqueProducts = Array.from(new Map(combinedProducts.map(item => [item.id, item])).values());

        try {
          const customItems = uniqueProducts.filter(item => typeof item.id === 'string' || (typeof item.id === 'number' && item.id > 1000));
          localStorage.setItem('ming_local_products', JSON.stringify(customItems));
        } catch (e) {}

        setProducts(uniqueProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    }
    loadProducts();

    // โหลดจำนวนสินค้าในตะกร้ามาแสดงที่ไอคอน
    try {
      const cartSaved = localStorage.getItem('ming_cart');
      if (cartSaved) {
        const cartItems = JSON.parse(cartSaved);
        setCartCount(cartItems.length);
      }
    } catch (e) {}
  }, [params.newProduct, params.updatedProduct]);

  const [search, setSearch] = useState('');
  const filteredProducts = search === '' ? products : products.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  // ฟังก์ชันกดเพิ่มสินค้าลงตะกร้า
  const handleAddToCart = (item) => {
    try {
      const cartSaved = localStorage.getItem('ming_cart');
      let cartItems = cartSaved ? JSON.parse(cartSaved) : [];
      
      // เช็กว่ามีในตะกร้าหรือยัง
      const exists = cartItems.some(cartItem => cartItem.id === item.id);
      if (exists) {
        Alert.alert("Notice", "This item is already in your cart.");
        return;
      }

      cartItems.push(item);
      localStorage.setItem('ming_cart', JSON.stringify(cartItems));
      setCartCount(cartItems.length);
      Alert.alert("Success", "Added to cart successfully! 🛒");
    } catch (e) {
      Alert.alert("Error", "Could not add to cart.");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this product?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: () => {
          const updated = products.filter(item => item.id !== id);
          setProducts(updated);
          try {
            const customItems = updated.filter(item => typeof item.id === 'string' || (typeof item.id === 'number' && item.id > 1000));
            localStorage.setItem('ming_local_products', JSON.stringify(customItems));
          } catch (e) {}
          Alert.alert("Deleted", "Product has been removed successfully.");
        } 
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.welcomeText}>Welcome to Ming Optic</Text>
          <Text style={styles.slogan}>"Your Vision, Our Passion"</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* ปุ่มตะกร้าสินค้า (โชว์ตลอดเวลา) */}
          <Pressable style={styles.cartBtn} onPress={() => router.push('/cart')}>
            <Text style={styles.cartBtnText}>🛒 Cart ({cartCount})</Text>
          </Pressable>

          {!isAdmin ? (
            <Pressable style={styles.adminLoginBtn} onPress={() => router.push('/login')}>
              <Text style={styles.adminLoginText}>🔐 Admin Login</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.adminLogoutBtn} onPress={() => router.replace('/')}>
              <Text style={styles.adminLogoutText}>🚪 Logout</Text>
            </Pressable>
          )}
        </View>
      </View>

      {isAdmin && (
        <View style={styles.adminControlPanel}>
          <Text style={styles.adminBadge}>👑 Admin Dashboard</Text>
          <Pressable style={styles.addBtn} onPress={() => router.push('/add')}>
            <Text style={styles.btnText}>➕ Add New Product</Text>
          </Pressable>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search for your glasses..." 
          placeholderTextColor="#999"
          value={search} 
          onChangeText={setSearch} 
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text style={{color: 'white', fontWeight: '600'}}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <ScrollView style={{ flex: 1 }}>
        {filteredProducts.map((item, index) => (
          <View key={`${item.id}-${index}`} style={styles.card}>
            <Image source={{ uri: item.image || item.image_url }} style={styles.glassImage} />
            <View style={{ marginLeft: 15, flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.productIdTag}>
                ID: {String(item.id).toUpperCase().startsWith('P') ? item.id : `P${String(item.id).padStart(3, '0')}`}
              </Text>
              <Text style={styles.info}>Stock: {item.stock} units</Text>
              {item.price && <Text style={styles.price}>{item.price}</Text>}
            </View>

            {/* ถ้าไม่ใช่ Admin ให้โชว์ปุ่ม Add to Cart */}
            {!isAdmin ? (
              <TouchableOpacity style={styles.addToCartBtn} onPress={() => handleAddToCart(item)}>
                <Text style={styles.addToCartText}>+ Add to Cart</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.editBtn} 
                  onPress={() => {
                    const itemString = encodeURIComponent(JSON.stringify(item));
                    router.push(`/edit?product=${itemString}`);
                  }}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.actionTextDelete}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6F6' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F8E1E1' },
  welcomeText: { fontSize: 16, fontWeight: 'bold', color: '#B5838D' },
  slogan: { fontSize: 12, color: '#999', fontStyle: 'italic', marginTop: 2 },
  
  cartBtn: { backgroundColor: '#FFF0F0', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#B5838D' },
  cartBtnText: { color: '#B5838D', fontWeight: '600', fontSize: 13 },

  adminLoginBtn: { backgroundColor: '#B5838D', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  adminLoginText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  adminLogoutBtn: { backgroundColor: '#EF4444', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  adminLogoutText: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  
  adminControlPanel: { backgroundColor: '#FFF0F0', padding: 15, marginHorizontal: 20, marginTop: 15, borderRadius: 16, borderWidth: 1, borderColor: '#F8E1E1', alignSelf: 'center', width: '90%', maxWidth: 800, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  adminBadge: { fontSize: 14, fontWeight: 'bold', color: '#B5838D' },
  addBtn: { backgroundColor: '#10B981', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  searchContainer: { flexDirection: 'row', padding: 20, alignItems: 'center', maxWidth: 800, alignSelf: 'center', width: '100%' },
  searchInput: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 25, elevation: 2, borderWidth: 1, borderColor: '#F8E1E1' },
  searchButton: { padding: 12, backgroundColor: '#B5838D', borderRadius: 25, marginLeft: 10, paddingHorizontal: 25 },
  
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, marginHorizontal: 20, marginBottom: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F8E1E1', maxWidth: 800, alignSelf: 'center', width: '90%' },
  glassImage: { width: 65, height: 65, borderRadius: 12, backgroundColor: '#eee' },
  name: { fontSize: 16, fontWeight: '600', color: '#4A4A4A' },
  productIdTag: { color: '#A1A1AA', fontSize: 11, fontWeight: '500', marginTop: 2, backgroundColor: '#F4F4F5', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  info: { color: '#999', fontSize: 12, marginTop: 4 },
  price: { color: '#B5838D', fontWeight: 'bold', marginTop: 3 },

  addToCartBtn: { backgroundColor: '#B5838D', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  addToCartText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  actionRow: { flexDirection: 'row', gap: 8, marginLeft: 10 },
  editBtn: { backgroundColor: '#FEF3C7', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#F59E0B' },
  deleteBtn: { backgroundColor: '#FEE2E2', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444' },
  actionText: { color: '#D97706', fontWeight: 'bold', fontSize: 13 },
  actionTextDelete: { color: '#DC2626', fontWeight: 'bold', fontSize: 13 }
});