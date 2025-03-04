
/**
 * Utility function to get query parameters from the URL
 * @param name The name of the query parameter to retrieve
 * @returns The value of the query parameter or null if not found
 */
export const getQueryParam = (name: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

export default getQueryParam;
