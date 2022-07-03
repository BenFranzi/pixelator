import { convertImageDataToBoxShadow } from "./convert-to-box-shadow";



export default () => {
  function supportsOfscreenCanvas() {
    return typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope && typeof OffscreenCanvas !== 'undefined';
  }

  if (!supportsOfscreenCanvas()) {
    console.error('no worker + offscreen canvas support.');
    return;
  }

  self.onmessage = function (event) {
    const result = convertImageDataToBoxShadow(event.data.imageData, event.data.width);
    postMessage(result);
  }
}



