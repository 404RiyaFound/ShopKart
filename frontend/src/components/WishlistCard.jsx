import { Link } from 'react-router-dom'

function WishlistCard({ product, onRemove }) {
  const inStock = product.stock > 0

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="relative bg-neutral-100 p-4">
        <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-600 shadow-sm">
          {product.category}
        </span>
        <img
          src={product.image}
          alt={product.name}
          className="h-44 w-full object-contain"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold text-neutral-900">{product.name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-lg font-bold text-neutral-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <span className={`text-xs font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
            {inStock ? `${product.stock} left` : 'Out of stock'}
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          <Link
            to={`/products/${product._id}`}
            className="flex-1 rounded-full bg-neutral-900 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-black"
          >
            View Details
          </Link>

          <button
            onClick={() => onRemove(product._id)}
            className="flex-1 rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Remove ♥
          </button>
        </div>
      </div>
    </div>
  )
}

export default WishlistCard
