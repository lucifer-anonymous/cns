import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { MenuItem, Category } from '@/types';
import { useMenu } from '@/contexts/MenuContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';
import { MenuItemForm } from '@/components/admin/MenuItemForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

export function AdminMenu() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability } = useMenu();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/v1/categories');
        setCategories(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const filteredItems = filterCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => {
        if (typeof item.category === 'string') {
          return item.category === filterCategory;
        }
        return item.category._id === filterCategory || item.category.slug === filterCategory;
      });

  const handleAdd = (data: Omit<MenuItem, 'id'>) => {
    addMenuItem(data);
    setShowForm(false);
    toast.success('Menu item added successfully');
  };

  const handleEdit = (data: Omit<MenuItem, 'id'>) => {
    if (editingItem) {
      updateMenuItem(editingItem.id, data);
      setEditingItem(null);
      toast.success('Menu item updated');
    }
  };

  const handleDelete = (id: string) => {
    deleteMenuItem(id);
    toast.success('Menu item deleted');
  };

  const categoryOptions = [
    { id: 'all', label: 'All' },
    ...categories.map(cat => ({ id: cat._id, label: cat.name }))
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="md:ml-64 pb-24 md:pb-8">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Menu Management</h1>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
            {categoryOptions.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm transition-colors ${
                  filterCategory === cat.id
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'bg-muted text-muted-foreground hover:bg-secondary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredItems.map((item) => {
              const itemId = item._id || item.id || '';
              const isAvailable = item.isAvailable !== undefined ? item.isAvailable : item.available;
              const itemImage = item.imageUrl || item.image || '/placeholder-food.jpg';
              const categoryName = typeof item.category === 'string' 
                ? categories.find(c => c._id === item.category)?.name || 'Unknown'
                : item.category?.name || 'Unknown';
              
              return (
                <div
                  key={itemId}
                  className="bg-card rounded-lg card-shadow p-4 flex items-center gap-4"
                >
                  <img
                    src={itemImage}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-food.jpg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                    <p className="text-primary font-bold">₹{item.price.toFixed(2)}</p>
                    <span className="text-xs text-muted-foreground capitalize">{categoryName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAvailability(itemId)}
                      className={`p-2 rounded-lg transition-colors ${
                        isAvailable 
                          ? 'text-success hover:bg-success/10' 
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                      title={isAvailable ? 'Mark unavailable' : 'Mark available'}
                    >
                      {isAvailable ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(itemId)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="bg-card rounded-lg card-shadow p-8 text-center">
              <p className="text-muted-foreground">No menu items found</p>
            </div>
          )}
        </div>
      </div>

      {(showForm || editingItem) && (
        <MenuItemForm
          item={editingItem || undefined}
          onSubmit={editingItem ? handleEdit : handleAdd}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      <AdminMobileNav />
    </div>
  );
}
