// src/lib/utils.ts

export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}


export function getPropValue(obj: { props: Array<{ name: string; value: any }> }, key: string): string {
  const prop = obj.props?.find(p => p.name.toLowerCase() === key.toLowerCase());
  return prop?.value?.toString() || '';
}

/**
 * Busca objetos en un array por tipo y una propiedad específica.
 * @param objects - Array de objetos a buscar.
 * @param type - Tipo del objeto (e.g., "IfcWallStandardCase").
 * @param propName - Nombre de la propiedad a buscar (e.g., "CÓDIGO MULTICAPA").
 * @param propValue - Valor de la propiedad a buscar (e.g., "MURO_03").
 * @returns Array de objetos que coinciden con los criterios.
 */
export function findObjectsByTypeAndProperty(
  objects: Array<any>,
  type: string,
  propName: string,
  propValue: string
): Array<any> {
  return objects.filter(
    (obj) =>
      obj.type === type &&
      obj.props.some((prop: any) => prop.name === propName && prop.value === propValue)
  );
}