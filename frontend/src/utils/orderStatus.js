export const STATUS_FLOW = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

const STATUS_STYLES = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  PLACED: 'bg-neutral-100 text-neutral-600',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
}

export function getStatusStyle(status) {
  return STATUS_STYLES[status] || STATUS_STYLES.PLACED
}

export function getNextStatus(status) {
  const index = STATUS_FLOW.indexOf(status)
  if (index === -1 || index === STATUS_FLOW.length - 1) {
    return null
  }
  return STATUS_FLOW[index + 1]
}
