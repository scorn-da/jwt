import axios from "axios";
import { makeAutoObservable } from "mobx";
import { API_URL } from "../http";
import { IUser } from "../models/IUser.ts";
import { AuthResponse } from "../models/response/AuthResponse.ts";
import AuthService from "../services/AuthService.ts";

export default class Store {
  user = {} as IUser;
  isAuth = false;
  isLoading = false;
  
  constructor() {
    makeAutoObservable(this);
  }
  
  setAuth(value: boolean) {
    this.isAuth = value;
  }
  
  setUser(user: IUser) {
    this.user = user;
  }
  
  setIsLoading(value: boolean) {
    this.isLoading = value;
  }
  
  async login(email: string, password: string) {
    try {
      const res = await AuthService.login(email, password);
      localStorage.setItem('token', res.data.accessToken);
      this.setAuth(true);
      this.setUser(res.data.user);
    } catch (e) {
      console.error(e.response?.data?.message)
    }
  }
  
  async registration(email: string, password: string) {
    try {
      const res = await AuthService.registration(email, password);
      localStorage.setItem('token', res.data.accessToken);
      this.setAuth(true);
      this.setUser(res.data.user);
    } catch (e) {
      console.error(e.response?.data?.message)
    }
  }
  
  async logout() {
    try {
      const res = await AuthService.logout();
      localStorage.removeItem('token');
      this.setAuth(false);
      this.setUser({} as IUser);
    } catch (e) {
      console.error(e.response?.data?.message)
    }
  }
  
  async checkAuth() {
    this.setIsLoading(true);
    try {
      const res = await axios.get<AuthResponse>(`${API_URL}/refresh`, { withCredentials: true });
      localStorage.setItem('token', res.data.accessToken);
      this.setAuth(true);
      this.setUser(res.data.user);
    } catch (e) {
      console.error(e.response?.data?.message)
    } finally {
      this.setIsLoading(false);
    }
  }
}
