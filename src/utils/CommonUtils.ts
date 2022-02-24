export default class CommonUtils {
  static isAllValidKeyValues = (data: object, keys?: Array<string>) => {
    if (Array.isArray(keys)) {
      return (
        Object.keys(data).filter((key) => {
          return keys.indexOf(key) >= 0
            ? data[key] === null || data[key] === undefined
            : false;
        }).length === 0
      );
    }
    return Object.keys(data).filter((key) => !data[key]).length === 0;
  };

  static isValidKeys = (data: object, keys: Array<string>) => {
    if (Array.isArray(keys)) {
      return (
        keys.filter((key) => {
          return keys.indexOf(key) >= 0;
        }).length === keys.length
      );
    }
    return false;
  };

  static isValidKeyValuesExcluding = (data: object, keys: Array<string>) => {
    if (Array.isArray(keys)) {
      return (
        Object.keys(data).filter((key) => {
          return keys.indexOf(key) >= 0 ? false : !data[key];
        }).length === 0
      );
    }
    return Object.keys(data).filter((key) => !data[key]).length === 0;
  };

  static findItemInArray = (data: [], key: string, value: string) => {
    return data.find((x: any) => x[key] === value);
  };
}
