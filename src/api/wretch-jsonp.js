import wretch from 'wretch';
import fetchJSONP from 'fetch-jsonp';

/**
 * Creating a middleware instead of using polyfills:
 * @see https://github.com/elbywan/wretch/issues/17#issuecomment-369852335
 * @type {import('wretch').ConfiguredMiddleware}
 */
const jsonpMiddleware = () => (url, options) => {
  // Return your own fetch polyfill instead of calling next
  // (next is the global fetch here since this middleware is the terminating one)
  return fetchJSONP(url, options);
};

export default wretch().middlewares([jsonpMiddleware]);
