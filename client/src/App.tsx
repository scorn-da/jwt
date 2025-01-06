import './App.css'
import { observer } from "mobx-react-lite";
import { useContext, useEffect, useState } from "react";
import LoginForm from "./components/LoginForm.tsx";
import { Context } from "./main.tsx";
import { IUser } from "./models/IUser.ts";
import UserService from "./services/UserService.ts";

function App() {
  const { store } = useContext(Context);
  const [users, setUsers] = useState<IUser[]>([]);
  
  useEffect(() => {
    if (localStorage.getItem('token')) {
      store.checkAuth();
    }
  }, []);
  
  async function getUsers() {
    try {
      const res = await UserService.fetchUsers();
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  }
  
  if (store.isLoading) {
    return (
      <div>Загрузка...</div>
    );
  }
  
  if (!store.isAuth) {
    return (
      <>
        <LoginForm />
        <button onClick={getUsers}>Get users</button>
      </>
    );
  }
  
  return (
    <>
      <h1>{store.isAuth ? `User ${store.user.email}` : 'AUTHORIZE'}</h1>
      <h2>{store.user.isActivated ? 'Confirmed' : 'Email sent'}</h2>
      <button onClick={() => store.logout()}>Logout</button>
      <div>
        <button onClick={getUsers}>Get users</button>
        <ul>
          {users.map((user) => (
            <li key={user.email}>{user.email}</li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default observer(App);
