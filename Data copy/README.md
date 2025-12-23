# Data Folder

This folder contains JSON files for seeding the Firebase Firestore database.

## Files

| File | Description |
|------|-------------|
| `categories.json` | Service categories (Dentist, Beauty, Gym, etc.) |
| `cities.json` | Indian cities where services are available |
| `providers.json` | Service provider profiles |
| `services.json` | Services offered by providers |

## How to Use

### 1. Edit JSON Files
Update the JSON files with your real data. Each file follows a specific structure.

### 2. Run Seed Script
```bash
npm run seed
```

This will:
- Clear existing data in Firestore collections
- Upload new data from JSON files
- Add timestamps to all documents

## Data Structures

### categories.json
```json
{
  "id": "dentist",
  "name": "Dentist",
  "icon": "🦷",
  "description": "Dental care & oral health",
  "image": "https://example.com/image.jpg"
}
```

### cities.json
```json
{
  "id": "mumbai",
  "name": "Mumbai",
  "state": "Maharashtra"
}
```

### providers.json
```json
{
  "uid": "provider_001",
  "businessName": "Business Name",
  "description": "Description of services",
  "categories": ["Category1", "Category2"],
  "location": "Area Name",
  "city": "City Name",
  "bio": "Short bio",
  "profileImage": "https://example.com/image.jpg",
  "rating": 4.8,
  "reviewCount": 100,
  "verified": true,
  "phone": "+91 98765 43210",
  "email": "email@example.com",
  "website": "https://website.com",
  "consultationSlots": [
    { "date": "Monday", "startTime": "09:00", "endTime": "18:00", "available": true }
  ]
}
```

### services.json
```json
{
  "id": "service_001",
  "providerId": "provider_001",
  "category": "Dentist",
  "title": "Service Title",
  "description": "Service description",
  "duration": 60,
  "price": 1500,
  "priceType": "fixed",
  "images": []
}
```

## Notes

- The `uid` field in providers becomes the Firestore document ID
- The `id` field in other collections becomes the Firestore document ID
- `createdAt` and `updatedAt` are automatically added during seeding
- Make sure `providerId` in services matches an existing provider's `uid`

