function OrderSummary({ items, total, children }) {
  return (
    <div className="h-fit rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">Order Summary</h2>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm text-neutral-600">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4 text-lg font-bold text-neutral-900">
        <span>Total</span>
        <span>₹{total.toLocaleString('en-IN')}</span>
      </div>

      {children}
    </div>
  )
}

export default OrderSummary
