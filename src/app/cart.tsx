import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ming_cart');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch (e) {
      console.log("Error loading cart");
    }
  }, []);

  const handleRemoveFromCart = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    try {
      localStorage.setItem('ming_cart', JSON.stringify(updatedCart));
    } catch (e) {}
    Alert.alert("Removed", "Item removed from cart.");
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Cart is empty", "Please add some items before checkout.");
      return;
    }
    Alert.alert("Success 🎉", "Order placed successfully! Thank you for shopping with Ming Optic.");
    setCartItems([]);
    try {
      localStorage.removeItem('ming_cart');
    } catch (e) {}
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>🛒 Your Shopping Cart</Text>
        <Pressable onPress={() => router.replace('/')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>⬅️ Back to Home</Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your cart is currently empty 👓</Text>
          </View>
        ) : (
          cartItems.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.card}>
              <Image source={{ uri: item.image || item.image_url }} style={styles.glassImage} />
              <View style={{ marginLeft: 15, flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{item.price}</Text>
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemoveFromCart(item.id)}>
                <Text style={styles.actionTextDelete}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Proceed to Checkout ({cartItems.length} items)</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6F6' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F8E1E1' },
  appTitle: { fontSize: 18, fontWeight: 'bold', color: '#B5838D' },
  backBtn: { backgroundColor: '#F3F4F6', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15 },
  backBtnText: { color: '#4A4A4A', fontSize: 12, fontWeight: '600' },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#999' },

  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, marginBottom: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F8E1E1', maxWidth: 800, alignSelf: 'center', width: '100%' },
  glassImage: { width: 65, height: 65, borderRadius: 12, backgroundColor: '#eee' },
  name: { fontSize: 16, fontWeight: '600', color: '#4A4A4A' },
  price: { color: '#B5838D', fontWeight: 'bold', marginTop: 3 },

  deleteBtn: { backgroundColor: '#FEE2E2', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444' },
  actionTextDelete: { color: '#DC2626', fontWeight: 'bold', fontSize: 13 },

  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F8E1E1', alignItems: 'center' },
  checkoutBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 15, width: '100%', maxWidth: 600, alignItems: 'center' },
  checkoutText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});