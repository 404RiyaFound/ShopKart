const CATEGORIES = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home']

function SearchBar({ search, onSearchChange, category, onCategoryChange }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3 sm:flex-row">
      <div className="relative w-full sm:max-w-sm">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-neutral-400">
          ⌕
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-full border border-neutral-200 bg-neutral-50 px-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      </div>

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 sm:max-w-xs"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c === 'All Categories' ? '' : c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SearchBar
