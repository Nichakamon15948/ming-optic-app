import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function AddProductScreen() {
    const router = useRouter();
    const [productId, setProductId] = useState(''); // เพิ่มตัวแปรเก็บ Product ID
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [image, setImage] = useState('');

    const handlePriceChange = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        if (numericValue === '') {
            setPrice('');
        } else {
            const formattedPrice = '฿' + Number(numericValue).toLocaleString();
            setPrice(formattedPrice);
        }
    };

    // เปลี่ยนฟังก์ชันให้เป็น async เพื่อใช้ fetch ส่งข้อมูลไปหลังบ้าน
    const handleAddProduct = async () => {
        if (!productId || !name || !price || !stock || !image) {
            Alert.alert('Warning', 'Please fill in all fields completely.');
            return;
        }

        try {
            // 1. ส่งข้อมูลไปบันทึกที่ฐานข้อมูล (MySQL) ผ่าน Backend ของเรา
            const response = await fetch('http://localhost:3008/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: productId,
                    name: name,
                    stock: stock.replace(/[^0-9]/g, ''), // แปลงให้แน่ใจว่าเป็นตัวเลข
                    image_url: image
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                Alert.alert('Error', 'Failed to save to database.');
                return;
            }

            // 2. ให้หน้าเว็บจำข้อมูลไว้โชว์ด้วย (โค้ดเดิมของคุณ)
            const newProduct = {
                id: productId,
                name: name,
                price: price,
                stock: stock,
                image: image
            };

            try {
                const existing = localStorage.getItem('ming_local_products');
                const localProducts = existing ? JSON.parse(existing) : [];
                localProducts.unshift(newProduct);
                localStorage.setItem('ming_local_products', JSON.stringify(localProducts));
            } catch (e) {}

            Alert.alert('Success', 'Product added to Database successfully!');
            const productString = encodeURIComponent(JSON.stringify(newProduct));
            router.replace(`/?admin=true&newProduct=${productString}`);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Cannot connect to server. Is backend running?');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.appTitle}>Ming Optic - Admin</Text>
                <Pressable onPress={() => router.replace('/?admin=true')} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>⬅️ Back to Home</Text>
                </Pressable>
            </View>

            <View style={styles.formCard}>
                <Text style={styles.headerTitle}>➕ Add New Eyewear</Text>
                <Text style={styles.subTitle}>Fill in the details below to add a new pair of glasses to the store.</Text>

                {/* เพิ่มช่องกรอก Product ID ตรงนี้ */}
                <Text style={styles.label}>Product ID</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="e.g. P005" 
                    placeholderTextColor="#999"
                    value={productId} 
                    onChangeText={setProductId} 
                />

                <Text style={styles.label}>Product Name</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="e.g. Classic Aviator Sunglasses" 
                    placeholderTextColor="#999"
                    value={name} 
                    onChangeText={setName} 
                />

                <Text style={styles.label}>Price</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="e.g. 1590" 
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={price} 
                    onChangeText={handlePriceChange} 
                />

                <Text style={styles.label}>Stock (Units)</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="e.g. 25" 
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={stock} 
                    onChangeText={setStock} 
                />

                <Text style={styles.label}>Image URL</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Paste image link here..." 
                    placeholderTextColor="#999"
                    value={image} 
                    onChangeText={setImage} 
                />

                <Pressable style={styles.submitButton} onPress={handleAddProduct}>
                    <Text style={styles.submitButtonText}>Add Product</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FDF6F6' },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F8E1E1' },
    appTitle: { fontSize: 18, fontWeight: 'bold', color: '#B5838D' },
    backBtn: { backgroundColor: '#F3F4F6', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15 },
    backBtnText: { color: '#4A4A4A', fontSize: 12, fontWeight: '600' },

    formCard: { backgroundColor: '#FFF', padding: 25, margin: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F8E1E1', maxWidth: 600, alignSelf: 'center', width: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#B5838D', marginBottom: 5, textAlign: 'center' },
    subTitle: { fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 20 },
    
    label: { fontSize: 14, fontWeight: '600', color: '#4A4A4A', marginBottom: 5, marginTop: 10 },
    input: { backgroundColor: '#FFF9F9', borderWidth: 1, borderColor: '#F8E1E1', padding: 12, borderRadius: 12, fontSize: 15, color: '#4A4A4A' },
    
    submitButton: { backgroundColor: '#10B981', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 25 },
    submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});