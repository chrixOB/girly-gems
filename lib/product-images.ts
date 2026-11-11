import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

const imageDirectory = join(process.cwd(), "public", "product-images");
const uploadPattern = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
const storedImagePattern = /^\/product-images\/[a-f0-9-]{36}\.(?:jpg|png|webp)$/;
const extensionByType: Record<string, string> = { jpeg: "jpg", png: "png", webp: "webp" };

export async function persistProductImages(images: string[]) {
  const savedImages: string[] = [];

  try {
    await mkdir(imageDirectory, { recursive: true });
    const storedImages: string[] = [];
    for (const image of images) {
      const match = uploadPattern.exec(image);
      if (!match) {
        storedImages.push(image);
        continue;
      }

      const [, type, encodedImage] = match;
      const imageBuffer = Buffer.from(encodedImage, "base64");
      if (imageBuffer.length > 2 * 1024 * 1024) throw new Error("Product images must be 2 MB or smaller.");

      const fileName = `${randomUUID()}.${extensionByType[type]}`;
      await writeFile(join(imageDirectory, fileName), imageBuffer, { flag: "wx" });
      const imageUrl = `/product-images/${fileName}`;
      savedImages.push(imageUrl);
      storedImages.push(imageUrl);
    }
    return storedImages;
  } catch (error) {
    await deleteProductImages(savedImages);
    throw error;
  }
}

export async function deleteProductImages(images: string[]) {
  await Promise.all(images.filter((image) => storedImagePattern.test(image)).map(async (image) => {
    try {
      await unlink(join(imageDirectory, image.slice("/product-images/".length)));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }));
}