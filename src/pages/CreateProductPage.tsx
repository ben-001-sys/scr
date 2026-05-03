import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../lib/api';

// Admin page that sends product payload to backend POST /product.
export function CreateProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    stock: '',
    imageUrl: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Converts form strings to backend DTO shape and creates product.
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await createProduct({
        name: form.name,
        description: form.description || undefined,
        sku: form.sku,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl || undefined,
        isActive: form.isActive,
      });
      navigate('/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold mb-4">Create Product</h1>
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="form-control">
              <span className="label-text">Name</span>
              <input
                className="input input-bordered"
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>
            <label className="form-control">
              <span className="label-text">Description</span>
              <textarea
                className="textarea textarea-bordered"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>
            <label className="form-control">
              <span className="label-text">SKU</span>
              <input
                className="input input-bordered"
                required
                value={form.sku}
                onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
              />
            </label>
            <label className="form-control">
              <span className="label-text">Price</span>
              <input
                className="input input-bordered"
                required
                type="number"
                min={0}
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
              />
            </label>
            <label className="form-control">
              <span className="label-text">Stock</span>
              <input
                className="input input-bordered"
                required
                type="number"
                min={0}
                value={form.stock}
                onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
              />
            </label>
            <label className="form-control">
              <span className="label-text">Image URL</span>
              <input
                className="input input-bordered"
                value={form.imageUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
              />
            </label>
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              />
              <span className="label-text">Active</span>
            </label>
            {error && <p className="text-error text-sm">{error}</p>}
            <button type="submit" className={`btn btn-primary w-full ${isSubmitting ? 'btn-disabled' : ''}`}>
              {isSubmitting ? 'Saving...' : 'Create Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
