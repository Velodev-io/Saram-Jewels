import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { id, selectedColor, selectedSize } = action.payload;
      const existingItem = state.items.find(item => 
        item.id === id && (item.selectedColor || null) === (selectedColor || null) && (item.selectedSize || null) === (selectedSize || null)
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            (item.id === id && (item.selectedColor || null) === (selectedColor || null) && (item.selectedSize || null) === (selectedSize || null))
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload }]
        };
      }
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item =>
          !(item.id === action.payload.id &&
            (item.selectedColor || null) === (action.payload.selectedColor || null) &&
            (item.selectedSize || null) === (action.payload.selectedSize || null))
        )
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id &&
          (item.selectedColor || null) === (action.payload.selectedColor || null) &&
          (item.selectedSize || null) === (action.payload.selectedSize || null)
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'UPDATE_VARIANT': {
      const { id, oldColor, oldSize, newColor, newSize } = action.payload;
      
      // 1. Find the item we are changing
      const itemToUpdate = state.items.find(item => 
        item.id === id && 
        (item.selectedColor || null) === (oldColor || null) && 
        (item.selectedSize || null) === (oldSize || null)
      );
      
      if (!itemToUpdate) return state;

      // 2. Calculate new price from variants
      const matchingVariant = itemToUpdate.variants?.find(v => 
        (v.color === (newColor || itemToUpdate.selectedColor) || !v.color) && 
        (v.size === (newSize || itemToUpdate.selectedSize) || !v.size)
      );
      const newPrice = matchingVariant?.price || itemToUpdate.price;

      // 3. Check if target variant already exists in cart (Merge Logic)
      const existingTargetItem = state.items.find(item => 
        item.id === id && 
        (item.selectedColor || null) === (newColor || itemToUpdate.selectedColor || null) && 
        (item.selectedSize || null) === (newSize || itemToUpdate.selectedSize || null) &&
        item !== itemToUpdate
      );

      if (existingTargetItem) {
        // Remove old item, add its quantity to existing target
        return {
          ...state,
          items: state.items
            .filter(item => item !== itemToUpdate)
            .map(item => item === existingTargetItem 
              ? { ...item, quantity: item.quantity + itemToUpdate.quantity } 
              : item
            )
        };
      }

      // 4. Otherwise just update the current item
      return {
        ...state,
        items: state.items.map(item => 
          item === itemToUpdate 
            ? { 
                ...item, 
                selectedColor: newColor || item.selectedColor, 
                selectedSize: newSize || item.selectedSize,
                price: newPrice 
              } 
            : item
        )
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'ADD_TO_WISHLIST':
      const existingWishlistItem = state.wishlist.find(item => item.id === action.payload.id);
      if (!existingWishlistItem) {
        return {
          ...state,
          wishlist: [...state.wishlist, action.payload]
        };
      }
      return state;

    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.id !== action.payload)
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  // Initialize state directly from localStorage
  const getInitialState = () => {
    const savedCart = localStorage.getItem('cart');
    const savedWishlist = localStorage.getItem('wishlist');
    return {
      items: savedCart ? JSON.parse(savedCart) : [],
      wishlist: savedWishlist ? JSON.parse(savedWishlist) : []
    };
  };

  const [state, dispatch] = useReducer(cartReducer, getInitialState());

  // Save cart and wishlist to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
    localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
  }, [state.items, state.wishlist]);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId, selectedColor = null, selectedSize = null) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id: productId, selectedColor, selectedSize } });
  };

  const updateQuantity = (productId, quantity, selectedColor = null, selectedSize = null) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity, selectedColor, selectedSize } });
  };

  const updateVariant = (id, oldColor, oldSize, newColor, newSize) => {
    dispatch({ type: 'UPDATE_VARIANT', payload: { id, oldColor, oldSize, newColor, newSize } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const addToWishlist = (product) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
  };

  const removeFromWishlist = (productId) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
  };

  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  const isInWishlist = (productId) => {
    return state.wishlist.some(item => item.id === productId);
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const getWishlistCount = () => {
    return state.wishlist.length;
  };

  const value = {
    cart: state.items,
    wishlist: state.wishlist,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateVariant,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    isInCart,
    isInWishlist,
    getCartTotal,
    getCartCount,
    getWishlistCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
