export function mapObjectToUpdateQuery({ obj, offset = 1 } : {obj: object, offset?: number}) {
  const objectColumns = Object.keys(obj).map((key, index) => `"${key}"=$${index + offset}`).join(",");
  const objectValues = Object.values(obj);

  return { objectColumns, objectValues };
}
