/**
 * Commerce Shared Primitives
 * Exports all 8 commerce primitives
 */

export { Money, type IMoneyValue } from './Money';
export { Product, type IProduct, type IProductVariant } from './Product';
export { Order, OrderStatus, type IOrder, type IOrderItem, type IOrderAddress } from './Order';
export { Payment, PaymentStatus, PaymentMethod, type IPayment, type IPaymentMetadata } from './Payment';
export { Inventory, type IInventory, type IInventoryLocation, type IInventoryEvent } from './Inventory';
export { Shipment, ShipmentStatus, type IShipment, type IShipmentEvent } from './Shipment';
export { Customer, type ICustomer, type ICustomerAddress, type ICustomerPreferences } from './Customer';
export { Cart, type ICart, type ICartItem } from './Cart';
