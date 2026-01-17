import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, X, ShoppingCart } from 'lucide-react';
import { MenuItem, Category } from '@/types';
import { useMenu } from '@/contexts/MenuContext';
import { useCart } from '@/contexts/CartContext';
import { BottomNav } from '@/components/student/BottomNav';
import { CategoryTabs } from '@/components/student/CategoryTabs';
import { FoodCard } from '@/components/student/FoodCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name (A-Z)' },
];

export default function StudentHome() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleItems, setVisibleItems] = useState(12);

  const { menuItems = [], loading, error } = useMenu();
  const { totalItems = 0, totalAmount = 0 } = useCart() || {};

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/v1/categories');
        const cats = response.data?.data || [];
        setCategories(cats);
        // Set first category as active
        if (cats.length > 0 && activeCategory === 'all') {
          setActiveCategory(cats[0]._id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(menuItems)) return [];

    return menuItems
      .filter((item) => {
        if (!item || typeof item !== 'object') return false;

        // Category matching
        let categoryMatch = activeCategory === 'all';
        if (!categoryMatch) {
          if (typeof item.category === 'string') {
            categoryMatch = item.category === activeCategory;
          } else if (item.category && typeof item.category === 'object') {
            categoryMatch = item.category._id === activeCategory;
          }
        }

        // Only show available items
        const isAvailable = item.isAvailable !== undefined ? item.isAvailable : item.available;
        if (!isAvailable) return false;

        const searchMatch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

        return categoryMatch && searchMatch;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'name':
            return a.name.localeCompare(b.name);
          case 'popular':
          default:
            return (b.popularity || 0) - (a.popularity || 0);
        }
      });
  }, [menuItems, activeCategory, searchQuery, sortOption]);

  const loadMoreItems = useCallback(() => {
    setVisibleItems((prev) => Math.min(prev + 8, filteredItems.length));
  }, [filteredItems.length]);

  useEffect(() => {
    setVisibleItems(12);
  }, [activeCategory, searchQuery, sortOption]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
        visibleItems < filteredItems.length
      ) {
        loadMoreItems();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleItems, filteredItems.length, loadMoreItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-32">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-32">
        <div className="text-center">
          <h2 className="text-lg font-medium text-destructive mb-2">Error loading menu</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <h1 className="text-2xl font-bold mb-2">Hungry?</h1>
            <p className="text-muted-foreground text-sm">Order your favorite food now</p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search food or drinks..."
              className="pl-10 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="border rounded-lg p-4 mb-4 bg-muted/10">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Sort By</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground"
                      onClick={() => setShowFilters(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Tabs value={sortOption} onValueChange={setSortOption} className="w-full">
                    <TabsList className="grid grid-cols-2 gap-2 h-auto p-0 bg-transparent">
                      {SORT_OPTIONS.map((option) => (
                        <TabsTrigger
                          key={option.value}
                          value={option.value}
                          className="py-1.5 text-xs h-auto whitespace-normal text-left justify-start px-3"
                        >
                          {option.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Tabs */}
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categories={categories}
            className="mb-0"
          />
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found in this category.</p>
            {searchQuery && (
              <Button variant="ghost" className="mt-2" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredItems.slice(0, visibleItems).map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <FoodCard item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {visibleItems < filteredItems.length && (
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Showing {visibleItems} of {filteredItems.length} items
            </p>
            <Button variant="outline" className="mt-2" onClick={loadMoreItems}>
              Load More
            </Button>
          </div>
        )}
      </div>

      {/* Cart Summary Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-background border-t shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{totalItems} {totalItems === 1 ? 'item' : 'items'} in cart</p>
                <p className="text-sm text-muted-foreground">₹{totalAmount.toFixed(2)}</p>
              </div>
              <Button onClick={() => window.location.href = '/student/cart'} className="gap-2">
                View Cart
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

