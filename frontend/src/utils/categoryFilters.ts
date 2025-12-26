/**
 * Unified category filtering utilities
 * This ensures consistent filtering logic across all components
 */

export type Category = "מגורים" | "משרדים";

// Residential property types (מגורים) - includes legacy 'בית' for backward compatibility
export const RESIDENTIAL_PROPERTY_TYPES = ['דירה', 'בית פרטי', 'בית'];
// Commercial property types (משרדים)
export const COMMERCIAL_PROPERTY_TYPES = ['משרד', 'מסחרי'];

export interface Property {
  id: number;
  category?: string;
  property_type?: string;
  listing_type?: string;
  [key: string]: any;
}

export interface Buyer {
  id: number;
  preferred_property_type?: string;
  desired_property_type?: string;
  request_type?: string;
  request_category?: string;
  [key: string]: any;
}

export interface Match {
  id: number;
  property_id: number;
  buyer_id?: number;
  client_id?: number;
  [key: string]: any;
}

/**
 * Check if a property matches the given category
 */
export function propertyMatchesCategory(property: Property, category: Category): boolean {
  if (category === "מגורים") {
    return property.category === "מגורים";
  } else if (category === "משרדים") {
    return property.category === "משרדים" || property.category === "מסחרי";
  }
  return true;
}

/**
 * Check if a buyer matches the given category
 */
export function buyerMatchesCategory(buyer: Buyer, category: Category): boolean {
  const buyerPropertyType = buyer.preferred_property_type;
  
  if (category === "מגורים") {
    return RESIDENTIAL_PROPERTY_TYPES.includes(buyerPropertyType || '');
  } else if (category === "משרדים") {
    return COMMERCIAL_PROPERTY_TYPES.includes(buyerPropertyType || '');
  }
  return true;
}

/**
 * Check if a match (property + buyer) matches the given category
 * This requires both property and buyer to match the category
 */
export function matchMatchesCategory(
  match: Match,
  property: Property | undefined,
  buyer: Buyer | undefined,
  category: Category
): boolean {
  if (!property || !buyer) return false;
  
  const propertyMatch = propertyMatchesCategory(property, category);
  const buyerMatch = buyerMatchesCategory(buyer, category);
  
  return propertyMatch && buyerMatch;
}

/**
 * Check if property and buyer transaction types match
 * Property listing_type should match buyer request_type
 * Handles Hebrew variations: מכירה/קנייה, השכרה/שכירות
 */
export function transactionTypesMatch(property: Property, buyer: Buyer): boolean {
  const propertyListingType = property.listing_type;
  const buyerRequestType = buyer.request_type || buyer.request_category;
  
  if (!propertyListingType || !buyerRequestType) return true; // If not specified, don't filter out
  
  // Direct match
  if (propertyListingType === buyerRequestType) return true;
  
  // Handle Hebrew variations
  // מכירה matches קנייה
  if ((propertyListingType === "מכירה" || propertyListingType === "קנייה") &&
      (buyerRequestType === "מכירה" || buyerRequestType === "קנייה")) {
    return true;
  }
  
  // השכרה matches שכירות
  if ((propertyListingType === "השכרה" || propertyListingType === "שכירות") &&
      (buyerRequestType === "השכרה" || buyerRequestType === "שכירות")) {
    return true;
  }
  
  return false;
}

/**
 * Filter properties by category
 */
export function filterPropertiesByCategory(properties: Property[], category: Category): Property[] {
  return properties.filter(property => propertyMatchesCategory(property, category));
}

/**
 * Filter buyers by category
 */
export function filterBuyersByCategory(buyers: Buyer[], category: Category): Buyer[] {
  return buyers.filter(buyer => buyerMatchesCategory(buyer, category));
}

/**
 * Filter matches by category
 * Requires properties and buyers arrays to resolve match relationships
 */
export function filterMatchesByCategory(
  matches: Match[],
  properties: Property[],
  buyers: Buyer[],
  category: Category,
  requireTransactionMatch: boolean = true
): Match[] {
  return matches.filter(match => {
    const property = properties.find(p => p.id === match.property_id);
    const buyer = buyers.find(b => b.id === (match.buyer_id || match.client_id));
    
    if (!property || !buyer) return false;
    
    const categoryMatch = matchMatchesCategory(match, property, buyer, category);
    
    if (!categoryMatch) return false;
    
    // Optionally require transaction type match
    if (requireTransactionMatch) {
      return transactionTypesMatch(property, buyer);
    }
    
    return true;
  });
}

/**
 * Get category from URL search params
 * Can accept a URLSearchParams object (from React Router's useSearchParams) or read from window.location
 */
export function getCategoryFromURL(
  defaultCategory: Category = "מגורים",
  searchParams?: URLSearchParams | string
): Category {
  let categoryParam: string | null = null;
  
  if (searchParams instanceof URLSearchParams) {
    // Use provided URLSearchParams (from React Router)
    categoryParam = searchParams.get('category');
  } else if (typeof searchParams === 'string') {
    // Use provided string (query string)
    const params = new URLSearchParams(searchParams);
    categoryParam = params.get('category');
  } else if (typeof window !== 'undefined') {
    // Fallback to window.location.search
    const urlParams = new URLSearchParams(window.location.search);
    categoryParam = urlParams.get('category');
  }
  
  if (categoryParam === "מגורים" || categoryParam === "משרדים") {
    return categoryParam as Category;
  }
  
  return defaultCategory;
}

