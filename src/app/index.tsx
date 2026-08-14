import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { API_BASE_URL } from '../constants/api';

const API_URL = `${API_BASE_URL}/products`;

export default function Index() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState('');
  const isAdmin = params.admin === 'true';

  const loadProducts = async (searchQuery = '') => {
    try {
      let url = API_URL;
      if (searchQuery) url += `?search=${searchQuery}`;
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Cannot connect to server. Make sure server.js is running.');
    }
  };

  useEffect(() => {
    loadProducts();
    try {
      const cartSaved = localStorage.getItem('ming_cart');
      const cartItems = cartSaved ? JSON.parse(cartSaved) : [];
      const totalQty = cartItems.reduce((sum, ci) => sum + (Number(ci.quantity) || 1), 0);
      setCartCount(totalQty);
    } catch (e) { setCartCount(0); }
  }, [params.newProduct, params.updatedProduct, params.admin, params.refresh]);

  const handleSearch = () => loadProducts(search);

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Enter') handleSearch();
  };

  const handleAddToCart = (item) => {
    try {
      const cartSaved = localStorage.getItem('ming_cart');
      let cartItems = cartSaved ? JSON.parse(cartSaved) : [];
      const stockNum = parseInt(String(item.stock), 10);
      const maxStock = isNaN(stockNum) ? 99 : stockNum;
      if (maxStock === 0) { Alert.alert('Out of Stock', `"${item.name}" is currently out of stock.`); return; }
      const existingIndex = cartItems.findIndex(ci => ci.id === item.id);
      if (existingIndex !== -1) {
        const currentQty = Number(cartItems[existingIndex].quantity) || 1;
        if (currentQty >= maxStock) { Alert.alert('Stock Limit Reached', `Only ${maxStock} unit(s) available.`); return; }
        cartItems[existingIndex].quantity = currentQty + 1;
        Alert.alert('Updated', `"${item.name}" qty: ${cartItems[existingIndex].quantity} 🛒`);
      } else {
        cartItems.push({ ...item, quantity: 1 });
        Alert.alert('Added to Cart', `"${item.name}" added! 🛒`);
      }
      localStorage.setItem('ming_cart', JSON.stringify(cartItems));
      setCartCount(cartItems.reduce((sum, ci) => sum + (Number(ci.quantity) || 1), 0));
    } catch (e) { Alert.alert('Error', 'Could not add to cart.'); }
  };

  const handleDelete = async (id) => {
    const confirmed = typeof window !== 'undefined' && window.confirm
      ? window.confirm('Are you sure you want to delete this product?')
      : true;
    if (!confirmed) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Deleted', 'Product removed successfully.');
        loadProducts();
      } else {
        Alert.alert('Error', data.error || 'Failed to delete.');
      }
    } catch (e) { Alert.alert('Error', 'Cannot connect to server.'); }
  };

  const formatId = (id) => {
    const s = String(id).toUpperCase();
    return s.startsWith('P') ? s : `P${String(id).padStart(3, '0')}`;
  };

  // Responsive card width
  const getCardWidth = () => {
    if (isMobile) return '100%';
    if (width < 1024) return '48%';
    return '31%';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* ── NAV BAR ── */}
      <View style={[styles.navbar, isMobile && styles.navbarMobile]}>
        {/* Top row: Logo + Actions */}
        <View style={styles.navTopRow}>
          <Text style={[styles.logo, isMobile && styles.logoMobile]}>MING OPTIC</Text>
          <View style={styles.navActions}>
            <Pressable style={styles.cartBadgeBtn} onPress={() => router.push('/cart')}>
              <Text style={styles.cartIcon}>🛒</Text>
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </Pressable>
            {!isAdmin ? (
              <Pressable style={styles.loginBtn} onPress={() => router.push('/login')}>
                <Text style={styles.loginBtnText}>🔐 Admin</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.logoutBtn} onPress={() => router.replace('/')}>
                <Text style={styles.logoutBtnText}>🚪 Logout</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Search bar - full width on mobile, inline on desktop */}
        <View style={[styles.navSearch, isMobile && styles.navSearchMobile]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.navSearchInput}
            placeholder="Search glasses..."
            placeholderTextColor="#64748B"
            value={search}
            onChangeText={setSearch}
            onKeyPress={handleKeyPress}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.navSearchBtn} onPress={handleSearch}>
            <Text style={styles.navSearchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* ── HERO BANNER ── */}
        {!isAdmin && (
          <View style={[styles.hero, isMobile && styles.heroMobile]}>
            <Text style={styles.heroEyebrow}>✦ PREMIUM EYEWEAR COLLECTION</Text>
            <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
              Discover Your{'\n'}Perfect Vision
            </Text>
            <Text style={[styles.heroSub, isMobile && styles.heroSubMobile]}>
              Handpicked frames for every style & occasion
            </Text>
          </View>
        )}

        {/* ── ADMIN PANEL ── */}
        {isAdmin && (
          <View style={[styles.adminPanel, isMobile && styles.adminPanelMobile]}>
            <View>
              <Text style={styles.adminTitle}>👑 Admin Dashboard</Text>
              <Text style={styles.adminSub}>Manage your product catalog</Text>
            </View>
            <Pressable style={styles.addBtn} onPress={() => router.push('/add')}>
              <Text style={styles.addBtnText}>＋ Add Product</Text>
            </Pressable>
          </View>
        )}

        {/* ── SECTION HEADER ── */}
        <View style={[styles.sectionHeader, isMobile && styles.sectionHeaderMobile]}>
          <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
            {search ? `Results for "${search}"` : isAdmin ? 'All Products' : 'Our Collection'}
          </Text>
          <Text style={styles.sectionCount}>{products.length} items</Text>
        </View>

        {/* ── PRODUCT GRID ── */}
        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👓</Text>
            <Text style={styles.emptyText}>No products found</Text>
            {search ? (
              <TouchableOpacity style={styles.clearBtn} onPress={() => { setSearch(''); loadProducts(); }}>
                <Text style={styles.clearBtnText}>Clear Search</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <View style={[styles.grid, isMobile && styles.gridMobile]}>
            {products.map((item, index) => (
              <View key={`${item.id}-${index}`} style={[styles.card, { width: getCardWidth() }]}>
                {/* Product Image */}
                <View style={[styles.imageContainer, isMobile && styles.imageContainerMobile]}>
                  <Image
                    source={{ uri: item.image || item.image_url }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay} />
                  {/* ID Badge on image */}
                  <View style={styles.idBadge}>
                    <Text style={styles.idBadgeText}>{formatId(item.id)}</Text>
                  </View>
                </View>

                {/* Product Info */}
                <View style={[styles.cardBody, isMobile && styles.cardBodyMobile]}>
                  <Text style={[styles.productName, isMobile && styles.productNameMobile]} numberOfLines={2}>{item.name}</Text>

                  <View style={styles.stockRow}>
                    <View style={[styles.stockDot, { backgroundColor: Number(item.stock) > 5 ? '#10B981' : Number(item.stock) > 0 ? '#F59E0B' : '#EF4444' }]} />
                    <Text style={styles.stockText}>
                      {Number(item.stock) === 0 ? 'Out of stock' : `${item.stock} in stock`}
                    </Text>
                  </View>

                  <Text style={[styles.priceText, isMobile && styles.priceTextMobile]}>
                    ฿{item.price}
                  </Text>

                  {/* Buttons */}
                  {!isAdmin ? (
                    <TouchableOpacity
                      style={[styles.addToCartBtn, Number(item.stock) === 0 && styles.disabledBtn]}
                      onPress={() => handleAddToCart(item)}
                      disabled={Number(item.stock) === 0}
                    >
                      <Text style={styles.addToCartText}>
                        {Number(item.stock) === 0 ? 'Out of Stock' : '+ Add to Cart'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.adminActions}>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => router.push(`/edit?product=${encodeURIComponent(JSON.stringify(item))}`)}
                      >
                        <Text style={styles.editBtnText}>✏️ Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                        <Text style={styles.deleteBtnText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── COLOR PALETTE ──
const C = {
  bg: '#0F172A',        // Dark navy background
  surface: '#1E293B',   // Card surface
  surface2: '#263548',  // Elevated surface
  border: '#334155',    // Border
  gold: '#C9A84C',      // Gold accent
  goldLight: '#E2C97E', // Light gold
  text: '#F1F5F9',      // Primary text
  textMuted: '#94A3B8', // Secondary text
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // ── NAV (Desktop) ──
  navbar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0B1628',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
    gap: 16,
  },
  // ── NAV (Mobile) ──
  navbarMobile: {
    flexDirection: 'column',
    paddingHorizontal: 14, paddingVertical: 10,
    gap: 10,
  },
  navTopRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', width: '100%',
  },
  logo: {
    fontSize: 18, fontWeight: '900', color: C.gold,
    letterSpacing: 3,
  },
  logoMobile: { fontSize: 16, letterSpacing: 2 },
  navSearch: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, height: 40,
  },
  navSearchMobile: {
    flex: 0, width: '100%', height: 38,
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  navSearchInput: {
    flex: 1, color: C.text, fontSize: 14,
    outlineStyle: 'none',
  },
  navSearchBtn: {
    backgroundColor: C.gold, paddingVertical: 5,
    paddingHorizontal: 14, borderRadius: 7,
  },
  navSearchBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 13 },
  navActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartBadgeBtn: { position: 'relative', padding: 6 },
  cartIcon: { fontSize: 22 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: C.gold, borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#0F172A', fontSize: 10, fontWeight: '900' },
  loginBtn: {
    backgroundColor: C.surface2, paddingVertical: 7,
    paddingHorizontal: 14, borderRadius: 8,
    borderWidth: 1, borderColor: C.gold,
  },
  loginBtnText: { color: C.gold, fontWeight: '700', fontSize: 13 },
  logoutBtn: {
    backgroundColor: '#7f1d1d', paddingVertical: 7,
    paddingHorizontal: 14, borderRadius: 8,
  },
  logoutBtnText: { color: '#fca5a5', fontWeight: '700', fontSize: 13 },

  // ── HERO (Desktop) ──
  hero: {
    paddingHorizontal: 30, paddingVertical: 52,
    backgroundColor: '#111827',
    borderBottomWidth: 1, borderBottomColor: C.border,
    alignItems: 'center',
  },
  // ── HERO (Mobile) ──
  heroMobile: {
    paddingHorizontal: 20, paddingVertical: 30,
  },
  heroEyebrow: { color: C.gold, fontSize: 11, fontWeight: '700', letterSpacing: 3, marginBottom: 14 },
  heroTitle: {
    color: C.text, fontSize: 38, fontWeight: '900',
    textAlign: 'center', lineHeight: 46,
    marginBottom: 12,
  },
  heroTitleMobile: {
    fontSize: 26, lineHeight: 34,
  },
  heroSub: { color: C.textMuted, fontSize: 15, textAlign: 'center' },
  heroSubMobile: { fontSize: 13 },

  // ── ADMIN PANEL ──
  adminPanel: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1a2744', margin: 20, borderRadius: 14,
    padding: 18, borderWidth: 1, borderColor: '#2d4a7a',
    maxWidth: 900, alignSelf: 'center', width: '90%',
  },
  adminPanelMobile: {
    flexDirection: 'column', gap: 12, alignItems: 'stretch',
    margin: 12, padding: 14,
  },
  adminTitle: { color: C.gold, fontWeight: '800', fontSize: 16 },
  adminSub: { color: C.textMuted, fontSize: 12, marginTop: 3 },
  addBtn: {
    backgroundColor: C.gold, paddingVertical: 10,
    paddingHorizontal: 20, borderRadius: 10, alignItems: 'center',
  },
  addBtnText: { color: '#0F172A', fontWeight: '800', fontSize: 14 },

  // ── SECTION HEADER ──
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
    maxWidth: 960, alignSelf: 'center', width: '100%',
  },
  sectionHeaderMobile: {
    paddingHorizontal: 16, paddingVertical: 12,
  },
  sectionTitle: { color: C.text, fontSize: 20, fontWeight: '800' },
  sectionTitleMobile: { fontSize: 17 },
  sectionCount: {
    color: C.textMuted, fontSize: 13, backgroundColor: C.surface,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },

  // ── GRID (Desktop) ──
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 16,
    maxWidth: 960, alignSelf: 'center', width: '100%',
    justifyContent: 'flex-start',
  },
  // ── GRID (Mobile) ──
  gridMobile: {
    paddingHorizontal: 14, gap: 14,
  },

  // ── CARD ──
  card: {
    backgroundColor: C.surface,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  imageContainer: { width: '100%', height: 180, position: 'relative' },
  imageContainerMobile: { height: 220 },
  productImage: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
    backgroundColor: 'rgba(15,23,42,0.3)',
  },
  idBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: 'rgba(15,23,42,0.75)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    borderWidth: 1, borderColor: C.border,
  },
  idBadgeText: { color: C.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  cardBody: { padding: 14 },
  cardBodyMobile: { padding: 16 },
  productName: { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 8, lineHeight: 20 },
  productNameMobile: { fontSize: 16 },

  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  stockDot: { width: 7, height: 7, borderRadius: 4 },
  stockText: { color: C.textMuted, fontSize: 12 },

  priceText: { color: C.gold, fontSize: 20, fontWeight: '900', marginBottom: 12 },
  priceTextMobile: { fontSize: 22 },

  addToCartBtn: {
    backgroundColor: C.gold, paddingVertical: 12,
    borderRadius: 10, alignItems: 'center',
  },
  addToCartText: { color: '#0F172A', fontWeight: '800', fontSize: 14 },
  disabledBtn: { backgroundColor: C.surface2, borderColor: C.border, borderWidth: 1 },

  adminActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    flex: 1, backgroundColor: '#1e3a5f', paddingVertical: 9,
    borderRadius: 9, alignItems: 'center',
    borderWidth: 1, borderColor: '#2563eb',
  },
  editBtnText: { color: '#93c5fd', fontWeight: '700', fontSize: 13 },
  deleteBtn: {
    backgroundColor: '#3b0f0f', paddingVertical: 9, paddingHorizontal: 14,
    borderRadius: 9, alignItems: 'center',
    borderWidth: 1, borderColor: '#7f1d1d',
  },
  deleteBtnText: { fontSize: 15 },

  // ── EMPTY ──
  emptyState: { alignItems: 'center', paddingVertical: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: { color: C.textMuted, fontSize: 16, marginBottom: 16 },
  clearBtn: {
    borderColor: C.gold, borderWidth: 1,
    paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20,
  },
  clearBtnText: { color: C.gold, fontWeight: '600' },
});