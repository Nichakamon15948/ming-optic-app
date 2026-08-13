import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_BASE_URL } from '../constants/api';

const C = {
  bg: '#0F172A', surface: '#1E293B', surface2: '#263548',
  border: '#334155', gold: '#C9A84C', goldLight: '#E2C97E',
  text: '#F1F5F9', textMuted: '#94A3B8', red: '#EF4444', green: '#10B981',
};

export default function AddProductScreen() {
  const router = useRouter();
  const [productId, setProductId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePriceChange = (text: string) => {
    const num = text.replace(/[^0-9]/g, '');
    setPrice(num === '' ? '' : '฿' + Number(num).toLocaleString());
    if (errors.price) setErrors(p => ({ ...p, price: '' }));
  };

  const validate = (): boolean => {
    const e: { [k: string]: string } = {};
    if (!productId.trim()) e.productId = 'Product ID is required.';
    else if (!/^[A-Za-z0-9]+$/.test(productId.trim())) e.productId = 'Letters and numbers only (e.g. P004).';
    if (!name.trim()) e.name = 'Product Name is required.';
    else if (name.trim().length < 2) e.name = 'At least 2 characters.';
    if (!price || !price.replace(/[^0-9]/g, '')) e.price = 'Price is required.';
    if (!stock) e.stock = 'Stock is required.';
    if (!image.trim()) e.image = 'Image URL is required.';
    else if (!/^https?:\/\/.+/i.test(image.trim())) e.image = 'Must start with http:// or https://';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddProduct = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId.trim(), name: name.trim(),
          stock: stock.replace(/[^0-9]/g, ''), price, image: image.trim()
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Success ✓', 'Product added successfully!');
        router.replace(`/?admin=true&refresh=${Date.now()}`);
      } else {
        Alert.alert('Error', data.error || 'Failed to save product.');
      }
    } catch (e) {
      Alert.alert('Connection Error', 'Cannot connect to server.');
    } finally { setIsSubmitting(false); }
  };

  const Field = ({ label, error, children }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.errorText}>⚠ {error}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>MING OPTIC</Text>
        <Pressable style={styles.backBtn} onPress={() => router.replace(`/?admin=true&refresh=${Date.now()}`)}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={styles.formWrapper}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>➕ Add New Eyewear</Text>
            <Text style={styles.formSub}>Fill in the details below to add a product to your catalog.</Text>
          </View>

          <Field label="PRODUCT ID" error={errors.productId}>
            <TextInput
              style={[styles.input, errors.productId && styles.inputErr]}
              placeholder="e.g. P004"
              placeholderTextColor={C.textMuted}
              value={productId}
              onChangeText={t => { setProductId(t); if (errors.productId) setErrors(p => ({ ...p, productId: '' })); }}
            />
          </Field>

          <Field label="PRODUCT NAME" error={errors.name}>
            <TextInput
              style={[styles.input, errors.name && styles.inputErr]}
              placeholder="e.g. Round Metal Sunglasses"
              placeholderTextColor={C.textMuted}
              value={name}
              onChangeText={t => { setName(t); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
            />
          </Field>

          <Field label="PRICE (฿)" error={errors.price}>
            <TextInput
              style={[styles.input, errors.price && styles.inputErr]}
              placeholder="e.g. 1290"
              placeholderTextColor={C.textMuted}
              keyboardType="numeric"
              value={price}
              onChangeText={handlePriceChange}
            />
          </Field>

          <Field label="STOCK (UNITS)" error={errors.stock}>
            <TextInput
              style={[styles.input, errors.stock && styles.inputErr]}
              placeholder="e.g. 15"
              placeholderTextColor={C.textMuted}
              keyboardType="numeric"
              value={stock}
              onChangeText={t => { setStock(t.replace(/[^0-9]/g, '')); if (errors.stock) setErrors(p => ({ ...p, stock: '' })); }}
            />
          </Field>

          <Field label="IMAGE URL" error={errors.image}>
            <TextInput
              style={[styles.input, styles.inputMultiline, errors.image && styles.inputErr]}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={C.textMuted}
              value={image}
              onChangeText={t => { setImage(t); if (errors.image) setErrors(p => ({ ...p, image: '' })); }}
            />
          </Field>

          <Pressable
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleAddProduct}
            disabled={isSubmitting}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'Adding...' : '＋ Add Product'}
            </Text>
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
  formWrapper: {
    maxWidth: 560, alignSelf: 'center', width: '90%', paddingTop: 30,
  },
  formHeader: { marginBottom: 28 },
  formTitle: { color: C.gold, fontSize: 22, fontWeight: '900' },
  formSub: { color: C.textMuted, fontSize: 13, marginTop: 6, lineHeight: 18 },
  fieldGroup: { marginBottom: 6 },
  label: { color: C.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 7, marginTop: 16 },
  input: {
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    padding: 13, borderRadius: 10, fontSize: 15, color: C.text,
    outlineStyle: 'none',
  },
  inputMultiline: { minHeight: 44 },
  inputErr: { borderColor: C.red, borderWidth: 2 },
  errorText: { color: C.red, fontSize: 12, marginTop: 5 },
  submitBtn: {
    backgroundColor: C.gold, padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 30,
  },
  submitBtnDisabled: { backgroundColor: '#5a4a1e' },
  submitBtnText: { color: '#0F172A', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
});