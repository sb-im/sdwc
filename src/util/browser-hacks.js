import * as B from '@/constants/browser';

if (B.isSafari && B.isiPad) {
  document.body.classList.add('sd--safari');
}
