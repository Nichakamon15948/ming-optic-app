import { Drawer } from 'expo-router/drawer';

export default function RootLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerActiveTintColor: '#C9A84C',
        headerShown: false,
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
      <Drawer.Screen 
        name="cart" 
        options={{ title: 'Cart', drawerItemStyle: { display: 'none' } }} 
      />
      <Drawer.Screen 
        name="explore" 
        options={{ title: 'Explore', drawerItemStyle: { display: 'none' } }} 
      />
      <Drawer.Screen 
        name="products" 
        options={{ title: 'Products', drawerItemStyle: { display: 'none' } }} 
      />
      <Drawer.Screen 
        name="search" 
        options={{ title: 'Search', drawerItemStyle: { display: 'none' } }} 
      />
    </Drawer>
  );
}