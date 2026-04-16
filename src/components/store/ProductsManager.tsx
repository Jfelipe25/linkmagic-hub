// src/components/store/ProductsManager.tsx
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, formatPrice } from '@/types/store';
import { Plus, Trash2, Edit2, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  profileId: string;
  currency: string;
}

const EMPTY_PRODUCT: Omit<Product, 'id' | 'profile_id' | 'sort_order' | 'created_at'> = {
  name: '',
  description: '',
  price: 0,
  image_url: '',
  category: '',
  active: true,
};

const ProductsManager = ({ profileId, currency }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  useEffect(() => {
    if (!profileId) return;
    loadProducts();
  }, [profileId]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => { if (p.category) cats.add(p.category); });
    return ['Todos', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'Todos') return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('profile_id', profileId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Error al cargar productos');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ ...EMPTY_PRODUCT });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      image_url: product.image_url || '',
      category: product.category || '',
      active: product.active,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('El nombre del producto es obligatorio');
      return;
    }
    if (form.price < 0) {
      toast.error('El precio no puede ser negativo');
      return;
    }
    setSaving(true);

    if (editingId) {
      const { error } = await supabase
        .from('products')
        .update({
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: form.price,
          image_url: form.image_url.trim() || null,
          category: form.category.trim() || null,
          active: form.active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);
      if (error) {
        toast.error('Error al actualizar producto');
      } else {
        toast.success('Producto actualizado');
        resetForm();
        loadProducts();
      }
    } else {
      const maxOrder = products.reduce((max, p) => Math.max(max, p.sort_order), 0);
      const { error } = await supabase
        .from('products')
        .insert({
          profile_id: profileId,
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: form.price,
          image_url: form.image_url.trim() || null,
          category: form.category.trim() || null,
          active: form.active,
          sort_order: maxOrder + 1,
        });
      if (error) {
        toast.error('Error al crear producto');
      } else {
        toast.success('Producto creado');
        resetForm();
        loadProducts();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar');
    } else {
      toast.success('Producto eliminado');
      loadProducts();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede superar 2MB');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${profileId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { upsert: false });
    if (error) {
      toast.error('Error al subir imagen: ' + error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    setForm(f => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
    toast.success('Imagen cargada');
  };

  const toggleActive = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ active: !product.active })
      .eq('id', product.id);
    if (!error) loadProducts();
  };

  const stockCount = products.filter(p => p.active).length;
  const outOfStockCount = products.filter(p => !p.active).length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Productos</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {products.length} producto{products.length === 1 ? '' : 's'}
            {products.length > 0 && (
              <span> · <span className="text-green-600">{stockCount} en stock</span>{outOfStockCount > 0 && <span> · <span className="text-red-500">{outOfStockCount} sin stock</span></span>}</span>
            )}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
          >
            <Plus size={14} /> Nuevo producto
          </button>
        )}
      </div>

      {/* Category filter */}
      {categories.length > 1 && !showForm && (
        <div className="flex gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
              {cat !== 'Todos' && (
                <span className="ml-1 opacity-60">
                  ({products.filter(p => p.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">
              {editingId ? 'Editar producto' : 'Nuevo producto'}
            </h4>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Camiseta negra talla M"
                maxLength={80}
                className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">
                Precio ({currency}) *
              </label>
              <input
                type="number"
                value={form.price || ''}
                onChange={e => setForm({ ...form, price: Number(e.target.value) || 0 })}
                placeholder="0"
                min="0"
                step="1"
                className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Categoría</label>
              <input
                type="text"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="Ej: Ropa, Accesorios..."
                maxLength={40}
                className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground">Descripción</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Detalles del producto..."
                maxLength={300}
                rows={2}
                className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground">Imagen</label>
              <div className="mt-1 flex items-center gap-3">
                {form.image_url ? (
                  <div className="relative">
                    <img
                      src={form.image_url}
                      alt="preview"
                      className="w-16 h-16 rounded-md object-cover border border-border"
                    />
                    <button
                      onClick={() => setForm({ ...form, image_url: '' })}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-md border border-dashed border-border flex items-center justify-center text-muted-foreground">
                    <ImageIcon size={18} />
                  </div>
                )}
                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-border bg-background text-sm cursor-pointer hover:bg-accent">
                  {uploading ? (
                    <><Loader2 size={14} className="animate-spin" /> Subiendo...</>
                  ) : (
                    <>Cargar imagen (max 2MB)</>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="active-checkbox"
                checked={form.active}
                onChange={e => setForm({ ...form, active: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="active-checkbox" className="text-sm text-muted-foreground">
                En stock
              </label>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-border">
            <button
              onClick={resetForm}
              className="px-3 py-1.5 rounded-md border border-border bg-background text-sm text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {editingId ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </div>
      )}

      {products.length === 0 && !showForm ? (
        <div className="text-center py-12 rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">
            Aún no tienes productos. Crea el primero para empezar a vender.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className={`rounded-lg border border-border bg-card overflow-hidden transition ${
                !product.active ? 'opacity-60' : ''
              }`}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-32 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-32 bg-muted flex items-center justify-center text-muted-foreground">
                  <ImageIcon size={24} />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-sm font-semibold text-primary mt-0.5">
                      {formatPrice(product.price, currency)}
                    </p>
                    {product.category && (
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {product.category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
                  {/* Stock toggle */}
                  <button
                    onClick={() => toggleActive(product)}
                    className="flex items-center gap-1.5 group"
                  >
                    <div
                      className={`relative w-8 h-[18px] rounded-full transition-colors ${
                        product.active ? 'bg-green-500' : 'bg-red-400'
                      }`}
                    >
                      <div
                        className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-all ${
                          product.active ? 'left-[16px]' : 'left-[2px]'
                        }`}
                      />
                    </div>
                    <span className={`text-[11px] font-medium ${
                      product.active ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {product.active ? 'En stock' : 'Sin stock'}
                    </span>
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsManager;