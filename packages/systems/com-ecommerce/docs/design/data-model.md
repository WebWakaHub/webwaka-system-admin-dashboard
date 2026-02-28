# EcommerceSystem — Data Model Design
## System ID: SYS-COM-ECOMMERCE

### Core Entities
- `ProductCatalogEntity`: Primary entity for product catalog organ
- `ShoppingCartEntity`: Primary entity for shopping cart organ
- `CheckoutEngineEntity`: Primary entity for checkout engine organ
- `OrderManagerEntity`: Primary entity for order manager organ
- `PaymentGatewayEntity`: Primary entity for payment gateway organ

### Nigeria-First Data Patterns
- All monetary fields use `NairaAmount` type (kobo precision)
- All timestamps use WAT (UTC+1) with ISO 8601 format
- All phone numbers use Nigerian format (+234)
- All addresses support Nigerian address hierarchy (State → LGA → Ward)
