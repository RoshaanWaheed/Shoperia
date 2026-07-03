import { configureStore } from '@reduxjs/toolkit'
import { productsApi } from './productsApi'
import authReducer from './authSlice'
import cartReducer from './cartSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    [productsApi.reducerPath]: productsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productsApi.middleware),
})

export default store