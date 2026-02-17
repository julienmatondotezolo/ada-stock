// Unit translation utility for Ada Stock Management

interface TranslationFunction {
  (key: string): string;
}

export const translateUnit = (unit: string, t: TranslationFunction): string => {
  const translatedUnit = t(`units.${unit}`);
  
  // Return original unit if translation key not found
  return translatedUnit === `units.${unit}` ? unit : translatedUnit;
};

export const getAvailableUnits = (t: TranslationFunction) => {
  const baseUnits = [
    'pcs', 'kg', 'g', 'L', 'ml', 
    'bunch', 'pack', 'box', 'bottle', 'can'
  ];

  return baseUnits.map(unit => ({
    value: unit,
    label: translateUnit(unit, t),
    displayName: `${translateUnit(unit, t)} (${unit})`
  }));
};

export default {
  translateUnit,
  getAvailableUnits
};