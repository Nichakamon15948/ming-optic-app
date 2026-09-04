// ดึงเครื่องมือ (Libraries) ที่ต้องใช้มาทำงาน
import { useRouter } from 'expo-router'; // ใช้สำหรับเปลี่ยนหน้าจอ (Routing)
import { useEffect, useState } from 'react'; // ใช้จัดการ State และ Lifecycle ของ React
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // ใช้สร้าง UI Component ต่างๆ

// ประกาศตัวแปร C (Constants) เก็บค่าสีต่างๆ (Theme) 
// การทำแบบนี้ช่วยให้โค้ดสะอาด และถ้าอาจารย์สั่งแก้สี ก็แก้แค่ตรงนี้จุดเดียวจบครับ
const C = {
  bg: '#0F172A', surface: '#1E293B', surface2: '#263548',
  border: '#334155', gold: '#C9A84C', goldLight: '#E2C97E',
  text: '#F1F5F9', textMuted: '#94A3B8', green: '#10B981', red: '#EF4444',
};

export default function CartScreen() {
  const router = useRouter(); // ตัวแปรสำหรับสั่งเปลี่ยนหน้า
  
  // สร้าง State ชื่อ cartItems เพื่อเก็บ Array ของสินค้าที่อยู่ในตะกร้า 
  // (ค่าเริ่มต้นคือ [] หรือ Array ว่าง)
  const [cartItems, setCartItems] = useState([]);

  // useEffect ทำงาน 1 ครั้งเมื่อเปิดหน้านี้ขึ้นมา (สังเกตจาก [] ด้านหลัง)
  // หน้าที่คือ: ไปดึงข้อมูลตะกร้าที่เคยเซฟไว้ในเครื่อง (localStorage) มาแสดงผล
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ming_cart'); // ดึงข้อมูลด้วย Key: ming_cart
      if (saved) {
        const parsed = JSON.parse(saved); // แปลงข้อมูลจาก String กลับเป็น Array/Object
        // เช็กความถูกต้องของข้อมูล (Normalize) บังคับให้จำนวนขั้นต่ำคือ 1
        const normalized = parsed.map(item => ({
          ...item,
          quantity: item.quantity && item.quantity > 0 ? item.quantity : 1
        }));
        setCartItems(normalized); // เอาข้อมูลที่จัดระเบียบแล้วใส่ลง State
      }
    } catch (e) { console.log('Error loading cart:', e); }
  }, []);

  // ฟังก์ชันกลางสำหรับ "อัปเดตหน้าจอ" และ "เซฟลงเครื่อง" พร้อมกัน
  // จะถูกเรียกใช้ทุกครั้งที่มีการ กดบวก, กดลบ, หรือกดลบสินค้า
  const saveCart = (items) => {
    setCartItems(items); // อัปเดต State (ทำให้หน้าจอเปลี่ยนตาม)
    try { 
      // แปลง Array เป็น String แล้วเซฟลงเครื่อง จะได้ไม่หายตอนปิดแอป
      localStorage.setItem('ming_cart', JSON.stringify(items)); 
    } catch (e) {}
  };

  // ฟังก์ชันเพิ่มจำนวนสินค้า (ปุ่ม +)
  const handleIncrease = (id) => {
    const updated = cartItems.map(item => {
      if (item.id === id) {
        const maxStock = Number(item.stock) || 99; // กำหนดจำนวนสต็อกสูงสุด
        // ถ้าผู้ใช้กดบวกจนถึงจำนวนสต็อกที่มี ให้เด้งแจ้งเตือนและไม่บวกเพิ่ม
        if (item.quantity >= maxStock) {
          Alert.alert('Stock Limit', `Only ${maxStock} unit(s) available.`);
          return item;
        }
        // ถ้ายังไม่เกินสต็อก ให้เอา quantity เดิมมาบวก 1
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    saveCart(updated); // เซฟข้อมูลใหม่
  };

  // ฟังก์ชันลดจำนวนสินค้า (ปุ่ม -)
  const handleDecrease = (id) => {
    const target = cartItems.find(item => item.id === id); // หาสินค้าที่ถูกกด
    if (!target) return;
    
    // ถ้าสินค้ามีแค่ 1 ชิ้น แล้วโดนกดลบอีก แปลว่าผู้ใช้ต้องการเอาออกจากตะกร้า
    if (target.quantity <= 1) {
      saveCart(cartItems.filter(item => item.id !== id)); // ลบสินค้านี้ทิ้ง
    } else {
      // ถ้ามากกว่า 1 ก็ลบออกไป 1 ชิ้นปกติ
      saveCart(cartItems.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item));
    }
  };

  // ฟังก์ชันกดลบสินค้าออกจากตะกร้าโดยตรง (ปุ่มกากบาท)
  // ใช้ .filter() เพื่อเก็บเฉพาะสินค้าที่ไอดี "ไม่ตรงกับ" ชิ้นที่กดลบ
  const handleRemove = (id) => saveCart(cartItems.filter(item => item.id !== id));

  // ฟังก์ชันจัดการตัวเลขราคา
  // เนื่องจากข้อมูลราคาอาจติดตัวอักษรมา เช่น "฿1,200" จึงต้องตัดอักษรออกเหลือแค่ตัวเลข
  const getUnitPrice = (item) => {
    const raw = String(item.price).replace(/[^0-9]/g, ''); // ใช้ Regex ตัดทุกอย่างที่ไม่ใช่เลข 0-9
    return Number(raw);
  };

  // ฟังก์ชันคำนวณราคารวมทั้งหมดในตะกร้า (ราคาสินค้า * จำนวนชิ้น ของทุกรายการ)
  const calculateTotal = () =>
    cartItems.reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0);

  // คำนวณจำนวนชิ้นของสินค้าทั้งหมดในตะกร้า
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ฟังก์ชันเมื่อกดปุ่มสั่งซื้อ (Checkout)
  const handleCheckout = () => {
    // เช็กดักไว้ก่อนว่า ถ้าตะกร้าว่างไม่ให้สั่งซื้อ
    if (cartItems.length === 0) { Alert.alert('Empty Cart', 'Please add items first.'); return; }
    
    // เด้ง Alert แจ้งยอดรวมที่ต้องชำระ
    Alert.alert(
      '✓ Order Confirmed',
      `Total: ฿${calculateTotal().toLocaleString()}\n\nThank you for shopping with Ming Optic!`
    );
    saveCart([]); // เคลียร์ตะกร้าให้ว่างหลังสั่งซื้อเสร็จ
    router.replace(`/?refresh=${Date.now()}`); // เด้งกลับไปหน้าแรก
  };

  // ----------------------------------------------------
  // ส่วนของการแสดงผล UI (User Interface) บนหน้าจอ
  // ----------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. ส่วนหัวของหน้าจอ (Top Bar) */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>MING OPTIC</Text>
        <View style={styles.topRight}>
          <Text style={styles.topTitle}>Shopping Cart</Text>
          <Pressable style={styles.backBtn} onPress={() => router.replace('/')}>
            <Text style={styles.backBtnText}>← Continue Shopping</Text>
          </Pressable>
        </View>
      </View>

      {/* 2. ส่วนเนื้อหา (มีเงื่อนไข: ถ้าตะกร้าว่างโชว์แบบนึง ถ้ามีของโชว์อีกแบบนึง) */}
      {cartItems.length === 0 ? (
        
        /* -- 2.1 กรณีตะกร้าว่าง (Empty State) -- */
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Discover our premium eyewear collection</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace('/')}>
            <Text style={styles.shopBtnText}>Browse Collection →</Text>
          </TouchableOpacity>
        </View>

      ) : (

        /* -- 2.2 กรณีมีสินค้าในตะกร้า -- */
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            
            {/* ฝั่งซ้าย: แสดงรายการสินค้าที่เลือกไว้ */}
            <View style={styles.itemsSection}>
              <Text style={styles.sectionLabel}>
                {totalQuantity} item{totalQuantity !== 1 ? 's' : ''} in your cart
              </Text>
              
              {/* วนลูป (map) ข้อมูล cartItems ออกมาวาดเป็นการ์ดสินค้าทีละชิ้น */}
              {cartItems.map((item, index) => {
                const itemTotal = getUnitPrice(item) * item.quantity;
                return (
                  <View key={`${item.id}-${index}`} style={styles.cartCard}>
                    <Image source={{ uri: item.image || item.image_url }} style={styles.itemImage} />
                    
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.unitPrice}>{item.price} / unit</Text>
                      
                      {/* แผงควบคุมปุ่ม บวก/ลบ สินค้า */}
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
                    
                    {/* ปุ่มกากบาท ลบสินค้า */}
                    <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)}>
                      <Text style={styles.removeBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* ฝั่งขวา: การ์ดสรุปยอดชำระเงิน (Order Summary) */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              {/* สรุปยอดรวมราคาสินค้า */}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items ({totalQuantity})</Text>
                <Text style={styles.summaryValue}>฿{calculateTotal().toLocaleString()}</Text>
              </View>
              
              {/* ค่าจัดส่ง */}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={[styles.summaryValue, { color: C.green }]}>Free</Text>
              </View>
              
              <View style={styles.divider} />
              
              {/* ยอดสุทธิ */}
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>฿{calculateTotal().toLocaleString()}</Text>
              </View>
              
              {/* ปุ่ม Checkout ยืนยันคำสั่งซื้อ */}
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

// ----------------------------------------------------
// ส่วนจัดการความสวยงาม (CSS/Styles)
// (บอกอาจารย์ว่าจัดเรียงโค้ด UI ไว้ล่างสุดเพื่อให้โค้ดดูสะอาด อ่านง่าย)
// ----------------------------------------------------
const styles = StyleSheet.create({
  // ... โค้ดสไตล์ทั้งหมดทำงานเหมือน CSS ใช้จัดการ สี ขนาด และระยะห่างต่างๆ ครับ ...
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