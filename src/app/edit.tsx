import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_BASE_URL } from '../constants/api';

const C = {
  bg: '#0F172A', surface: '#1E293B', surface2: '#263548',
  border: '#334155', gold: '#C9A84C', text: '#F1F5F9', textMuted: '#94A3B8', red: '#EF4444',
};

export default function EditProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [productId, setProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.product) {
      try {
        const item = JSON.parse(decodeURIComponent(params.product as string));
        setProductId(item.id);
        setName(item.name || '');
        // เก็บราคาเป็นตัวเลขล้วนๆ
        const rawPrice = String(item.price || '').replace(/[^0-9.]/g, '');
        setPrice(rawPrice);
        setStock(String(item.stock || ''));
        setImage(item.image || item.image_url || '');
      } catch (e) { console.error(e); }
    }
  }, [params.product]);

  const handlePriceChange = (text: string) => {
    const num = text.replace(/[^0-9.]/g, '');
    setPrice(num);
  };

  const handleSaveEdit = async () => {
    if (!name || !price || !stock || !image) {
      Alert.alert('Warning', 'Please fill in all fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      // ส่งราคาเป็นตัวเลขล้วนๆ (ไม่มี ฿ หรือ ,)
      const cleanPrice = price.replace(/[^0-9.]/g, '');
      const cleanStock = stock.replace(/[^0-9]/g, '');

      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, stock: cleanStock, price: cleanPrice, image })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (typeof window !== 'undefined' && window.alert) {
          window.alert('Product updated successfully!');
        }
        router.replace(`/?admin=true&refresh=${Date.now()}`);
      } else {
        Alert.alert('Error', data.error || data.message || 'Failed to update product.');
      }
    } catch (e) {
      Alert.alert('Error', 'Cannot connect to server.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>MING OPTIC</Text>
        <Pressable style={styles.backBtn} onPress={() => router.replace('/?admin=true')}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={styles.formWrapper}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Edit Eyewear</Text>
            <Text style={styles.formSub}>Update the product details below.</Text>
            {productId && (
              <View style={styles.idChip}>
                <Text style={styles.idChipText}>{'Editing ID: ' + productId}</Text>
              </View>
            )}
          </View>

          <Text style={styles.label}>PRODUCT NAME</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={C.textMuted} />

          <Text style={styles.label}>PRICE</Text>
          <TextInput style={styles.input} value={price} onChangeText={handlePriceChange} keyboardType="numeric" placeholderTextColor={C.textMuted} />

          <Text style={styles.label}>STOCK (UNITS)</Text>
          <TextInput style={styles.input} value={stock} onChangeText={t => setStock(t.replace(/[^0-9]/g, ''))} keyboardType="numeric" placeholderTextColor={C.textMuted} />

          <Text style={styles.label}>IMAGE URL</Text>
          <TextInput style={styles.input} value={image} onChangeText={setImage} placeholderTextColor={C.textMuted} />

          <Pressable
            style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
            onPress={handleSaveEdit}
            disabled={isSubmitting}
          >
            <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Text>
          </Pressable>

          <Pressable style={styles.cancelBtn} onPress={() => router.replace('/?admin=true')}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
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
  backBtn: {
    backgroundColor: C.surface2, paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 8, borderWidth: 1, borderColor: C.border,
  },
  backBtnText: { color: C.textMuted, fontSize: 13, fontWeight: '600' },
  formWrapper: { maxWidth: 560, alignSelf: 'center', width: '90%', paddingTop: 30 },
  formHeader: { marginBottom: 28 },
  formTitle: { color: C.gold, fontSize: 22, fontWeight: '900' },
  formSub: { color: C.textMuted, fontSize: 13, marginTop: 6 },
  idChip: {
    alignSelf: 'flex-start', marginTop: 12,
    backgroundColor: C.surface2, paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: C.border,
  },
  idChipText: { color: C.textMuted, fontSize: 12, fontWeight: '600' },
  label: { color: C.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 7, marginTop: 18 },
  input: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    padding: 13, borderRadius: 10, fontSize: 15, color: C.text, outlineStyle: 'none',
  },
  saveBtn: {
    backgroundColor: C.gold, padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 30,
  },
  saveBtnDisabled: { backgroundColor: '#5a4a1e' },
  saveBtnText: { color: '#0F172A', fontWeight: '900', fontSize: 16 },
  cancelBtn: { alignItems: 'center', marginTop: 14, padding: 8 },
  cancelBtnText: { color: C.textMuted, fontSize: 14 },
});