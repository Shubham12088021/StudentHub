import { createContext, useContext, useState, useEffect } from 'react';

// Theme Context
const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('shTheme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('shTheme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(p => !p) }}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => useContext(ThemeContext);

// Cart Context
const CartContext = createContext();
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shCart')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('shCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (course) => {
    if (cart.find(c => c._id === course._id)) return false;
    setCart(prev => [...prev, course]);
    return true;
  };

  const removeFromCart = (courseId) => {
    setCart(prev => prev.filter(c => c._id !== courseId));
  };

  const clearCart = () => setCart([]);

  const isInCart = (courseId) => cart.some(c => c._id === courseId);

  const cartTotal = cart.reduce((sum, c) => sum + (c.discountPrice || c.price), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isInCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => useContext(CartContext);
