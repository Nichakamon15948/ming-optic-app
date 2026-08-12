import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_BASE_URL } from '../constants/api';

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
        const numericValue = text.replace(/[^0-9]/g, '');
        if (numericValue === '') {
            setPrice('');
        } else {
            const formattedPrice = '฿' + Number(numericValue).toLocaleString();
            setPrice(formattedPrice);
        }
        // Clear error when user types
        if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
    };

    // Validation function - returns true if all fields are valid
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        // Product ID validation
        if (!productId.trim()) {
            newErrors.productId = 'Product ID is required.';
        } else if (!/^[A-Za-z0-9]+$/.test(productId.trim())) {
            newErrors.productId = 'Product ID must contain only letters and numbers (e.g. P004, 5).';
        }

        // Product Name validation
        if (!name.trim()) {
            newErrors.name = 'Product Name is required.';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Product Name must be at least 2 characters long.';
        }

        // Price validation
        const priceNum = price.replace(/[^0-9]/g, '');
        if (!price) {
            newErrors.price = 'Price is required.';
        } else if (!priceNum || Number(priceNum) <= 0) {
            newErrors.price = 'Price must be a positive number.';
        }

        // Stock validation
        const stockNum = stock.replace(/[^0-9]/g, '');
        if (!stock) {
            newErrors.stock = 'Stock is required.';
        } else if (!stockNum || Number(stockNum) < 0) {
            newErrors.stock = 'Stock must be a valid number (0 or more).';
        }

        // Image URL validation
        if (!image.trim()) {
            newErrors.image = 'Image URL is required.';
        } else if (!/^https?:\/\/.+/i.test(image.trim())) {
            newErrors.image = 'Image URL must start with http:// or https://';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddProduct = async () => {
        // Run validation first
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please check the form and fix the highlighted errors.');
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('Sending request to:', `${API_BASE_URL}/products`);
            const bodyData = {
                id: productId.trim(),
                name: name.trim(),
                stock: stock.replace(/[^0-9]/g, ''),
                price: price,
                image: image.trim()
            };
            console.log('Request body:', JSON.stringify(bodyData));

            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', JSON.stringify(data));

            if (response.ok && data.success) {
                Alert.alert('Success', 'Product added to Database successfully!');
                // Navigate back to home with admin mode and refresh trigger
                router.replace(`/?admin=true&refresh=${Date.now()}`);
            } else {
                const errorMsg = data.error || data.message || 'Failed to save to database.';
                Alert.alert('Error', errorMsg);
                console.error('Server error:', errorMsg);
            }
        } catch (error: any) {
            console.error('Add product error:', error);
            Alert.alert(
                'Connection Error',
                'Cannot connect to server.\n\nPlease make sure:\n1. server.js is running (node server.js)\n2. MySQL database is running'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBar}>
                <Text style={styles.appTitle}>Ming Optic - Admin</Text>
                <Pressable onPress={() => router.replace(`/?admin=true&refresh=${Date.now()}`)} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>⬅️ Back to Home</Text>
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.formCard}>
                    <Text style={styles.headerTitle}>➕ Add New Eyewear</Text>
                    <Text style={styles.subTitle}>Fill in the details below to add a new pair of glasses.</Text>

                    <Text style={styles.label}>Product ID</Text>
                    <TextInput
                        style={[styles.input, errors.productId ? styles.inputError : null]}
                        placeholder="e.g. 4 or P004"
                        placeholderTextColor="#999"
                        value={productId}
                        onChangeText={(text) => {
                            setProductId(text);
                            if (errors.productId) setErrors(prev => ({ ...prev, productId: '' }));
                        }}
                    />
                    {errors.productId ? <Text style={styles.errorText}>{errors.productId}</Text> : null}

                    <Text style={styles.label}>Product Name</Text>
                    <TextInput
                        style={[styles.input, errors.name ? styles.inputError : null]}
                        placeholder="e.g. Round Metal Sunglasses"
                        placeholderTextColor="#999"
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                        }}
                    />
                    {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

                    <Text style={styles.label}>Price</Text>
                    <TextInput
                        style={[styles.input, errors.price ? styles.inputError : null]}
                        placeholder="e.g. 1290"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={handlePriceChange}
                    />
                    {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}

                    <Text style={styles.label}>Stock (Units)</Text>
                    <TextInput
                        style={[styles.input, errors.stock ? styles.inputError : null]}
                        placeholder="e.g. 15"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={stock}
                        onChangeText={(text) => {
                            const numOnly = text.replace(/[^0-9]/g, '');
                            setStock(numOnly);
                            if (errors.stock) setErrors(prev => ({ ...prev, stock: '' }));
                        }}
                    />
                    {errors.stock ? <Text style={styles.errorText}>{errors.stock}</Text> : null}

                    <Text style={styles.label}>Image URL</Text>
                    <TextInput
                        style={[styles.input, errors.image ? styles.inputError : null]}
                        placeholder="e.g. https://example.com/image.jpg"
                        placeholderTextColor="#999"
                        value={image}
                        onChangeText={(text) => {
                            setImage(text);
                            if (errors.image) setErrors(prev => ({ ...prev, image: '' }));
                        }}
                    />
                    {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}

                    <Pressable
                        style={[styles.submitButton, isSubmitting ? styles.submitButtonDisabled : null]}
                        onPress={handleAddProduct}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? 'Adding...' : 'Add Product'}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
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
    inputError: { borderColor: '#EF4444', borderWidth: 2, backgroundColor: '#FEF2F2' },
    errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: '500' },
    submitButton: { backgroundColor: '#10B981', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 25 },
    submitButtonDisabled: { backgroundColor: '#9CA3AF' },
    submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});