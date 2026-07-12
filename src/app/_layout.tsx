import { Drawer } from 'expo-router/drawer';
import 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <Drawer 
      screenOptions={{ 
        drawerActiveTintColor: '#B5838D', 
        headerTitle: 'MING OPTIC',
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#B5838D',
          fontSize: 22,
          letterSpacing: 2
        },
        headerTitleAlign: 'center',
      }}
    >
      {/* 1. หน้าแรก (Home) */}
      <Drawer.Screen 
        name="index" 
        options={{ drawerLabel: '🏠  Home (Products)', title: 'MING OPTIC' }} 
      />

      {/* 2. หน้าค้นหา (Search) */}
      <Drawer.Screen 
        name="search" 
        options={{ drawerLabel: '🔍  Search Glasses', title: 'Search Products' }} 
      />

      {/* 3. หน้าสต็อกสินค้า (Products) */}
      <Drawer.Screen 
        name="products" 
        options={{ drawerLabel: '📦  All Products Stock', title: 'Stock Inventory' }} 
      />

      {/* 4. หน้าคู่มือระบบและประวัติผู้พัฒนา (Explore) */}
      <Drawer.Screen 
        name="explore" 
        options={{ drawerLabel: 'ℹ️  How it Works / Profile', title: 'System Guide' }} 
      />
    </Drawer>
  );
}