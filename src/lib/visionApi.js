/**
 * Vision API — sends image to backend, which calls GPT-5.4 vision.
 * If no image is provided, falls back to the mock endpoint.
 */
import { api } from "./api.js";

export async function analyzeFridgeImage(imageBlob, { signal } = {}) {
  void signal;
  if (imageBlob) {
    return api.scanReal(imageBlob);
  }
  return api.scanMock();
}
