import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const C = {
  bg: '#0F172A', surface: '#1E293B', surface2: '#263548',
  border: '#334155', gold: '#C9A84C', goldLight: '#E2C97E',
  text: '#F1F5F9', textMuted: '#94A3B8', green: '#10B981', red: '#EF4444',
};

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ming_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        const normalized = parsed.map(item => ({
          ...item,
          quantity: item.quantity && item.quantity > 0 ? item.quantity : 1
        }));
        setCartItems(normalized);
      }
    } catch (e) { console.log('Error loading cart:', e); }
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    try { localStorage.setItem('ming_cart', JSON.stringify(items)); } catch (e) {}
  };

  const handleIncrease = (id) => {
    const updated = cartItems.map(item => {
      if (item.id === id) {
        const maxStock = Number(item.stock) || 99;
        if (item.quantity >= maxStock) {
          Alert.alert('Stock Limit', `Only ${maxStock} unit(s) available.`);
          return item;
        }
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    saveCart(updated);
  };

  const handleDecrease = (id) => {
    const target = cartItems.find(item => item.id === id);
    if (!target) return;
    if (target.quantity <= 1) {
      saveCart(cartItems.filter(item => item.id !== id));
    } else {
      saveCart(cartItems.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item));
    }
  };

  const handleRemove = (id) => saveCart(cartItems.filter(item => item.id !== id));

  const getUnitPrice = (item) => {
    const raw = String(item.price).replace(/[^0-9]/g, '');
    return Number(raw);
  };

  const calculateTotal = () =>
    cartItems.reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0);

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) { Alert.alert('Empty Cart', 'Please add items first.'); return; }
    Alert.alert(
      '✓ Order Confirmed',
      `Total: ฿${calculateTotal().toLocaleString()}\n\nThank you for shopping with Ming Optic!`
    );
    saveCart([]);
    router.replace(`/?refresh=${Date.now()}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>MING OPTIC</Text>
        <View style={styles.topRight}>
          <Text style={styles.topTitle}>Shopping Cart</Text>
          <Pressable style={styles.backBtn} onPress={() => router.replace('/')}>
            <Text style={styles.backBtnText}>← Continue Shopping</Text>
          </Pressable>
        </View>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Discover our premium eyewear collection</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace('/')}>
            <Text style={styles.shopBtnText}>Browse Collection →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Cart Items */}
            <View style={styles.itemsSection}>
              <Text style={styles.sectionLabel}>
                {totalQuantity} item{totalQuantity !== 1 ? 's' : ''} in your cart
              </Text>
              {cartItems.map((item, index) => {
                const itemTotal = getUnitPrice(item) * item.quantity;
                return (
                  <View key={`${item.id}-${index}`} style={styles.cartCard}>
                    <Image source={{ uri: item.img || item.image || item.image_url }} style={styles.itemImage} />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={2}>{item.productname || item.name}</Text>
                      <Text style={styles.unitPrice}>{item.price} / unit</Text>
                      {/* Qty controls */}
                      <View style={styles.qtyRow}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => handleDecrease(item.id)}>
                          <Text style={styles.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyNum}>{item.quantity}</Text>
                        <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnPlus]} onPress={() => handleIncrease(item.id)}>
                          <Text style={[styles.qtyBtnText, { color: '#0F172A' }]}>+</Text>
                        </TouchableOpacity>
                        <Text style={styles.itemTotal}>฿{itemTotal.toLocaleString()}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)}>
                      <Text style={styles.removeBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Order Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items ({totalQuantity})</Text>
                <Text style={styles.summaryValue}>฿{calculateTotal().toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={[styles.summaryValue, { color: C.green }]}>Free</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>฿{calculateTotal().toLocaleString()}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
                <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0B1628', paddingHorizontal: 24, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  logo: { fontSize: 16, fontWeight: '900', color: C.gold, letterSpacing: 3 },
  topRight: { alignItems: 'flex-end', gap: 4 },
  topTitle: { color: C.text, fontSize: 15, fontWeight: '700' },
  backBtn: {
    backgroundColor: C.surface2, paddingVertical: 5,
    paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: C.border,
  },
  backBtnText: { color: C.textMuted, fontSize: 12, fontWeight: '600' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { color: C.text, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  emptySub: { color: C.textMuted, fontSize: 14, marginBottom: 28, textAlign: 'center' },
  shopBtn: { backgroundColor: C.gold, paddingVertical: 13, paddingHorizontal: 30, borderRadius: 12 },
  shopBtnText: { color: '#0F172A', fontWeight: '900', fontSize: 15 },

  content: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: 20, gap: 20,
    maxWidth: 1000, alignSelf: 'center', width: '100%',
  },
  itemsSection: { flex: 2, minWidth: 300 },
  sectionLabel: { color: C.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 14, letterSpacing: 0.5 },

  cartCard: {
    flexDirection: 'row', backgroundColor: C.surface,
    borderRadius: 14, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: C.border, alignItems: 'center',
  },
  itemImage: { width: 70, height: 70, borderRadius: 10, backgroundColor: C.surface2 },
  itemInfo: { flex: 1, marginHorizontal: 14 },
  itemName: { color: C.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  unitPrice: { color: C.textMuted, fontSize: 12, marginBottom: 10 },

  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnPlus: { backgroundColor: C.gold, borderColor: C.gold },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: C.text },
  qtyNum: { color: C.text, fontSize: 16, fontWeight: '800', minWidth: 26, textAlign: 'center' },
  itemTotal: { color: C.gold, fontWeight: '800', fontSize: 14, marginLeft: 4 },

  removeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#3b0f0f', borderWidth: 1, borderColor: '#7f1d1d',
    alignItems: 'center', justifyContent: 'center',
  },
  removeBtnText: { color: '#f87171', fontSize: 12, fontWeight: '700' },

  summaryCard: {
    flex: 1, minWidth: 260, maxWidth: 360,
    backgroundColor: C.surface, borderRadius: 16,
    padding: 24, borderWidth: 1, borderColor: C.border,
    alignSelf: 'flex-start',
  },
  summaryTitle: { color: C.text, fontSize: 17, fontWeight: '800', marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { color: C.textMuted, fontSize: 14 },
  summaryValue: { color: C.text, fontWeight: '600', fontSize: 14 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 14 },
  totalLabel: { color: C.text, fontSize: 17, fontWeight: '800' },
  totalValue: { color: C.gold, fontSize: 22, fontWeight: '900' },
  checkoutBtn: {
    backgroundColor: C.gold, padding: 15, borderRadius: 12,
    alignItems: 'center', marginTop: 20,
  },
  checkoutBtnText: { color: '#0F172A', fontWeight: '900', fontSize: 15 },
});