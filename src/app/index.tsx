// ════════════════════════════════════════
// ไฟล์: index.tsx (หน้าหลักของแอปพลิเคชัน Ming Optic)
// ════════════════════════════════════════
// หน้าที่หลัก:
// 1. แสดงรายการสินค้าทั้งหมด (แว่นตา) ในรูปแบบ Grid
// 2. มีระบบค้นหาสินค้าพร้อม Autocomplete / Debounce
// 3. รองรับ Responsive Design (แสดงผลต่างกันใน Mobile และ Desktop)
// 4. มีระบบตะกร้าสินค้า (เพิ่มลงตะกร้า, แสดงจำนวน)
// 5. มีระบบ Admin Mode (เพิ่ม, แก้ไข, ลบสินค้า) หากผู้ใช้เข้าสู่ระบบ
// ────────────────────────────────────────

// ────────────────────────────────────────
// Imports Section - นำเข้าไลบรารีและคอมโพเนนต์ที่จำเป็น
// ────────────────────────────────────────
// useLocalSearchParams, useRouter: สำหรับจัดการ Routing และอ่านพารามิเตอร์จาก URL
import { useLocalSearchParams, useRouter } from 'expo-router';
// useCallback, useEffect, useRef, useState: React Hooks สำหรับจัดการ State และ Lifecycle
import { useCallback, useEffect, useRef, useState } from 'react';
// UI Components จาก React Native สำหรับสร้างหน้าจอ
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
// นำเข้า API Base URL จากค่าคงที่
import { API_BASE_URL } from '../constants/api';

const API_URL = `${API_BASE_URL}/products`;

// ════════════════════════════════════════
// COLOR PALETTE (C) - ชุดสีที่ใช้ในแอปพลิเคชัน
// ════════════════════════════════════════
// เก็บค่าสีเป็น object เพื่อให้เรียกใช้และแก้ไขได้ง่ายในที่เดียว
// - bg: สีพื้นหลังหลัก (น้ำเงินเข้ม)
// - surface / surface2: สีพื้นหลังของการ์ดและกล่องข้อความที่มีความลึกต่างๆ
// - border: สีเส้นขอบ
// - gold / goldLight: สีทองใช้เป็นสีหลักของแบรนด์ (ปุ่ม, เน้นข้อความ, ไอคอน)
// - text / textMuted: สีข้อความหลักและข้อความรอง
// - green, amber, red: สีที่ใช้บอกสถานะ (เช่น จำนวนสต็อกสินค้า)
const C = {
  bg: '#0F172A',
  surface: '#1E293B',
  surface2: '#263548',
  border: '#334155',
  gold: '#C9A84C',
  goldLight: '#E2C97E',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
};

