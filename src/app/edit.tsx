import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function EditProductScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [image, setImage] = useState('');
    const [productId, setProductId] = useState(null);

    useEffect(() => {
        if (params.product) {
            try {
                const item = JSON.parse(decodeURIComponent(params.product));
                setProductId(item.id);
                setName(item.name || '');
                setPrice(item.price || '');
                setStock(String(item.stock || ''));
                setImage(item.image || '');
            } catch (e) {
                console.error(e);
            }
        }
    }, [params.product]);

    const handlePriceChange = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        if (numericValue === '') {
            setPrice('');
        } else {
            const formattedPrice = '฿' + Number(numericValue).toLocaleString();
            setPrice(formattedPrice);
        }
    };

    const handleSaveEdit = () => {
        if (!name || !price || !stock || !image) {
            Alert.alert('Warning', 'Please fill in all fields completely.');
            return;
        }

        const updatedProduct = {
            id: productId,
            name: name,
            price: price,
            stock: stock,
            image: image
        };

        const productString = encodeURIComponent(JSON.stringify(updatedProduct));
        router.replace(`/?admin=true&updatedProduct=${productString}`);
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
                <Text style={styles.headerTitle}>✏️ Edit Eyewear</Text>
                <Text style={styles.subTitle}>Update the details of the glasses below.</Text>

                <Text style={styles.label}>Product Name</Text>
                <TextInput 
                    style={styles.input} 
                    value={name} 
                    onChangeText={setName} 
                />

                <Text style={styles.label}>Price</Text>
                <TextInput 
                    style={styles.input} 
                    value={price} 
                    onChangeText={handlePriceChange} 
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Stock (Units)</Text>
                <TextInput 
                    style={styles.input} 
                    value={stock} 
                    onChangeText={setStock} 
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Image URL</Text>
                <TextInput 
                    style={styles.input} 
                    value={image} 
                    onChangeText={setImage} 
                />

                <Pressable style={styles.submitButton} onPress={handleSaveEdit}>
                    <Text style={styles.submitButtonText}>Save Changes</Text>
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
    
    submitButton: { backgroundColor: '#F59E0B', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 25 },
    submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});