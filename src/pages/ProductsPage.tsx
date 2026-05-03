import { useEffect, useState } from 'react';
import { getProducts } from '../lib/api';
import type { Product } from '../types';

// Product listing page that reads data from backend /product endpoint.
export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Loads products once when page mounts.
  async function loadProducts() {
    setError('');
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Run after mount tick to satisfy strict lint rule about setState in effects.
    const timer = window.setTimeout(() => {
      loadProducts();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <button type="button" className="btn btn-outline btn-sm" onClick={loadProducts}>
          Refresh
        </button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {products.length === 0 ? (
        <div className="alert">No products found.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">{product.name}</h2>
                <p className="text-sm opacity-70">{product.description ?? 'No description'}</p>
                <p>SKU: {product.sku}</p>
                <p>Price: {product.price}</p>
                <p>Stock: {product.stock}</p>
                <div className="card-actions justify-end">
                  <span className={`badge ${product.isActive ? 'badge-success' : 'badge-warning'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
