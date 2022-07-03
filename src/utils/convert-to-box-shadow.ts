export function urlToImage(file: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
  const image = new Image();
  image.crossOrigin = 'Anonymous';
  image.src = file;
    image.onload = (): void => resolve(image);
    image.onerror = (): void => reject();
  });
}

export async function fileToImage(file: any): Promise<HTMLImageElement> {
  return new Promise(async (resolve, reject) => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    // @ts-ignore
    reader.onload = async (event) => resolve(await urlToImage(event?.target?.result));
    reader.onerror = (error): void => reject(error);
  });
}

function supportsOffscreenCanvas(): boolean {
  return false;
  // return typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope && typeof OffscreenCanvas !== 'undefined';
}

interface Location {
  x: number;
  y: number;
}

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}


function bufferToBoxShadow({ x, y }: Location, { r, g, b, a }: Color) {
  return `, ${x}em ${y}em rgba(${r}, ${g}, ${b}, ${a})`;
}

export function convertImageDataToBoxShadow(imageData: ImageData, width: number): string {
  let boxShadow = "";
  for (let pixel = 0; pixel < imageData.data.length / 4.0; pixel++) {
    const position = pixel * 4;

    boxShadow += bufferToBoxShadow(
      {
        x: pixel % width,
        y: Math.floor(pixel / width),
      },
      {
        r: imageData.data[position],
        g: imageData.data[position + 1],
        b: imageData.data[position + 2],
        a: imageData.data[position + 3] / 255
      }
    );
  }

  return boxShadow.substring(1);
}

export default async function convertToBoxShadow(image: any, pixelsPerPixel = 1): Promise<{ boxShadow: string; width: number }> {
  const { naturalWidth, naturalHeight } = image;

  const width = Math.floor(naturalWidth / pixelsPerPixel);
  const height = Math.floor(naturalHeight / pixelsPerPixel);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create canvas context.');
  }

  ctx.drawImage(image, 0, 0, naturalWidth, naturalHeight, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);


  return {boxShadow: convertImageDataToBoxShadow(imageData, width), width };
}
