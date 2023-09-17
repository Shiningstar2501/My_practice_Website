import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSlice, configureStore, createAsyncThunk } from '@reduxjs/toolkit';
import api from './api'; // Assume you have an 'api' file with your backend API calls

// API Thunks
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await api.get('/users');
  return response.data;
});

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }
);

export const createUser = createAsyncThunk('users/createUser', async (user) => {
  const response = await api.post('/users', user);
  return response.data;
});

export const updateUser = createAsyncThunk('users/updateUser', async (user) => {
  const response = await api.put(`/users/${user.id}`, user);
  return response.data;
});

export const deleteUser = createAsyncThunk('users/deleteUser', async (userId) => {
  await api.delete(`/users/${userId}`);
  return userId;
});

// Redux Slice
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    user: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex((user) => user.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const userId = action.payload;
        state.users = state.users.filter((user) => user.id !== userId);
      });
  },
});

const store = configureStore({
  reducer: usersSlice.reducer,
});

// Components
const UserList = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDeleteUser = (userId) => {
    dispatch(deleteUser(userId));
  };

  return (
    <div>
      <h1>User List</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>
                <button onClick={() => handleViewUser(user.id)}>View</button>
                <button onClick={() => handleEditUser(user.id)}>Edit</button>
                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const UserForm = ({ match }) => {
  const dispatch = useDispatch();
  const { userId } = match.params;
  const isEditMode = !!userId;
  const [user, setUser] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchUserById(userId)).then((response) => {
        setUser(response.payload);
      });
    }
  }, [dispatch, isEditMode, userId]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode) {
      dispatch(updateUser(user)).then(() => {
        history.push('/');
      });
    } else {
      dispatch(createUser(user)).then(() => {
        history.push('/');
      });
    }
  };

  return (
    <div>
      <h1>{isEditMode ? 'Update User' : 'Create User'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={user.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={user.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={user.phoneNumber}
            onChange={handleChange}
          />
        </div>
        <button type="submit">
          {isEditMode ? 'Update User' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

const UserView = ({ match }) => {
  const dispatch = useDispatch();
  const { userId } = match.params;
  const user = useSelector((state) => state.users.user);

  useEffect(() => {
    dispatch(fetchUserById(userId));
  }, [dispatch, userId]);

  return (
    <div>
      <h1>User Details</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.phoneNumber}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const App = () => {
  return (
    <div>
      <UserList />
      <UserForm />
      <UserView />
    </div>
  );
};

export default App;
