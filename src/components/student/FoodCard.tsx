import React from 'react';
import { Plus, Minus, Heart } from 'lucide-react';
import { MenuItem } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FoodCardProps {
  item: MenuItem;
  className?: string;
}

export function FoodCard({ item, className }: FoodCardProps) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const itemId = item._id || item.id || '';
  const quantity = getItemQuantity(itemId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(item);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(itemId, quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      updateQuantity(itemId, quantity - 1);
    } else {
      updateQuantity(itemId, 0);
    }
  };

  return (
    <motion.div 
      className={cn(
        'bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-border/50',
        !item.available && 'opacity-70',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image || '/placeholder-food.jpg'}
          alt={item.name}
          className={cn(
            'w-full h-full object-cover transition-transform duration-500',
            isHovered ? 'scale-105' : 'scale-100'
          )}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-food.jpg';
          }}
        />
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={cn(
            'absolute top-2 right-2 p-2 rounded-full transition-colors',
            'bg-background/80 backdrop-blur-sm',
            isFavorite ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
          )}
        >
          <Heart 
            className={cn('w-4 h-4', isFavorite ? 'fill-current' : '')} 
            strokeWidth={isFavorite ? 2 : 1.5} 
          />
        </button>
        
        {!item.available && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2 leading-tight">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          <p className="text-primary font-bold text-base whitespace-nowrap pl-2">
            ₹{item.price.toFixed(2)}
          </p>
        </div>
        
        <div className="mt-4">
          {!item.available ? (
            <Button 
              disabled 
              variant="outline" 
              className="w-full text-muted-foreground"
              size="sm"
            >
              Not Available
            </Button>
          ) : quantity === 0 ? (
            <Button
              onClick={handleAddToCart}
              className="w-full h-9 text-sm font-semibold transition-all duration-200"
              size="sm"
            >
              Add to Cart
            </Button>
          ) : (
            <div className="flex items-center justify-between bg-secondary rounded-lg h-9 overflow-hidden">
              <motion.button
                onClick={handleDecrement}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 flex items-center justify-center text-foreground hover:bg-primary/10 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </motion.button>
              <span className="font-medium text-sm">{quantity}</span>
              <motion.button
                onClick={handleIncrement}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 flex items-center justify-center text-foreground hover:bg-primary/10 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
