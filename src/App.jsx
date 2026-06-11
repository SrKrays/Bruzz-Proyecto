import { useState, useCallback , useEffect } from 'react';
import './App.css';
import logo from './assets/logo.png';
import CategoriasPrincipales from './CategoriasPrincipales';
import Subcategorias         from './Subcategorias';
import Items, { CartChip, CartPanel }  from './Items';
import { Routes, Route } from 'react-router-dom';
import AdminPanel from './AdminPanel';

const SUBCATEGORIA_SCREENS = new Set(['comidas', 'bebidas']);

export default function App() {
  const [screen, setScreen]       = useState('home');
  const [menuKey, setMenuKey]      = useState(null);
  const [cart, setCart]            = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cartOpen, setCartOpen]         = useState(false);

  useEffect(() => {
  console.log(
`%c
⠀
⢕⢅⠧⡱⡑⢕⠜⡌⡎⡪⣸⠢⡣⡪⠢⡃⡊⡢⢍⣢⢸⡸⣌⡆⡕⢜⢜⢌⠢⡑⡸⡠⠀⠠⠀⢁⠈⠀⡁⠈⡀⢁⢀⠁⠄⠁⠄⠁⠠⠈⠠⠈⠠⠁⠄⠂⠄⢢⠨⡐⠠⢂⢂⢐⠌⡂⡂⡢⢑⢀⠂⡂⡂⡢⢢⠢⠡⡂⡪⢐⠔⢌⠔⡁⡊⠔⡑⠔⢔⠱⡘⡜⢔⢜⢔⠕⢌⠪⡢⡂
⡇⡕⡝⡜⡜⡜⠜⠜⠘⢈⢎⢎⢮⠪⡊⠔⡨⢨⣗⠢⡑⠌⡌⡽⡜⢌⢎⡢⡑⠔⢌⢲⢈⠠⠐⢀⠀⡁⠀⠄⠠⢀⠐⠠⠈⠄⠂⡁⢐⠈⠠⠈⡀⠂⡐⠠⡈⢆⠕⡈⢌⢂⢊⢐⠈⢌⠌⠔⢐⠐⠨⢐⢌⠢⡑⢌⠪⣂⠪⡐⠡⢑⢐⢐⢌⠪⡘⢜⢐⠕⡌⡪⡘⢔⠅⡇⡇⡕⢜⠀
⠃⠐⠨⠈⡈⢀⢡⢤⣢⡪⡢⡫⡪⡱⣈⢂⠢⡱⡇⡑⢌⢊⢴⢏⠜⡌⢎⣆⠣⡡⢑⠌⠮⡄⠂⠄⠂⠠⢁⢂⠁⡀⠂⡁⠐⡀⢁⠠⠀⠂⡁⠐⡀⠂⡀⢂⢊⡂⢅⢂⠪⢐⣁⣂⣅⣢⡸⣀⠂⠅⢅⢕⢐⠅⡊⡢⡣⡣⡑⢌⠌⢔⢐⠔⠔⡅⡣⢱⠨⡪⡐⢅⠕⢅⠇⠕⡱⡡⢑⢔
⠈⠠⠑⢀⠀⣼⢑⠡⡂⢍⠻⣪⣪⣢⠞⢍⢋⠳⣳⠨⡂⢥⣻⢐⠕⢌⢒⢜⣕⢔⡡⣘⠬⢪⠱⢀⢑⠨⠠⡁⢐⠀⢂⠀⡁⠠⢀⠐⠈⠠⠀⡁⠀⢂⠐⣅⢅⢌⣢⢶⢝⢯⡺⣪⡺⣪⡫⡫⡯⣗⢶⣌⡆⠕⡌⡢⡣⡣⡣⡣⡑⡑⢔⢅⢣⠪⡪⢢⢣⢱⢸⢨⢊⠢⠡⡱⡐⢌⢢⠣
⠀⠂⠈⡀⢀⢺⡐⢅⠪⡐⢅⠢⡊⢔⢡⢑⠌⡌⡪⢇⡪⢐⠜⠳⡬⣊⠔⡡⠪⣂⠐⡀⠂⡐⢀⢂⠐⢅⠕⡨⢀⠂⡂⠄⠐⠀⠄⠠⠈⢀⠐⠀⡑⡷⣼⢺⢗⢯⢮⢳⢝⢵⡹⣪⡺⣪⡺⣹⡪⡺⣜⢎⢯⡳⣜⢜⢌⢎⢮⢢⢣⠪⡢⡑⡆⢕⠸⠨⡂⢇⢇⢎⡪⣨⣘⢌⠈⠂⠊⠌
⢁⠈⡀⠄⡢⠹⢎⢔⠡⡊⢔⢑⠌⡢⢑⠢⡕⡰⠨⡊⢕⢕⡌⡪⢐⢑⠝⡲⢵⢪⣊⣂⣁⢄⢢⢢⠱⢐⣀⡂⠄⠂⠄⠂⡁⠌⢀⠂⡈⢠⢸⣻⡺⣝⢵⡫⣫⢞⡎⣗⢽⡱⣝⢮⢮⡣⡯⡺⣜⣝⢎⣏⢧⡫⡞⡷⡱⡡⡣⡃⡇⡇⡇⣇⢊⠪⠨⡊⠊⢢⢞⢝⢼⢱⢽⣑⣀⡡⠈⠌
⢀⢂⠀⢂⠠⠐⠈⡣⣕⠨⡂⠆⢕⠨⠢⡑⢌⢊⠇⢎⢆⢕⡘⡜⠦⣱⢨⢐⠔⢅⠢⡡⢃⠍⠭⣙⡝⢣⠳⡹⢧⡈⠄⠁⠄⢐⠀⢂⠠⢑⣗⢯⢺⡪⣇⢯⢎⢧⡫⡮⡳⣹⢜⢮⣺⢜⢮⡫⣎⢮⢧⢳⡣⡯⣺⡽⡇⣗⢵⢱⣣⡳⡱⡱⠐⡀⠅⡐⢈⣞⢕⡕⣇⡿⡱⣕⠗⠋⠌⠐
⡢⡑⡈⠀⠄⠂⡥⡪⡪⢳⣜⣌⠢⡑⡑⢌⠢⡑⢌⠢⡊⢔⠡⡑⢍⠌⢕⢑⢍⢎⠬⣒⢕⢕⢕⢷⡐⠡⠨⢨⢠⡃⠄⠡⢈⠠⠐⢀⢂⡿⡜⡮⣳⢹⣜⢮⡫⣗⣝⣾⡹⡪⡯⣧⣫⢯⡳⠏⠾⢽⡳⡳⡹⣯⢫⡪⡺⡸⠪⠣⠣⡳⠁⠂⠁⠀⢂⠐⢼⢪⡣⣳⢏⡮⡋⢂⠐⠐⡀⡁
⢑⠨⠀⠌⠠⠑⠀⠂⠐⠐⣕⡌⡫⠲⡱⢥⢪⣐⣅⢪⢐⢅⢪⢨⣂⢥⢕⢔⢕⠪⡩⣊⠆⡓⢁⠁⡙⡦⠡⢈⢸⢐⠈⡐⢀⠂⠌⡀⣶⡫⡮⡳⡵⣝⡎⠷⡽⢑⠓⠡⢙⠫⢃⠂⠅⢂⣨⠰⠈⠌⣷⡹⡵⢽⠪⢊⠊⠄⠂⠐⠀⠄⠂⠐⠈⠀⠄⠀⣟⢮⣺⣺⠝⠠⠈⠠⠈⠄⡰⡘
⠂⠐⠈⡀⠂⠄⢁⠁⠌⠀⠄⡙⡚⠮⣆⣕⢰⢐⢌⠪⡑⡑⢅⢃⠢⣑⢔⡔⠦⠓⠑⠀⢂⠀⡂⢐⠼⠠⢁⠂⡎⠄⢂⢐⢀⢂⠡⢀⢷⢝⢮⡫⡺⣜⡇⠐⢔⢄⣌⢌⢔⠬⠦⠚⠘⠉⢢⠨⠀⠅⢺⡺⡪⡯⡧⡀⠄⠂⠈⡀⢈⠀⠐⢀⠨⠐⢰⢋⠩⠹⡬⢻⡌⠄⡁⢌⡰⡱⡱⡱
⡐⠈⠠⠐⠈⡀⢂⠐⢈⠀⡂⠠⠈⠐⡀⠈⠌⠙⠘⡚⠚⡚⠚⡊⠋⡈⠄⠂⢁⠐⢀⠡⠀⢂⠐⡸⠡⠨⠠⢈⡇⢐⠠⠐⢀⠂⡐⠠⣻⢕⡗⣝⢽⡸⣇⢁⠂⡪⠀⢠⠀⠈⡇⠁⠒⠈⢠⡱⢈⠐⠨⣯⢺⡪⡯⣆⠀⠐⢀⠠⠀⠄⠁⠄⠂⠄⣻⠀⡪⠳⡍⡆⡹⠌⡊⢃⠊⡊⠡⠁
⡀⠌⠐⢈⠠⠐⡀⢂⠐⡀⠂⠄⡁⠁⠄⠨⠀⡁⢂⠂⡐⠈⡂⠄⢁⠠⠀⠌⢀⠐⢀⠐⢈⠠⢐⡍⢂⠡⠈⠄⡇⠂⠠⠈⠠⠐⠀⠌⣗⢗⣝⢮⡣⣏⢗⠠⠘⢔⣄⠀⢤⢑⠩⣉⠲⡜⠎⡂⡐⠈⠌⣗⢗⡵⡝⣞⣆⠁⡀⠄⠐⡀⠅⠨⠠⢁⡜⢐⠨⠐⡭⠪⠡⡁⡐⢀⠂⠄⠡⠈
⠀⡂⠡⠐⡀⢂⠐⡀⠂⠄⠡⠐⢀⠡⠈⡀⠂⠄⠂⡀⠂⡐⢀⠐⠀⠄⠂⡐⠀⡂⠄⠂⡀⢂⢸⠐⡀⢂⠡⠁⢯⠀⠂⢁⠀⠂⠁⠄⢽⢵⢕⢧⡫⣎⢿⡌⠨⢐⠊⠝⠱⠨⢐⠠⠑⡐⣐⣄⣒⠥⡈⣯⡣⣗⢝⢮⡺⡦⠀⠄⢁⠠⠀⠅⠨⡰⡁⠂⠄⠅⡯⢈⢂⠐⡀⡂⠌⡈⠌⠨
⢂⠐⡈⠄⠂⡐⠐⡀⠡⢈⠐⢈⠠⠐⠀⠂⡁⠐⡀⠂⢁⠠⠀⠂⡁⠄⡁⠄⠂⠄⠂⡁⢐⠀⡗⡐⠠⠁⠄⠅⢹⠄⠁⢄⣂⣡⣐⡠⠸⣳⡹⣕⣝⢮⢮⣳⠡⡃⣵⣟⣾⠨⠰⠐⢱⣎⢼⣽⠞⢌⠔⢸⡺⣪⣏⢧⢟⠾⠁⠐⡀⢐⠈⢌⢰⢃⠂⠡⡈⠄⣏⠢⠂⡂⢂⢔⠀⡂⠌⠄
⠀⠂⡀⠄⠁⠄⢂⠐⡈⠠⠐⡀⢂⢈⠈⠄⠄⠁⠄⡈⠄⠐⢈⠠⠐⠀⠄⠂⡁⢂⢁⠐⡀⢂⢳⠀⠅⡁⠅⠨⠐⡣⠋⠅⢂⠐⡀⡊⠩⣳⢽⢗⢮⢳⢷⡹⡅⠅⡘⢚⢷⢓⢹⢋⡹⠆⠎⢑⠈⠄⢂⠑⡯⡾⢈⠳⠿⠦⣁⢔⠴⠦⠮⡤⡎⡐⢈⢐⠠⢸⢁⠊⡀⢂⢐⠀⠄⠄⠂⡈
⢈⠠⠀⢂⠡⠈⠄⠂⠄⡁⢂⠐⠠⠐⢈⠠⠈⠄⠁⠄⠠⠁⠄⠂⡈⠄⡁⢂⠐⠠⠐⠐⠈⡀⠺⡌⡐⡀⠊⠄⡁⡂⠡⢁⠂⠌⠠⠠⠁⠌⠟⠌⢟⣮⠯⠙⢃⠡⠐⡀⢂⠐⠄⠡⠐⡈⡐⢐⠈⡐⢐⠠⠨⠈⠄⢂⠂⠌⡈⡐⢐⠐⢐⠈⡐⢐⢀⢂⢐⡜⡀⢂⠠⠁⢂⠈⠠⠐⠀⠄
⠀⠄⠂⡀⠄⠂⢈⠀⢂⠠⠠⠈⠄⠡⠐⢀⠡⠈⠠⠁⠂⡁⠄⠁⠄⠢⠂⡂⠌⡐⠈⠄⠂⠠⠀⠹⢤⡠⣁⠂⡂⠄⡁⡂⠨⠠⠡⠈⠌⠠⠡⠈⠄⠌⠌⠨⡀⡂⠡⠐⡐⠨⠠⡁⡂⡂⠔⢐⠐⣐⠆⠂⠌⠄⠅⢢⠨⠐⡀⢂⠐⡈⠄⠂⡂⢂⢐⣄⠞⠠⠐⠀⠄⢈⠀⡐⢀⠂⡁⡐
⠂⠐⠀⠄⠂⢈⠠⠈⠀⠠⠀⠂⠈⢀⠈⠀⠄⠈⠄⠁⠂⠀⠄⠁⡈⢀⠁⠠⠐⠀⡈⠄⠂⠐⢈⠠⠀⡈⠕⠦⣂⢅⠄⡂⠡⠈⢄⢅⡬⠨⠀⠅⠡⠈⠄⠡⠠⠑⠥⣁⢐⠨⠐⡈⢐⢈⢐⠤⢚⢀⠂⠅⠌⡐⢈⠐⣧⡁⠔⠠⢁⢐⢈⠐⡀⣂⠖⠅⠅⠡⢈⠂⠅⠂⠌⢀⠂⠁⠄⠂
⠂⠁⠐⠀⠌⠀⠠⠀⡁⠄⠂⢀⠁⢀⠀⠂⠀⠂⠀⠂⠈⠀⡀⠂⠀⡀⠐⢀⠐⠀⠄⠠⠈⢠⠠⠠⠐⠠⠐⠠⠀⠅⡩⠙⡉⠋⠅⡽⢀⠂⠅⡇⡁⠅⡁⠅⠌⠄⠡⠠⢉⠊⡒⢂⠣⠊⠡⢈⠄⢂⠨⠀⠅⡐⠠⣱⠅⠊⠙⡑⢒⠒⡒⠚⡊⠡⢈⠐⢈⠐⡀⠂⠄⢁⠂⠄⠂⢁⠐⢀
⢀⠈⢀⠁⠠⠈⠀⠄⠀⠄⠠⠀⠠⠀⠀⠂⠁⠀⠈⠀⡀⠁⠀⠀⠂⢀⠈⡀⠠⡐⠐⠁⡁⢁⠐⢈⠠⠁⠌⠠⠁⠂⠄⠂⠠⢁⢸⠅⠂⠌⠠⠑⡆⡂⢐⠈⠄⡁⠅⠌⠠⢂⠐⡀⡂⡁⠅⢂⢐⠠⠂⡁⠅⠤⢓⠉⣆⠄⠁⡀⠄⠂⡀⠡⠀⠌⡀⢐⠀⡂⠄⠂⢈⠀⠄⠂⢈⠀⡐⠀
⠀⠠⠀⠐⠀⡀⠁⡀⠂⠀⠄⠠⠀⡀⡁⡠⠠⠈⠄⠂⠄⢄⠢⠡⠊⠄⡁⠂⡁⠄⠨⠠⠐⢀⠐⠠⠐⠈⡀⠂⢁⠨⠀⠌⠐⠀⢜⠄⠡⠨⢈⠐⡈⠕⠢⠪⡰⠔⡌⠆⠅⢂⢐⢀⢂⠐⡈⠄⡐⠀⠅⡐⠈⠌⡀⡂⢼⡀⠄⠠⠐⠀⢂⠈⠄⠁⠄⠂⠠⢀⠐⡈⠀⡀⠂⠈⠀⡀⢀⠐
⠐⡀⢂⢁⢂⠐⡐⠐⡈⢐⠁⠌⠐⡀⢂⠠⠐⠈⡀⠡⠐⢀⠐⠐⠐⠠⠐⠠⠀⢂⠐⠠⠈⠠⠐⢀⠂⢁⠠⠈⡀⠄⠂⠄⠁⠌⢸⠠⠑⡈⠄⢂⠂⠌⠄⠅⡐⡀⢂⠂⠡⠐⡀⠂⠄⡂⢐⠐⠠⠁⠅⠄⠡⠁⠄⢂⢸⡂⠄⠂⠄⡁⢂⠐⢈⠀⡂⢁⠐⡀⠄⠂⠠⠀⠂⠁⠄⠠⠀⠠
⡂⠔⢀⠂⠄⠂⠄⠡⠐⡀⠂⠌⡀⠂⠄⠐⡀⠡⠐⢀⠡⠀⠌⠀⠅⠂⡈⠄⠈⠄⠠⠁⡈⠄⢈⠀⠐⠀⠄⠂⡀⠐⡀⠂⠁⠄⠈⢧⠡⠐⡈⠄⢂⠁⡂⠡⢀⢂⠐⡈⠄⠅⠄⠅⢂⠢⡢⠨⠐⡁⠌⠄⠡⠡⠈⢄⡺⢀⠂⡁⢂⠐⠠⠈⠄⢂⠐⡀⠂⠠⠐⠈⠀⠄⠁⠈⡀⠄⠂⠀
⠐⡈⠄⢂⠡⠨⠈⠄⠅⢂⠁⡂⠄⠡⠈⠄⠂⡐⠈⡀⠄⠂⡈⠄⠂⡐⠀⠄⠡⠐⡀⡁⠠⠐⠀⠄⠡⠈⠄⢂⠠⠁⠄⠨⠐⢈⠐⣸⡻⣔⡄⠌⡀⡂⠄⠅⢂⠐⡐⠐⡈⢐⢈⠐⡀⡂⠌⠠⢁⢐⠠⠁⠅⡨⣬⡞⠈⠄⢂⠐⠠⠈⠄⠡⢈⠠⠠⠐⠈⢀⠐⠈⠀⠐⠈⠀⠀⡀⠠⠐
⡂⡐⡈⠄⢂⠡⠁⠅⠌⡐⢐⠠⠈⠄⡁⢂⠁⠄⢂⠐⡀⠅⡀⢂⠡⠐⡈⠄⡁⡂⡐⠠⠁⠌⠨⠠⠁⢅⠨⢀⠂⠌⠄⡡⠈⠄⢂⠘⣮⢎⢯⢯⣲⢴⣨⣐⡐⡐⠠⢁⢐⠠⠂⢂⢐⠠⠨⢈⢄⣂⣔⢵⢳⢫⡗⠕⠚⠘⠢⢌⢄⢁⠈⡐⠀⠄⠐⠀⡈⢀⠀⠂⠁⡀⠂⠈⡀⠄⠠⠀
⡐⡀⠂⠌⡐⠠⢁⠅⢂⢂⠡⠐⡁⠅⢂⠂⠌⠄⠅⢂⢐⢐⠠⠡⠠⠡⢐⠐⡐⠠⢂⠡⠁⢅⠡⢁⠊⠌⡂⠢⠨⢐⠡⠠⠡⢁⢂⠂⠌⣛⡮⣪⢪⢝⢆⡇⡏⣏⢯⢳⢳⢺⢺⢲⢳⢹⡹⡹⡱⡕⣵⢱⡓⡯⢦⢤⣀⠐⠈⠀⠈⡈⠑⠔⢄⣂⢀⠁⢀⠀⠄⠂⠁⡀⠄⢁⠠⢀⠐⡀
⢐⠠⠡⢁⠂⠅⡂⠌⡐⠄⠌⡂⡂⠅⡂⠌⡂⠅⢌⢐⢐⠠⠨⢐⠁⢅⠢⠨⠠⠡⠊⡾⣨⢆⢂⠅⠌⡂⠌⠌⡨⢀⠂⠅⡊⡐⢐⢨⡺⣱⢱⣵⡫⡳⠗⠵⠽⢼⢜⡮⣪⣣⣫⢎⡧⠷⠵⢛⠚⠉⡈⠉⠚⢮⢧⢳⢹⡣⣆⠈⠀⡀⠐⠀⠠⠀⠉⠘⠰⠤⣂⠠⠁⠄⡐⢀⠂⠄⢂⠠
⡐⠨⠠⠡⡈⡂⡂⠅⡂⠅⠅⡂⠂⠅⡂⠅⠂⠅⡂⢂⠂⠌⠌⢄⢑⢐⠨⠨⠨⢈⠺⡼⡪⡹⡔⠈⠔⠠⠡⡁⣂⡢⡡⠥⠢⠒⢵⢏⢮⣪⠃⡀⠀⡀⠀⠄⠈⠀⡀⠠⠀⢀⠀⡀⠄⠐⠀⡀⠄⠠⠀⠐⠀⠠⠈⢻⡜⣜⢽⠄⠠⠀⡀⠁⠠⠐⠈⠀⠄⢀⠀⠉⠙⠒⠔⡔⣈⢐⠠⠂
⠂⠡⠁⠅⡐⡀⡂⠡⢐⠨⢐⠠⠡⢁⢂⠡⠁⠅⡂⠅⠌⠌⠌⡐⠠⠂⠌⡐⢡⢡⢢⣫⢪⠪⡖⠕⠓⠉⠉⠉⠀⡀⠄⢀⠐⠀⣟⢜⡕⡧⠀⠠⠀⠠⠀⠂⠈⠀⡀⠠⠐⠀⠀⡀⠀⠄⠂⠀⡀⠄⠐⠀⠁⡀⠂⢸⡣⣣⢳⢇⠐⠀⢀⠈⠀⡀⠄⠂⠀⠄⢀⠈⢀⠐⠀⠠⠈⠑⠊⠦
⠌⠨⠠⠡⠐⡀⢂⢁⢂⢐⠐⡈⠄⠡⠐⡈⠨⢐⠠⠡⠨⠈⠔⡈⠄⢅⠗⠉⠁⠁⠁⢸⢸⠱⡅⠀⠄⠂⠁⠀⠁⠀⡀⢀⠠⠈⣗⠵⣍⢗⠀⠂⠈⢀⠀⠂⠈⢀⠀⠄⠀⠄⠁⠀⠠⠀⠐⠀⡀⠠⠐⠈⠀⢀⢠⡟⡼⡸⣼⠁⢀⠈⠀⠀⠂⠀⢀⠀⠂⠀⠄⠀⠄⠀⠐⠀⠐⠀⠂⠀
⠡⠁⠌⠠⢁⢐⠐⠠⠐⡀⠂⠄⠡⢁⠂⡂⡁⡂⠄⠅⠌⠌⡐⣐⠬⠚⠀⡈⠀⠁⠐⢸⢸⢘⠎⠀⠠⠀⠂⠁⠈⠀⡀⢀⠀⢀⠺⣝⣜⢎⣧⠀⠁⢀⠀⠂⠁⢀⠠⠀⠂⠀⠂⠁⠀⠂⠁⢀⠀⠄⠀⠄⠈⠀⣸⡾⣾⣋⣁⣴⢴⡄⠈⠀⠂⠁⢀⠠⠈⠀⠐⠀⠐⠈⠀⡈⠀⠂⠈⢀
⠄⠡⢁⠁⡂⢐⠈⠄⠡⠠⠁⠅⠡⠐⡀⡂⡐⡀⡊⠄⡑⡈⡐⡜⠀⠐⠀⠠⠈⠀⠁⣸⢸⡸⠐⠈⠀⠀⠂⢀⠁⠠⠀⢀⡶⡶⣴⢤⣾⣻⡽⡄⠈⠀⡀⠐⠈⠀⠀⠠⠀⢁⠀⠂⠁⠀⠂⢀⠠⠀⠂⠠⠈⠠⡾⡽⠓⢯⠿⠞⠏⢁⠀⢁⠀⠂⢀⠀⠄⠈⡀⢈⠀⠂⠁⠀⠐⠈⠀⡀
⠨⠐⡀⢂⢐⠐⡈⠨⠠⠡⠨⠈⠄⠅⡂⡐⡐⡐⠠⡁⡂⡂⡂⢯⡀⠂⠁⠢⢂⡈⢠⢇⢇⠇⠐⠀⢈⠀⡈⠀⡀⠄⠂⠀⠛⠽⠞⠟⠞⠅⠛⠁⢈⠀⠀⠄⠂⠈⠀⠄⠂⠀⠠⠐⠈⠀⡈⠀⠀⠠⠐⠀⠐⠀⠐⠀⠠⠀⠠⠐⠀⠠⠀⠄⢀⠈⠀⢀⠀⠂⠀⡀⠠
% Oh No Hermano`,
'color: #00ffcc; font-family: monospace; font-size: 10px;',
  );
}, []);

  const navigate = useCallback((screenId) => setScreen(screenId), []);

  const showItems = useCallback((key) => {
    setMenuKey(key);
    setScreen('items');
  }, []);

  const handleCategoria = useCallback((screenId) => {
    if (screenId === 'postres') { setMenuKey('postres'); setScreen('items'); return; }
    if (screenId === 'tragos')  { setMenuKey('tragos');  setScreen('items'); return; }
    if (screenId === 'cafeteria') { setMenuKey('cafeteria'); setScreen('items'); return; }
    setScreen(screenId);
  }, []);

  // ── Carrito: agregar (con qty y note opcionales) ─────
