import Bowser from 'bowser';

const result = Bowser.parse(navigator.userAgent);

if (process.env.NODE_ENV === 'development') { // eslint-disable-line no-undef
  console.log('Browser and platform detection', result); // eslint-disable-line no-console
}

export default result;
export const isSafari = result.browser.name === 'Safari';
export const isiPad = result.platform.model === 'iPad';
