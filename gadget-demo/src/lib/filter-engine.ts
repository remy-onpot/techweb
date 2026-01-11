import { Product, FilterRule } from "./types";

/**
 * Helper to safely access nested object properties
 * e.g. getNestedValue(product, 'specs.ram') -> "16GB"
 */
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((prev, curr) => prev ? prev[curr] : null, obj);
};

/**
 * THE MATCHER
 * Checks if a single product satisfies ALL rules in a list (AND logic)
 */
export const matchesRules = (product: Product, rules: FilterRule[]): boolean => {
  if (!rules || rules.length === 0) return true; // No rules = Show everything

  return rules.every(rule => {
    const rawValue = getNestedValue(product, rule.field);
    
    // 1. Handle Missing Data
    if (rawValue === undefined || rawValue === null) return false;

    // 2. Normalize Values for Comparison
    const productValue = String(rawValue).toLowerCase();
    const ruleValue = String(rule.value).toLowerCase();
    const productNum = parseFloat(String(rawValue));
    const ruleNum = parseFloat(String(rule.value));

    // 3. Apply Operators
    switch (rule.operator) {
      case 'eq':
        return productValue === ruleValue;
      
      case 'contains':
        return productValue.includes(ruleValue);
      
      case 'gt':
        return !isNaN(productNum) && !isNaN(ruleNum) && productNum > ruleNum;
      
      case 'lt':
        return !isNaN(productNum) && !isNaN(ruleNum) && productNum < ruleNum;
        
        case 'gte': // Greater than OR Equal (>=)
        return !isNaN(productNum) && !isNaN(ruleNum) && productNum >= ruleNum;
      
      case 'lte': // Less than OR Equal (<=)
        return !isNaN(productNum) && !isNaN(ruleNum) && productNum <= ruleNum;
        
      default:
        return false;
    }
  });
};