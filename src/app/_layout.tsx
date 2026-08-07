import { Drawer } from 'expo-router/drawer';

export default function RootLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerActiveTintColor: '#B5838D',
        headerTitle: 'MING OPTIC',
        headerTintColor: '#B5838D',
      }}
    >
      <Drawer.Screen 
        name="index" 
        options={{ title: 'Home / Products' }} 
      />
      <Drawer.Screen 
        name="login" 
        options={{ title: 'Admin Login' }} 
      />
      <Drawer.Screen 
        name="add" 
        options={{ title: 'Add Product', drawerItemStyle: { display: 'none' } }} 
      />
      <Drawer.Screen 
        name="edit" 
        options={{ title: 'Edit Product', drawerItemStyle: { display: 'none' } }} 
      />
    </Drawer>
  );
}