import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Category } from '@/types';
import { cn } from '@/lib/utils';

export interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categories: Category[];
  className?: string;
}

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  categories,
  className,
}: CategoryTabsProps) {
  const gridCols = Math.min(categories.length, 4);
  
  return (
    <div className={cn('w-full', className)}>
      <Tabs
        value={activeCategory}
        onValueChange={onCategoryChange}
        className="w-full"
      >
        <TabsList className={cn(
          'w-full h-12 bg-muted/20 p-1 rounded-lg',
          `grid grid-cols-${gridCols}`
        )}>
          {categories.map((category) => (
            <TabsTrigger 
              key={category._id} 
              value={category._id}
              className={cn(
                'relative py-1 text-sm font-medium transition-colors',
                'data-[state=active]:bg-background data-[state=active]:shadow-sm',
                'data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground',
                'rounded-md',
                'flex items-center justify-center',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'focus-visible:outline-none',
              )}
            >
              {category.name}
              {activeCategory === category._id && (
                <span className="absolute bottom-1 left-1/2 w-1/2 h-0.5 bg-primary rounded-full -translate-x-1/2" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
