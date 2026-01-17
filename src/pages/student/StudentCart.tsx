import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrderContext';
import { BottomNav } from '@/components/student/BottomNav';
import { SlideToOrder } from '@/components/student/SlideToOrder';
import { toast } from 'sonner';

export function StudentCart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart();
  const { placeOrder } = useOrders();

  console.log('🛒 StudentCart - Items from context:', items);
  console.log('🛒 StudentCart - Items count:', items.length);
  console.log('🛒 StudentCart - Total amount:', totalAmount);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    
    console.log('🛒 Placing order with cart items:', items);
    const order = await placeOrder(items);
    if (order) {
      clearCart();
      navigate('/student/orders');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-4 pt-6">
          <button
            onClick={() => navigate('/student')}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground mt-4">Your Cart</h1>
        </div>

        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground text-sm text-center px-8">
            Looks like you haven't added any items yet
          </p>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      <div className="px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/student')}
              className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Order details</h1>
          </div>
          <div className="bg-secondary px-3 py-1.5 rounded-full">
            <span className="text-primary font-bold text-sm">₹{totalAmount.toFixed(0)}</span>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item) => {
            const itemId = item._id || item.id || '';
            const itemImage = item.imageUrl || item.image || '/placeholder-food.jpg';
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
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <p className="text-primary font-bold">₹{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-secondary rounded-lg">
                    <button
                      onClick={() => updateQuantity(itemId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-secondary-foreground hover:bg-primary hover:text-primary-foreground rounded-l-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-secondary-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(itemId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-secondary-foreground hover:bg-primary hover:text-primary-foreground rounded-r-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(itemId)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/student')}
          className="w-full text-center text-primary font-medium mt-6"
        >
          + Add More Items
        </button>
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-card border-t border-border p-4 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sub-Total</span>
          <span className="text-foreground">₹{totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold text-foreground">Total</span>
          <span className="font-bold text-foreground">₹{totalAmount.toFixed(2)}</span>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          💵 Payment Mode: Cash (Pay at Counter)
        </p>
        <SlideToOrder amount={totalAmount} onConfirm={handlePlaceOrder} />
      </div>

      <BottomNav />
    </div>
  );
}
