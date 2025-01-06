import { observer } from "mobx-react-lite";
import { FC, useContext, useState } from 'react';
import { Context } from "../main.tsx";

const LoginForm: FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { store } = useContext(Context);
  
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <input placeholder="Email"
             type="text"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
      />
      <input placeholder="Password"
             type="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => store.login(email, password)}>Submit</button>
      <button onClick={() => store.registration(email, password)}>Registration</button>
    </form>
  );
};

export default observer(LoginForm);
