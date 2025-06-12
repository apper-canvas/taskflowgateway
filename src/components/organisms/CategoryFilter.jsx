import Button from '@/components/atoms/Button';

function CategoryFilter({ categories, tasks, activeCategory, setActiveCategory }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() => setActiveCategory('all')}
        className={`px-4 py-2 rounded-full text-sm font-medium ${
          activeCategory === 'all'
            ? 'bg-primary text-white'
            : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
        }`}
      >
        All ({tasks.length})
      </Button>
      {categories.map(category => {
        const count = tasks.filter(t => t.category === category.name).length;
        return (
          <Button
            key={category.id}
            onClick={() => setActiveCategory(category.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeCategory === category.name
                ? 'text-white'
                : 'text-surface-700 hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeCategory === category.name ? category.color : `${category.color}20`,
              borderColor: category.color
            }}
          >
            {category.name} ({count})
          </Button>
        );
      })}
    </div>
  );
}

export default CategoryFilter;