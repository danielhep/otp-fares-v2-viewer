# OTP Fare Viewer PRD

## Overview
A debug tool for visualizing OpenTripPlanner (OTP) fare information from GraphQL query responses. The application allows users to paste JSON output from OTP queries and provides a detailed breakdown of fare products within each itinerary, focusing on fare usage across that itinerary's legs in isolation.

## User Story
As a developer debugging OTP fare calculations, I want to paste GraphQL response JSON and visualize fare product breakdowns per leg, including identification of reused fare products and variations in their details.

## Data Structure Analysis

### Input Data Schema
Based on `exampleQuery.graphql`, the input structure is:
```json
{
  "plan": {
    "itineraries": [
      {
        "legs": [
          {
            "route": { "shortName": "string" },
            "fareProducts": [
              {
                "id": "string",
                "product": {
                  "__typename": "DefaultFareProduct|DependentFareProduct",
                  "id": "string",
                  "medium": { "id": "string", "name": "string" },
                  "name": "string",
                  "riderCategory": { "id": "string", "name": "string" },
                  // Type-specific fields:
                  // DefaultFareProduct: price { amount, currency { code, digits } }
                  // DependentFareProduct: dependencies [{ id }], price { amount, currency { code } }
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### Key Data Processing Requirements
1. **Fare Product Reuse Detection**: Same `fareProducts.id` reused on multiple legs *within the same itinerary* indicates reuse
2. **Variation Detection**: Same fare product ID but different details (price, etc.) across legs of a single itinerary
3. **Fare Product Type Support**: Handle both `DefaultFareProduct` and `DependentFareProduct`
4. **Currency Handling**: Format price with appropriate currency codes and digits

## UI Design

### Layout
```
+--------------------------+--------------------------+
| Header                   | Paste JSON Area          |
| "OTP Fare Viewer"        |                          |
+--------------------------+                          |
|                          |                          |
| Fare Summary Panel       | [Parse Button]           |
| - Total cost             |                          |
| - Product types          |                          |
| - Reused products        |--------------------------+
|                          | Itineraries Tabs         |
|                          | - Itinerary 1 [ACTIVE]   |
|                          | - Itinerary 2            |
+--------------------------+--------------------------+
|                          |                          |
| Leg Details Panel        | Fare Product Legend      |
| - Route short name       | - Color coding for types |
| - Leg fare products      | - Reuse indicators       |
|                          | - Variation flags        |
+--------------------------+--------------------------+
```

### Main Components

#### 1. Header
- Title: "OTP Fare Viewer"
- Subtitle: "Debug tool for OTP fare product analysis"

#### 2. JSON Input Area
- Large textarea for pasting JSON
- "Parse & Visualize" button
- Validation error display
- Sample data toggle

#### 3. Fare Summary Panel
- **Total Itinerary Cost**: Sum of all unique fare products within the selected itinerary (accounting for reuse)
- **Fare Product Types**: Count of Default vs Dependent fare products for the selected itinerary
- **Reused Products**: List of products used on multiple legs of the current itinerary, including leg references
- **Variation Alerts**: Products with same ID but different details inside the itinerary

#### 4. Itinerary Navigation
- Tabs for each itinerary (if multiple)
- Shows itinerary number and total cost
- Active tab highlighting

#### 5. Leg Details Visualization
For each leg in the selected itinerary:
- **Leg Header**: Route short name, leg number
- **Fare Products List**: Each product shows:
  - Product ID (with reuse indicator if used multiple times)
    - Hovering over the reuse indicator reveals the list of legs where the product appears in the itinerary
  - Product type (Default/Dependent)
  - Medium name and ID
  - Rider category name and ID
  - Price with currency formatting
  - For Dependent: list of dependency IDs
  - Variation indicators if details differ from other uses

#### 6. Fare Product Legend
- Color coding for fare product types
- Symbols for reuse indicators
- Key for variation flags

## Visual Design Elements

### Color Scheme
- **DefaultFareProduct**: Blue (#3B82F6)
- **DependentFareProduct**: Green (#10B981)
- **Reused Product**: Purple border/background
- **Variation Warning**: Orange/Yellow indicator

### Indicators
- **Reuse Symbol**: ↺ (recycle symbol) with count
  - Tooltip lists the leg numbers where the fare product ID repeats within the itinerary
- **Variation Symbol**: ⚠ (warning) for inconsistent data
- **Currency Format**: "$X.XX" or "€X.XX" based on currency code

### Layout
- Responsive design that works on desktop for debugging
- Expandable/collapsible sections for detailed views
- Copy-to-clipboard functionality for product IDs

## Implementation Details

### State Management
- Raw JSON input
- Parsed and validated data
- Selected itinerary
- Fare product usage tracking
- Error states

### Data Processing
1. Parse and validate JSON structure
2. For each itinerary, map fare products by ID across its legs
3. Identify reuse patterns and variations within the itinerary only
4. Calculate itinerary-specific totals and summaries
5. Prepare data for visualization

### Features for Debugging
- Expand all/collapse all details
- Export parsed data as CSV/JSON
- Filter by fare product type
- Search by product ID or name
- Toggle between showing all data or unique products only

## Success Criteria
1. Users can paste OTP GraphQL response and see parsed fare data
2. Reused fare products are clearly identified across legs of the selected itinerary, and hovering reveals the affected leg numbers
3. Variations in same-ID products are highlighted within each itinerary
4. All fare product details are accessible in the UI
5. Total itinerary cost is accurately calculated for the selected itinerary
6. Interface is responsive and usable for debugging purposes

## Technical Considerations
- Use existing TanStack Router + React setup
- Implement with TypeScript for type safety
- Use Tailwind CSS for styling
- Consider adding JSON schema validation
- Implement proper error handling for malformed input
