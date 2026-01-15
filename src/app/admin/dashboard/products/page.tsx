'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: number;
  nom: string;
  prix: number;
  image: string;
  stock: number;
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ [key: number]: { prix: string; stockAdd: string } }>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number, field: 'prix' | 'stockAdd', value: string) => {
    setEditing(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const updateProduct = async (id: number) => {
    const edit = editing[id];
    if (!edit) return;

    const updates: any = {};
    if (edit.prix) updates.prix = parseFloat(edit.prix);
    if (edit.stockAdd) {
      const addStock = parseInt(edit.stockAdd);
      const product = products.find(p => p.id === id);
      if (product) updates.stock = product.stock + addStock;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });

      if (response.ok) {
        await fetchProducts(); // Refresh the list
        setEditing(prev => {
          const newEditing = { ...prev };
          delete newEditing[id];
          return newEditing;
        });
      } else {
        console.error('Error updating product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Gestion des Produits</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Image</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Nom</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Prix</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Stock</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <img src={product.image} alt={product.nom} style={{ width: '50px', height: '50px' }} />
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.nom}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <input
                  type="number"
                  step="0.01"
                  placeholder={product.prix.toString()}
                  value={editing[product.id]?.prix || ''}
                  onChange={(e) => handleEdit(product.id, 'prix', e.target.value)}
                  style={{ width: '80px' }}
                />
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {product.stock}
                <br />
                <input
                  type="number"
                  placeholder="Ajouter stock"
                  value={editing[product.id]?.stockAdd || ''}
                  onChange={(e) => handleEdit(product.id, 'stockAdd', e.target.value)}
                  style={{ width: '80px', marginTop: '5px' }}
                />
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button onClick={() => updateProduct(product.id)}>Mettre à jour</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}