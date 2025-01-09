// Resize an array (of colors) to be a specific length
export function resizeArray(arr: string[], n: number): string[] {
  if (n <= 0) return [];

  const originalLength = arr.length;

  if (originalLength === 0) {
    throw new Error("Empty arrays are not supported");
  }

  if (originalLength >= n) {
    // If the array is larger or equal in size to n
    const result = [arr[0]];
    if (n === 1) return result;
    const step = (originalLength - 1) / (n - 1);
    for (let i = 1; i < n - 1; i++) {
      result.push(arr[Math.round(i * step)]);
    }
    result.push(arr[originalLength - 1]);
    return result;
  } else {
    // If the array is smaller than n, repeat the array elements
    const result: string[] = [];
    for (let i = 0; i < n; i++) {
      result.push(arr[i % originalLength]);
    }
    return result;
  }
}
