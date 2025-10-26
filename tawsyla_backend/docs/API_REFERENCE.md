# Product Categorization API Reference

## Quick Reference

### Public Endpoints

#### Get Products by Category (Paginated)
```http
GET /api/products/category/{category}?page=1&limit=10&sortBy=createdAt&sortOrder=DESC
```

**Parameters:**
- `category` (string): `top-selling` | `trending` | `recently-added` | `top-rated`
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page, max 100 (default: 10)
- `sortBy` (string, optional): Sort field (default: 'createdAt')
  - Allowed values: `createdAt`, `updatedAt`, `nameEn`, `nameAr`, `rating`, `salesCount`, `viewCount`
- `sortOrder` (string, optional): Sort order `ASC` | `DESC` (default: 'DESC')

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nameEn": "Product Name",
      "nameAr": "اسم المنتج",
      "rating": 4.5,
      "salesCount": 150,
      "viewCount": 1200,
      "isTopSelling": true,
      "isTrending": true,
      "isRecentlyAdded": false,
      "isTopRated": true,
      "categories": ["top-selling", "trending", "top-rated"],
      "company": {...},
      "category": {...},
      "variants": [...],
      "image": {...}
    }
  ],
  "meta": {
    "total": 250,
    "page": 1,
    "limit": 10,
    "totalPages": 25,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Track Product View
```http
POST /api/products/{id}/view
```

**Response:**
```json
{
  "id": "uuid",
  "viewCount": 1201,
  "isTrending": true,
  ...
}
```

### Authenticated Endpoints

#### Track Product Sale
```http
POST /api/products/{id}/sale
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid",
  "salesCount": 151,
  "isTopSelling": true,
  "isTrending": true,
  ...
}
```

#### Update Product Categories (Admin Only)
```http
PATCH /api/products/{id}/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "topSellingThreshold": 150,
  "trendingViewThreshold": 1000,
  "trendingSalesThreshold": 75,
  "recentlyAddedDays": 14,
  "topRatedThreshold": 4.5
}
```

#### Bulk Update All Categories (Admin Only)
```http
POST /api/products/update-all-categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "topSellingThreshold": 200,
  "trendingViewThreshold": 800
}
```

**Response:**
```json
{
  "message": "All product categories updated successfully"
}
```

## Category Logic

| Category | Logic | Default Threshold |
|----------|-------|-------------------|
| **Top Selling** | `salesCount >= threshold` | 100 sales |
| **Trending** | `viewCount >= viewThreshold AND salesCount >= salesThreshold` | 500 views + 50 sales |
| **Recently Added** | `createdAt >= (now - days)` | 7 days |
| **Top Rated** | `rating >= threshold` | 4.0 rating |

## Auto-Update Triggers

| Action | Method | Categories Updated |
|--------|--------|-------------------|
| Create Product | `POST /api/products` | All |
| Update Product | `PUT /api/products/{id}` | All |
| View Product | `POST /api/products/{id}/view` | Trending |
| Sale Product | `POST /api/products/{id}/sale` | Top Selling, Trending |
| Rate Product | Rating update | All |

## Error Responses

```json
// 404 - Product not found
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}

// 403 - Unauthorized
{
  "statusCode": 403,
  "message": "You can only update products for your own company",
  "error": "Forbidden"
}

// 400 - Invalid category
{
  "statusCode": 400,
  "message": "Invalid category. Must be one of: top-selling, trending, recently-added, top-rated",
  "error": "Bad Request"
}
```

## Usage Examples

### JavaScript/TypeScript

```javascript
// Get trending products with pagination
const getTrendingProducts = async (page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy: 'viewCount',
    sortOrder: 'DESC'
  });
  const response = await fetch(`/api/products/category/trending?${params}`);
  return response.json();
};

// Get top-selling products sorted by sales count
const getTopSellingProducts = async (page = 1) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '20',
    sortBy: 'salesCount',
    sortOrder: 'DESC'
  });
  const response = await fetch(`/api/products/category/top-selling?${params}`);
  return response.json();
};

// Get recently added products
const getRecentProducts = async () => {
  const params = new URLSearchParams({
    page: '1',
    limit: '15',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });
  const response = await fetch(`/api/products/category/recently-added?${params}`);
  return response.json();
};

// Track product view
const trackView = async (productId) => {
  await fetch(`/api/products/${productId}/view`, { method: 'POST' });
};

// Track sale (authenticated)
const trackSale = async (productId, token) => {
  await fetch(`/api/products/${productId}/sale`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// Update categories (admin)
const updateCategories = async (productId, token, options) => {
  await fetch(`/api/products/${productId}/categories`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(options)
  });
};

// Pagination helper function
const buildPaginationParams = (page, limit, sortBy, sortOrder) => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (sortBy) params.append('sortBy', sortBy);
  if (sortOrder) params.append('sortOrder', sortOrder);
  return params.toString();
};
```

### cURL Examples

```bash
# Get top selling products (first page, 10 items)
curl -X GET "http://localhost:3000/api/products/category/top-selling?page=1&limit=10&sortBy=salesCount&sortOrder=DESC"

# Get trending products (page 2, 20 items)
curl -X GET "http://localhost:3000/api/products/category/trending?page=2&limit=20&sortBy=viewCount&sortOrder=DESC"

# Get recently added products (sorted by creation date)
curl -X GET "http://localhost:3000/api/products/category/recently-added?page=1&limit=15&sortBy=createdAt&sortOrder=DESC"

# Get top rated products (sorted by rating)
curl -X GET "http://localhost:3000/api/products/category/top-rated?page=1&limit=25&sortBy=rating&sortOrder=DESC"

# Track product view
curl -X POST "http://localhost:3000/api/products/{id}/view"

# Track sale (with auth)
curl -X POST "http://localhost:3000/api/products/{id}/sale" \
  -H "Authorization: Bearer {token}"

# Update categories (admin)
curl -X PATCH "http://localhost:3000/api/products/{id}/categories" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"topSellingThreshold": 150}'
```

## Pagination Features

### Smart Sorting
Each category has optimized default sorting:
- **Top Selling**: Sorted by `salesCount DESC` by default
- **Trending**: Sorted by `viewCount DESC`, then `salesCount DESC`
- **Recently Added**: Sorted by `createdAt DESC`
- **Top Rated**: Sorted by `rating DESC`

### Performance Optimization
- Maximum 100 items per page to prevent performance issues
- Efficient database queries with proper indexing
- Category-specific sorting for better user experience

### Response Metadata
```json
{
  "meta": {
    "total": 250,        // Total number of items
    "page": 1,           // Current page number
    "limit": 10,         // Items per page
    "totalPages": 25,    // Total number of pages
    "hasNextPage": true, // Whether there's a next page
    "hasPreviousPage": false // Whether there's a previous page
  }
}
```