const handleCartAdd = useCallback((item) => {
  const qty             = item.qty             ?? 1;
  const note            = item.note            ?? '';
  const medallon        = item.medallon        ?? '';
  const sintaccVariedad = item.sintaccVariedad ?? '';
  // Clave única: nombre + nota + medallón + variedad sinTacc
  const key = item.name + '||' + note + '||' + medallon + '||' + sintaccVariedad;
  setCart((prev) => {
    const exists = prev.find((c) => c._key === key);
    if (exists) {
      return prev.map((c) =>
        c._key === key ? { ...c, qty: c.qty + qty } : c
      );
    }
    return [...prev, { _key: key, name: item.name, price: item.price, note, medallon, sintaccVariedad, sinTacc: item.sinTacc ?? false, qty }];
  });
}, []);

  // ── Carrito: quitar una unidad ───────────────────────
  const handleCartRemove = useCallback((key) => {
    setCart((prev) =>
      prev
        .map((c) => (c._key === key ? { ...c, qty: c.qty - 1 } : c))
        .filter((c) => c.qty > 0)
    );
  }, []);

  // ── Carrito: vaciar ──────────────────────────────────
  const handleCartClear = useCallback(() => setCart([]), []);

  const renderScreen = () => {
    if (screen === 'home') {
      return <CategoriasPrincipales onNavigate={handleCategoria} />;
    }
    if (SUBCATEGORIA_SCREENS.has(screen)) {
      return (
        <Subcategorias
          seccion={screen}
          onNavigate={navigate}
          onShowItems={showItems}
        />
      );
    }
    if (screen === 'items') {
      return (
        <Items
          menuKey={menuKey}
          onNavigate={navigate}
          cart={cart}
          onCartAdd={handleCartAdd}
          onCartRemove={handleCartRemove}
          onCartClear={handleCartClear}
          showCheckout={showCheckout}
          onOpenCheckout={() => setShowCheckout(true)}
          onCloseCheckout={() => setShowCheckout(false)}
          cartOpen={cartOpen}
          onOpenCart={() => setCartOpen(true)}
          onCloseCart={() => setCartOpen(false)}
        />
      );
    }
    return <CategoriasPrincipales onNavigate={handleCategoria} />;
  };

 return (
    <Routes>
      <Route path="/admin/*" element={<AdminPanel />} />
      <Route path="/*" element={
        <div className="bruzz-app">
          <div className="wave" />
          <header className="header">
            <div className="logo-ring">
              <img src={logo} alt="Bruzz Pizza & Beer" />
            </div>
            <p className="tagline">Carta Digital · 2026</p>
            <CartChip cart={cart} onOpen={() => setCartOpen(true)} />
          </header>
          {renderScreen()}
          {cartOpen && (
            <CartPanel
              cart={cart}
              onClose={() => setCartOpen(false)}
              onCartAdd={handleCartAdd}
              onCartRemove={handleCartRemove}
              onCartClear={handleCartClear}
              onCheckout={() => {
                setCartOpen(false);
                setShowCheckout(true);
                if (screen !== 'items') { setScreen('items'); }
              }}
            />
          )}
        </div>
      } />
    </Routes>
  );
}
