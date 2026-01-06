'use client';

import { useEffect, useState } from 'react';

interface Product {
  nom: string;
  prix: number;
  image: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();

    // Set env type
    const envType = /Mobile|Android|iP(hone|od|ad)/.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
    const envSpan = document.getElementById('env-type');
    if (envSpan) {
      envSpan.textContent = envType;
    }
  }, []);

  async function loadProducts() {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to load products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  return (
    <>
      <header></header>
      <main>
        <br />
        <br />
        <br />
        <br />
        <br />
        <section id="products">
          {products.map((product, index) => (
            <div key={index} className="product">
              <img src={product.image} alt={product.nom} loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')} />
              <h3>{product.nom}</h3>
              <p className="price">{product.prix} €</p>
            </div>
          ))}
        </section>
      </main>
      <nav className="bottom-nav">
        <button className="nav-btn">🏠</button>
        <button className="nav-btn central">➕</button>
        <button className="nav-btn">👤</button>
      </nav>
      <footer>
        <div id="env">Environnement: <span id="env-type"></span></div>
        <div className="contact-buttons">
          <a href="tel:+33123456789" className="btn call-btn">📞 Appeler</a>
          <a href="https://www.snapchat.com/add/enzo.tls11" className="btn snapchat-btn">📸 Snapchat</a>
        </div>
        <p>&copy; 2026 shopuff</p>
      </footer>
    </>
  );
}
