import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  user: {
    id: string;
    _id: string;
    nickname: string;
    fullName: string;
    email: string;
  } | null;
}

// Safely parse the user from localStorage if it exists
const storedUser = localStorage.getItem('user');

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: storedUser ? JSON.parse(storedUser) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthState['user'] }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logOut: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user'); 
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;