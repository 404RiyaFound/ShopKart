const inputClass =
  'w-full rounded-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900'

function CheckoutForm({ form, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={onChange}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={onChange}
          required
          inputMode="numeric"
          pattern="[6-9]\d{9}"
          maxLength={10}
          placeholder="10-digit number"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Address</label>
        <input
          type="text"
          name="addressLine1"
          value={form.addressLine1}
          onChange={onChange}
          required
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">City</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={onChange}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">State</label>
          <input
            type="text"
            name="state"
            value={form.state}
            onChange={onChange}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Pincode</label>
        <input
          type="text"
          name="pincode"
          value={form.pincode}
          onChange={onChange}
          required
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          placeholder="6-digit pincode"
          className={inputClass}
        />
      </div>
    </div>
  )
}

export default CheckoutForm