export default function Index() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // ตรวจสอบว่าเป็น Mobile หรือไม่ (ความกว้าง < 768px)

  // ────────────────────────────────────────
  // State Variables - ตัวแปรเก็บสถานะของคอมโพเนนต์
  // ────────────────────────────────────────
  // products: เก็บรายการสินค้าที่กำลังแสดงผล (หลังจากค้นหาหรือโหลดมา)
  const [products, setProducts] = useState([]);
  // cartCount: จำนวนชิ้นสินค้าทั้งหมดในตะกร้า
  const [cartCount, setCartCount] = useState(0);
  // search: ข้อความที่ผู้ใช้พิมพ์ในช่องค้นหา
  const [search, setSearch] = useState('');
  // showSearch: ควบคุมการเปิด/ปิดช่องค้นหาในโหมด Mobile
  const [showSearch, setShowSearch] = useState(false);
  // allProducts: เก็บรายการสินค้าทั้งหมดเพื่อใช้ค้นหาแบบ Autocomplete โดยไม่ต้องเรียก API ซ้ำ
  const [allProducts, setAllProducts] = useState([]);
  // suggestions: เก็บรายการสินค้าที่แนะนำเมื่อผู้ใช้กำลังพิมพ์ค้นหา
  const [suggestions, setSuggestions] = useState([]);
  // showSuggestions: ควบคุมการเปิด/ปิดกล่องแสดงรายการแนะนำ (Autocomplete)
  const [showSuggestions, setShowSuggestions] = useState(false);
  // isAdmin: ตรวจสอบสถานะว่าเข้าสู่ระบบเป็น Admin หรือไม่ (อ่านจาก URL params)
  const isAdmin = params.admin === 'true';

  const currentSearchRef = useRef(''); // เก็บคำค้นหาล่าสุด เพื่อป้องกันปัญหา Race Condition จาก API

  // ════════════════════════════════════════
  // loadProducts — โหลดข้อมูลสินค้าจาก Server
  // ════════════════════════════════════════
  // ขั้นตอนการทำงาน:
  // 1. อัปเดต currentSearchRef เพื่อบันทึกว่าคำค้นหาล่าสุดคืออะไร
  // 2. สร้าง URL พร้อม query string (ถ้ามี) แล้วดึงข้อมูลจาก API
  // 3. ป้องกัน Race Condition: ถ้าคำค้นหาเปลี่ยนไประหว่างรอ ให้ข้ามการอัปเดต State
  // 4. ตรวจสอบให้แน่ใจว่าได้ข้อมูลเป็น Array และกรองเอาข้อมูลที่ไม่มี ID ออกไป
  // 5. กรองผลลัพธ์ที่ฝั่ง Frontend อีกครั้งเพื่อความถูกต้อง
  // 6. อัปเดต products state เพื่อนำไปแสดงผล
  const loadProducts = async (searchQuery = '') => {
    currentSearchRef.current = searchQuery;
    try {
      let url = API_URL;
      if (searchQuery) url += `?search=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      // ป้องกัน Race Condition: ถ้าคำค้นหาถูกเปลี่ยนระหว่างรอ API ไม่ต้องอัปเดต state
      if (currentSearchRef.current !== searchQuery) return;
      
      // ป้องกัน error: ต้องเป็น array เสมอ
      let items = Array.isArray(data) ? data : [];

      // กรองสินค้าที่ไม่มี ID ออก (ข้อมูลเก่าที่ไม่สมบูรณ์)
      items = items.filter(p => p.id && String(p.id).trim() !== '');

      // กรองผลลัพธ์ที่ฝั่ง Frontend เผื่อ server ไม่ได้กรองให้
      if (searchQuery && items.length > 0) {
        const q = searchQuery.toLowerCase();
        const filtered = items.filter(p => {
          const pName = (p.name || p.productname || '').toLowerCase();
          const pId = (p.id || '').toLowerCase();
          return pName.includes(q) || pId.includes(q);
        });
        // ใช้ผลลัพธ์ที่กรองแล้ว (ถ้ากรองแล้วไม่เหลือเลย จะแสดง array ว่าง)
        items = filtered;
      }

      setProducts(items);
    } catch (error) {
      console.error('Error loading products:', error);
      if (currentSearchRef.current === searchQuery) {
        setProducts([]);
      }
    }
  };

  // ════════════════════════════════════════
  // loadAllProducts — โหลดข้อมูลสินค้าทั้งหมด
  // ════════════════════════════════════════
  // หน้าที่: โหลดสินค้าทั้งหมดมาเก็บไว้ใน state 'allProducts' ในตอนแรก
  // เพื่อเอาไว้ใช้ทำระบบ Autocomplete แนะนำคำค้นหาฝั่ง Frontend อย่างรวดเร็ว
  const loadAllProducts = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const items = Array.isArray(data) ? data : [];
      // กรองสินค้าที่ไม่มี ID ออก
      setAllProducts(items.filter(p => p.id && String(p.id).trim() !== ''));
    } catch (e) { setAllProducts([]); }
  };

  // ════════════════════════════════════════
  // useEffect — Lifecycle สำหรับเริ่มต้นทำงาน
  // ════════════════════════════════════════
  // จะถูกเรียกเมื่อคอมโพเนนต์ถูกสร้าง หรือเมื่อพารามิเตอร์ URL เปลี่ยนไป
  // หน้าที่: 
  // 1. โหลดข้อมูลสินค้า (loadProducts และ loadAllProducts)
  // 2. ดึงข้อมูลตะกร้าสินค้าจาก localStorage เพื่อมานับจำนวนรวมของสินค้าในตะกร้า
  useEffect(() => {
    loadProducts();
    loadAllProducts();
    try {
      const cartSaved = localStorage.getItem('ming_cart');
      const cartItems = cartSaved ? JSON.parse(cartSaved) : [];
      const totalQty = cartItems.reduce((sum, ci) => sum + (Number(ci.quantity) || 1), 0);
      setCartCount(totalQty);
    } catch (e) { setCartCount(0); }
  }, [params.newProduct, params.updatedProduct, params.admin, params.refresh]);

  const handleSearch = () => { setShowSuggestions(false); loadProducts(search); };
  const handleKeyPress = (e) => { if (e.nativeEvent.key === 'Enter') handleSearch(); };

  // ════════════════════════════════════════
  // handleSearchChange (Debounce) — จัดการการพิมพ์ค้นหา
  // ════════════════════════════════════════
  // แนวคิด Debounce: เป็นการหน่วงเวลาการเรียก API (ในที่นี้คือ 300ms) 
  // ถ้ายูสเซอร์พิมพ์ตัวอักษรใหม่เข้ามาต่อเนื่องกัน จะล้าง Timer เดิมทิ้งแล้วเริ่มนับใหม่ 
  // จนกว่าจะหยุดพิมพ์ครบ 300ms ถึงจะยอมเรียก API ทำให้ไม่เกิดการรัน API ซ้ำซ้อนมากเกินไป
  // ระหว่างที่รอ จะโชว์ข้อมูล Autocomplete (suggestions) จาก allProducts ไปก่อน
  const debounceTimer = useRef(null);

  const handleSearchChange = useCallback((text) => {
    setSearch(text);

    // ล้าง timer เก่าทุกครั้งที่พิมพ์ตัวอักษรใหม่
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (text.trim().length > 0) {
      // กรอง autocomplete suggestions ทันที (จากข้อมูลที่โหลดไว้แล้ว)
      const filtered = allProducts.filter(p =>
        (p.name || p.productname || '').toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);

      // ตั้ง Debounce: รอ 300ms แล้วค่อยเรียก API ค้นหาจริง
      debounceTimer.current = setTimeout(() => {
        loadProducts(text);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      // ตั้ง Debounce: รอ 300ms ก่อนโหลดสินค้าทั้งหมดกลับมา
      debounceTimer.current = setTimeout(() => {
        loadProducts('');
      }, 300);
    }
  }, [allProducts]);

  // ────────────────────────────────────────
  // selectSuggestion — เลือกรายการแนะนำ
  // ────────────────────────────────────────
  // เมื่อยูสเซอร์คลิกที่รายการสินค้าในช่องแนะนำคำค้นหา จะเอาชื่อนั้นมาตั้งเป็น search
  // แล้วเรียก loadProducts หาข้อมูลนั้นทันที พร้อมซ่อนกล่องแนะนำ
  const selectSuggestion = (item) => {
    const name = item.name || item.productname || '';
    setSearch(name);
    setShowSuggestions(false);
    loadProducts(name);
  };

  // ════════════════════════════════════════
  // handleAddToCart — เพิ่มสินค้าลงตะกร้า
  // ════════════════════════════════════════
  // ขั้นตอนการทำงาน:
  // 1. ดึงข้อมูลตะกร้าที่มีอยู่จาก localStorage
  // 2. ตรวจสอบสต็อกว่ามีของเหลือไหม (ถ้าหมดแสดงแจ้งเตือน)
  // 3. ถ้ามีสินค้านี้ในตะกร้าอยู่แล้ว → บวกจำนวนเพิ่ม (แต่ต้องไม่เกินสต็อกสูงสุด)
  // 4. ถ้าเป็นสินค้าใหม่ → เพิ่ม object ลงไปพร้อม set quantity = 1
  // 5. บันทึกกลับเข้า localStorage และอัปเดต cartCount state
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
        if (currentQty >= maxStock) { Alert.alert('Stock Limit', `Only ${maxStock} available.`); return; }
        cartItems[existingIndex].quantity = currentQty + 1;
      } else {
        cartItems.push({ ...item, quantity: 1 });
      }
      localStorage.setItem('ming_cart', JSON.stringify(cartItems));
      setCartCount(cartItems.reduce((sum, ci) => sum + (Number(ci.quantity) || 1), 0));
    } catch (e) { Alert.alert('Error', 'Could not add to cart.'); }
  };

  // ════════════════════════════════════════
  // handleDelete — ลบสินค้า (Admin Mode)
  // ════════════════════════════════════════
  // ขั้นตอนการทำงาน:
  // 1. แสดงกล่องคอนเฟิร์ม (window.confirm) เพื่อยืนยันการลบ
  // 2. ถ้ากดยืนยัน จะดึง admin_token จาก localStorage
  // 3. ยิง API แบบ DELETE ไปที่เซิร์ฟเวอร์
  // 4. ถ้าสำเร็จ → โหลดรายการสินค้าใหม่, ถ้าไม่สำเร็จ → แจ้งเตือนข้อผิดพลาด
  const handleDelete = async (id) => {
    const confirmed = typeof window !== 'undefined' && window.confirm
      ? window.confirm('Are you sure you want to delete this product?')
      : true;
    if (!confirmed) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        loadProducts();
      } else {
        Alert.alert('Error', data.error || 'Failed to delete.');
      }
    } catch (e) { Alert.alert('Error', 'Cannot connect to server.'); }
  };

  // ────────────────────────────────────────
  // ฟังก์ชันจัดรูปแบบการแสดงผล
  // ────────────────────────────────────────
  // formatId: เติมตัวอักษร P ให้รหัส และจัดการรูปแบบให้เป็น 3 หลัก
  const formatId = (id) => {
    const s = String(id).toUpperCase();
    return s.startsWith('P') ? s : `P${String(id).padStart(3, '0')}`;
  };

  // formatPrice: จัดรูปแบบราคาให้มี comma คั่นหลักพัน เช่น 47600 → "47,600"
  const formatPrice = (price) => {
    const num = String(price).replace(/[^0-9]/g, '');
    if (!num) return '0';
    return Number(num).toLocaleString('en-US');
  };

  // ════════════════════════════════════════
  // MOBILE LAYOUT - การแสดงผลสำหรับมือถือ
  // ════════════════════════════════════════
  // แยกการแสดงผลออกมาสำหรับหน้าจอที่มีความกว้างน้อยกว่า 768px (Responsive Design)
  if (isMobile) {
    return (
      <SafeAreaView style={m.container}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />

        {/* ── Mobile Nav - แถบนำทางด้านบน ── */}
        <View style={m.nav}>
          <Text style={m.navLogo}>MING OPTIC</Text>
          <View style={m.navRight}>
            <Pressable onPress={() => setShowSearch(!showSearch)}>
              <Text style={m.navIcon}>🔍</Text>
            </Pressable>
            <Pressable style={m.cartBtn} onPress={() => router.push('/cart')}>
              <Text style={m.navIcon}>🛒</Text>
              {cartCount > 0 && (
                <View style={m.badge}><Text style={m.badgeText}>{cartCount}</Text></View>
              )}
            </Pressable>
            {!isAdmin ? (
              <Pressable style={m.adminBtn} onPress={() => router.push('/login')}>
                <Text style={m.adminBtnText}>🔐 Admin Login</Text>
              </Pressable>
            ) : (
              <Pressable style={m.logoutBtn} onPress={() => router.replace('/')}>
                <Text style={m.logoutBtnText}>Logout</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Search Bar (toggle) + Autocomplete - ช่องค้นหาและตัวช่วยค้นหา ── */}
        {showSearch && (
          <View style={{ zIndex: 100, elevation: 10 }}>
            <View style={m.searchBar}>
              <TextInput
                style={m.searchInput}
                placeholder="Search glasses..."
                placeholderTextColor="#64748B"
                value={search}
                onChangeText={handleSearchChange}
                onKeyPress={handleKeyPress}
                onSubmitEditing={handleSearch}
                autoFocus
              />
              <TouchableOpacity style={m.searchBtn} onPress={handleSearch}>
                <Text style={m.searchBtnText}>Search</Text>
              </TouchableOpacity>
            </View>
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={m.suggestionsBox}>
                {suggestions.map((item, i) => (
                  <TouchableOpacity
                    key={`sug-${item.id}-${i}`}
                    style={[m.suggestionItem, i < suggestions.length - 1 && m.suggestionBorder]}
                    onPress={() => selectSuggestion(item)}
                  >
                    <Text style={m.suggestionIcon}>🔍</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={m.suggestionText} numberOfLines={1}>{item.name || item.productname}</Text>
                      <Text style={m.suggestionPrice}>฿{formatPrice(item.price)}</Text>
                    </View>
                    <Image source={{ uri: item.image || item.img || item.image_url }} style={m.suggestionImg} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── Hero (compact) - ส่วนหัวโปรโมท ── */}
          {!isAdmin && (
            <View style={m.hero}>
              <Text style={m.heroEyebrow}>✦ PREMIUM EYEWEAR</Text>
              <Text style={m.heroTitle}>Discover Your Perfect Vision</Text>
              <Text style={m.heroSub}>Handpicked frames for every style</Text>
            </View>
          )}

          {/* ── Admin Panel - แผงควบคุมสำหรับผู้ดูแลระบบ ── */}
          {isAdmin && (
            <View style={m.adminPanel}>
              <Text style={m.adminPanelTitle}>👑 Admin Dashboard</Text>
              <Pressable style={m.addProductBtn} onPress={() => router.push('/add')}>
                <Text style={m.addProductBtnText}>＋ Add</Text>
              </Pressable>
            </View>
          )}

          {/* ── Section Header - หัวข้อแสดงผลการค้นหาหรือคอลเลกชัน ── */}
          <View style={m.sectionHeader}>
            <Text style={m.sectionTitle}>
              {search ? `"${search}"` : isAdmin ? 'All Products' : 'Our Collection'}
            </Text>
            <Text style={m.sectionCount}>{products.length} items</Text>
          </View>

          {/* ── Product Grid (2 columns) - ลิสต์รายการสินค้าแบบ 2 คอลัมน์ ── */}
          {products.length === 0 ? (
            <View style={m.emptyState}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>👓</Text>
              <Text style={{ color: C.textMuted, fontSize: 14 }}>No products found</Text>
              {search ? (
                <TouchableOpacity style={m.clearBtn} onPress={() => { setSearch(''); loadProducts(); }}>
                  <Text style={{ color: C.gold, fontSize: 13 }}>Clear Search</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={m.grid}>
              {products.map((item, index) => (
                <View key={`${item.id}-${index}`} style={m.card}>
                  {/* Image */}
                  <View style={m.imgWrap}>
                    <Image
                      source={{ uri: item.image || item.image_url }}
                      style={m.img}
                      resizeMode="cover"
                    />
                    <View style={m.idTag}>
                      <Text style={m.idTagText}>{formatId(item.id)}</Text>
                    </View>
                  </View>

                  {/* Info */}
                  <View style={m.cardInfo}>
                    <Text style={m.cardName} numberOfLines={1}>{item.name}</Text>
                    <View style={m.stockRow}>
                      <View style={[m.stockDot, {
                        backgroundColor: Number(item.stock) > 5 ? C.green : Number(item.stock) > 0 ? C.amber : C.red
                      }]} />
                      <Text style={m.stockLabel}>
                        {Number(item.stock) === 0 ? 'Out of stock' : `${item.stock} in stock`}
                      </Text>
                    </View>
                    <Text style={m.price}>฿{formatPrice(item.price)}</Text>

                    {/* Action */}
                    {!isAdmin ? (
                      <TouchableOpacity
                        style={[m.cartAddBtn, Number(item.stock) === 0 && m.cartAddBtnDisabled]}
                        onPress={() => handleAddToCart(item)}
                        disabled={Number(item.stock) === 0}
                      >
                        <Text style={m.cartAddBtnText}>
                          {Number(item.stock) === 0 ? 'Sold Out' : '🛒 Add'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={m.adminRow}>
                        <TouchableOpacity
                          style={m.editBtnM}
                          onPress={() => router.push(`/edit?product=${encodeURIComponent(JSON.stringify(item))}`)}
                        >
                          <Text style={m.editBtnMText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={m.deleteBtnM} onPress={() => handleDelete(item.id)}>
                          <Text style={m.deleteBtnMText}>Del</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ════════════════════════════════════════
  // DESKTOP LAYOUT - การแสดงผลสำหรับคอมพิวเตอร์/แท็บเล็ต
  // ════════════════════════════════════════
  return (
    <SafeAreaView style={d.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Desktop Nav - แถบนำทางด้านบนสำหรับ Desktop ── */}
      <View style={d.nav}>
        <Text style={d.navLogo}>MING OPTIC</Text>
        <View style={{ flex: 1, zIndex: 100 }}>
          <View style={d.navSearch}>
            <Text style={{ fontSize: 14, marginRight: 6 }}>🔍</Text>
            <TextInput
              style={d.navSearchInput}
              placeholder="Search glasses..."
              placeholderTextColor="#64748B"
              value={search}
              onChangeText={handleSearchChange}
              onKeyPress={handleKeyPress}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={d.navSearchBtn} onPress={handleSearch}>
              <Text style={d.navSearchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>
          {/* Desktop Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={d.suggestionsBox}>
              {suggestions.map((item, i) => (
                <TouchableOpacity
                  key={`dsug-${item.id}-${i}`}
                  style={[d.suggestionItem, i < suggestions.length - 1 && d.suggestionBorder]}
                  onPress={() => selectSuggestion(item)}
                >
                  <Image source={{ uri: item.image || item.img || item.image_url }} style={d.suggestionImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={d.suggestionText}>{item.name || item.productname}</Text>
                    <Text style={d.suggestionPrice}>฿{formatPrice(item.price)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View style={d.navActions}>
          <Pressable style={d.cartBadgeBtn} onPress={() => router.push('/cart')}>
            <Text style={{ fontSize: 22 }}>🛒</Text>
            {cartCount > 0 && (
              <View style={d.badge}><Text style={d.badgeText}>{cartCount}</Text></View>
            )}
          </Pressable>
          {!isAdmin ? (
            <Pressable style={d.loginBtn} onPress={() => router.push('/login')}>
              <Text style={d.loginBtnText}>🔐 Admin Login</Text>
            </Pressable>
          ) : (
            <Pressable style={d.logoutBtn} onPress={() => router.replace('/')}>
              <Text style={d.logoutBtnText}>🚪 Logout</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero - ส่วนหัวโปรโมทขนาดใหญ่ */}
        {!isAdmin && (
          <View style={d.hero}>
            <Text style={d.heroEyebrow}>✦ PREMIUM EYEWEAR COLLECTION</Text>
            <Text style={d.heroTitle}>Discover Your{'\n'}Perfect Vision</Text>
            <Text style={d.heroSub}>Handpicked frames for every style & occasion</Text>
          </View>
        )}

        {/* Admin Panel - แผงควบคุมผู้ดูแลระบบแบบเต็มกว้าง */}
        {isAdmin && (
          <View style={d.adminPanel}>
            <View>
              <Text style={d.adminTitle}>👑 Admin Dashboard</Text>
              <Text style={d.adminSub}>Manage your product catalog</Text>
            </View>
            <Pressable style={d.addBtn} onPress={() => router.push('/add')}>
              <Text style={d.addBtnText}>＋ Add Product</Text>
            </Pressable>
          </View>
        )}

        {/* Section Header */}
        <View style={d.sectionHeader}>
          <Text style={d.sectionTitle}>
            {search ? `Results for "${search}"` : isAdmin ? 'All Products' : 'Our Collection'}
          </Text>
          <Text style={d.sectionCount}>{products.length} items</Text>
        </View>

        {/* Product Grid - ลิสต์รายการสินค้าแบบหลายคอลัมน์ */}
        {products.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 80 }}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>👓</Text>
            <Text style={{ color: C.textMuted, fontSize: 16, marginBottom: 16 }}>No products found</Text>
            {search ? (
              <TouchableOpacity
                style={{ borderColor: C.gold, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 }}
                onPress={() => { setSearch(''); loadProducts(); }}
              >
                <Text style={{ color: C.gold, fontWeight: '600' }}>Clear Search</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <View style={d.grid}>
            {products.map((item, index) => (
              <View key={`${item.id}-${index}`} style={d.card}>
                <View style={d.imgContainer}>
                  <Image source={{ uri: item.image || item.image_url }} style={d.productImage} resizeMode="cover" />
                  <View style={d.imgOverlay} />
                  <View style={d.idBadge}>
                    <Text style={d.idBadgeText}>{formatId(item.id)}</Text>
                  </View>
                </View>
                <View style={d.cardBody}>
                  <Text style={d.productName} numberOfLines={2}>{item.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <View style={[{ width: 7, height: 7, borderRadius: 4 }, {
                      backgroundColor: Number(item.stock) > 5 ? C.green : Number(item.stock) > 0 ? C.amber : C.red
                    }]} />
                    <Text style={{ color: C.textMuted, fontSize: 12 }}>
                      {Number(item.stock) === 0 ? 'Out of stock' : `${item.stock} in stock`}
                    </Text>
                  </View>
                  <Text style={d.priceText}>฿{formatPrice(item.price)}</Text>
                  {!isAdmin ? (
                    <TouchableOpacity
                      style={[d.addToCartBtn, Number(item.stock) === 0 && d.disabledBtn]}
                      onPress={() => handleAddToCart(item)}
                      disabled={Number(item.stock) === 0}
                    >
                      <Text style={d.addToCartText}>
                        {Number(item.stock) === 0 ? 'Out of Stock' : '+ Add to Cart'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={d.editBtn}
                        onPress={() => router.push(`/edit?product=${encodeURIComponent(JSON.stringify(item))}`)}
                      >
                        <Text style={d.editBtnText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={d.deleteBtn} onPress={() => handleDelete(item.id)}>
                        <Text style={{ fontSize: 15, color: '#fca5a5' }}>Del</Text>
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

// ══════════════════════════════════════
// MOBILE STYLES (m) - สไตล์ชีตสำหรับมือถือ
// ══════════════════════════════════════
// คลาสการออกแบบที่ใช้กับอุปกรณ์หน้าจอขนาดเล็ก (จัดระยะขอบขนาดเล็ก)
const m = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Nav
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#0B1628',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  navLogo: { fontSize: 16, fontWeight: '900', color: C.gold, letterSpacing: 2 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navIcon: { fontSize: 20 },
  cartBtn: { position: 'relative' },
  badge: {
    position: 'absolute', top: -6, right: -8,
    backgroundColor: C.gold, borderRadius: 9,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#0F172A', fontSize: 9, fontWeight: '900' },
  adminBtn: {
    backgroundColor: C.surface2, paddingVertical: 5, paddingHorizontal: 10,
    borderRadius: 6, borderWidth: 1, borderColor: C.gold,
  },
  adminBtnText: { color: C.gold, fontWeight: '700', fontSize: 11 },
  logoutBtn: {
    backgroundColor: '#7f1d1d', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6,
  },
  logoutBtnText: { color: '#fca5a5', fontWeight: '700', fontSize: 11 },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, marginHorizontal: 12, marginTop: 8,
    borderRadius: 8, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 10, height: 36,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 13 },
  searchBtn: { backgroundColor: C.gold, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 6 },
  searchBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 12 },

  // Hero
  hero: {
    paddingHorizontal: 16, paddingVertical: 20,
    backgroundColor: '#111827',
    borderBottomWidth: 1, borderBottomColor: C.border,
    alignItems: 'center',
  },
  heroEyebrow: { color: C.gold, fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  heroTitle: { color: C.text, fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  heroSub: { color: C.textMuted, fontSize: 12, textAlign: 'center' },

  // Admin Panel
  adminPanel: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1a2744', marginHorizontal: 12, marginTop: 12,
    borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#2d4a7a',
  },
  adminPanelTitle: { color: C.gold, fontWeight: '800', fontSize: 14 },
  addProductBtn: { backgroundColor: C.gold, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 8 },
  addProductBtnText: { color: '#0F172A', fontWeight: '800', fontSize: 13 },

  // Section Header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  sectionTitle: { color: C.text, fontSize: 16, fontWeight: '800' },
  sectionCount: {
    color: C.textMuted, fontSize: 11, backgroundColor: C.surface,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
  },

  // Grid - 2 columns
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 10, gap: 10,
    justifyContent: 'space-between',
  },

  // Card
  card: {
    backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
    width: '48%', marginBottom: 2,
  },
  imgWrap: { width: '100%', height: 130, position: 'relative' },
  img: { width: '100%', height: '100%' },
  idTag: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: 'rgba(15,23,42,0.8)',
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  idTagText: { color: C.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 1 },

  // Card Info
  cardInfo: { padding: 8 },
  cardName: { color: C.text, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  stockDot: { width: 5, height: 5, borderRadius: 3 },
  stockLabel: { color: C.textMuted, fontSize: 9 },
  price: { color: C.gold, fontSize: 15, fontWeight: '900', marginBottom: 6 },

  // Cart Add Button
  cartAddBtn: { backgroundColor: C.gold, paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  cartAddBtnDisabled: { backgroundColor: C.surface2 },
  cartAddBtnText: { color: '#0F172A', fontWeight: '800', fontSize: 11 },

  // Admin buttons
  adminRow: { flexDirection: 'row', gap: 6 },
  editBtnM: {
    flex: 1, backgroundColor: '#1e3a5f', paddingVertical: 6,
    borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#2563eb',
  },
  editBtnMText: { fontSize: 13 },
  deleteBtnM: {
    backgroundColor: '#3b0f0f', paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#7f1d1d',
  },
  deleteBtnMText: { fontSize: 13 },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  clearBtn: {
    borderColor: C.gold, borderWidth: 1, marginTop: 12,
    paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16,
  },

  // Suggestions
  suggestionsBox: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 8, marginHorizontal: 12, marginTop: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 10,
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8,
  },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  suggestionIcon: { fontSize: 12, color: C.textMuted },
  suggestionText: { color: C.text, fontSize: 13, fontWeight: '600' },
  suggestionPrice: { color: C.gold, fontSize: 11, fontWeight: '700', marginTop: 2 },
  suggestionImg: { width: 36, height: 36, borderRadius: 6, backgroundColor: C.surface2 },
});

// ══════════════════════════════════════
// DESKTOP STYLES (d) - สไตล์ชีตสำหรับคอมพิวเตอร์และแท็บเล็ต
// ══════════════════════════════════════
// คลาสการออกแบบที่ใช้กับอุปกรณ์หน้าจอขนาดใหญ่ (มี padding และขนาดองค์ประกอบใหญ่กว่า)
const d = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Nav
  nav: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0B1628',
    paddingHorizontal: 24, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border, gap: 16,
    zIndex: 100, elevation: 10,
  },
  navLogo: { fontSize: 18, fontWeight: '900', color: C.gold, letterSpacing: 3, minWidth: 130 },
  navSearch: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, height: 40,
  },
  navSearchInput: { flex: 1, color: C.text, fontSize: 14 },
  navSearchBtn: { backgroundColor: C.gold, paddingVertical: 5, paddingHorizontal: 14, borderRadius: 7 },
  navSearchBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 13 },
  navActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartBadgeBtn: { position: 'relative', padding: 6 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: C.gold, borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#0F172A', fontSize: 10, fontWeight: '900' },
  loginBtn: {
    backgroundColor: C.surface2, paddingVertical: 7, paddingHorizontal: 14,
    borderRadius: 8, borderWidth: 1, borderColor: C.gold,
  },
  loginBtnText: { color: C.gold, fontWeight: '700', fontSize: 13 },
  logoutBtn: { backgroundColor: '#7f1d1d', paddingVertical: 7, paddingHorizontal: 14, borderRadius: 8 },
  logoutBtnText: { color: '#fca5a5', fontWeight: '700', fontSize: 13 },

  // Hero
  hero: {
    paddingHorizontal: 30, paddingVertical: 52,
    backgroundColor: '#111827',
    borderBottomWidth: 1, borderBottomColor: C.border, alignItems: 'center',
  },
  heroEyebrow: { color: C.gold, fontSize: 11, fontWeight: '700', letterSpacing: 3, marginBottom: 14 },
  heroTitle: { color: C.text, fontSize: 38, fontWeight: '900', textAlign: 'center', lineHeight: 46, marginBottom: 12 },
  heroSub: { color: C.textMuted, fontSize: 15, textAlign: 'center' },

  // Admin Panel
  adminPanel: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1a2744', margin: 20, borderRadius: 14,
    padding: 18, borderWidth: 1, borderColor: '#2d4a7a',
    maxWidth: 960, alignSelf: 'center', width: '90%',
  },
  adminTitle: { color: C.gold, fontWeight: '800', fontSize: 16 },
  adminSub: { color: C.textMuted, fontSize: 12, marginTop: 3 },
  addBtn: { backgroundColor: C.gold, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  addBtnText: { color: '#0F172A', fontWeight: '800', fontSize: 14 },

  // Section Header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 16,
    maxWidth: 960, alignSelf: 'center', width: '100%',
  },
  sectionTitle: { color: C.text, fontSize: 20, fontWeight: '800' },
  sectionCount: {
    color: C.textMuted, fontSize: 13, backgroundColor: C.surface,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },

  // Grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 16,
    maxWidth: 960, alignSelf: 'center', width: '100%',
  },

  // Card
  card: {
    backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border, width: '31%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  imgContainer: { width: '100%', height: 180, position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  imgOverlay: {
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
  productName: { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 8, lineHeight: 20 },
  priceText: { color: C.gold, fontSize: 20, fontWeight: '900', marginBottom: 12 },

  addToCartBtn: { backgroundColor: C.gold, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  addToCartText: { color: '#0F172A', fontWeight: '800', fontSize: 14 },
  disabledBtn: { backgroundColor: C.surface2, borderColor: C.border, borderWidth: 1 },

  editBtn: {
    flex: 1, backgroundColor: '#1e3a5f', paddingVertical: 9,
    borderRadius: 9, alignItems: 'center', borderWidth: 1, borderColor: '#2563eb',
  },
  editBtnText: { color: '#93c5fd', fontWeight: '700', fontSize: 13 },
  deleteBtn: {
    backgroundColor: '#3b0f0f', paddingVertical: 9, paddingHorizontal: 14,
    borderRadius: 9, alignItems: 'center', borderWidth: 1, borderColor: '#7f1d1d',
  },

  // Suggestions
  suggestionsBox: {
    position: 'absolute', top: 44, left: 0, right: 0,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 15,
  },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12,
  },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  suggestionText: { color: C.text, fontSize: 14, fontWeight: '600' },
  suggestionPrice: { color: C.gold, fontSize: 12, fontWeight: '700', marginTop: 2 },
  suggestionImg: { width: 40, height: 40, borderRadius: 8, backgroundColor: C.surface2 },
});