import { storage, auth } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export type ImageFolder = 'logos' | 'hero' | 'about' | 'services' | 'projects' | 'blog' | 'general';

interface UploadOptions {
  folder: ImageFolder;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Validates and compresses an image File in browser canvas before uploading.
 * Returns a Blob ready for Storage upload.
 */
export async function compressImageToBlob(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<{ blob: Blob; mimeType: string; extension: string }> {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error('Formato inválido. Por favor envie imagens JPG, PNG, WebP ou SVG.');
  }

  // If SVG or small PNG/WebP with transparency, check if SVG
  if (file.type === 'image/svg+xml') {
    return { blob: file, mimeType: 'image/svg+xml', extension: 'svg' };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler arquivo de imagem.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Não foi possível decodificar o arquivo de imagem.'));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Falha ao inicializar o processador de imagem 2D.'));
          return;
        }

        // For PNG or WebP with transparency, keep transparent background
        const isPngOrWebp = file.type === 'image/png' || file.type === 'image/webp';
        if (!isPngOrWebp) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Determine output MIME type
        const outputMime = isPngOrWebp ? 'image/webp' : 'image/jpeg';
        const extension = isPngOrWebp ? 'webp' : 'jpg';

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Falha ao gerar blob de imagem comprimida.'));
              return;
            }
            resolve({ blob, mimeType: outputMime, extension });
          },
          outputMime,
          quality
        );
      };

      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      } else {
        reject(new Error('Erro inesperado no FileReader.'));
      }
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file to Firebase Storage and returns the permanent public download URL.
 * File is organized in folder path: `site-images/${folder}/${timestamp}_${randomId}.${ext}`
 */
export async function uploadSiteImage(
  file: File,
  options: UploadOptions
): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('Permissão negada: É necessário estar autenticado como administrador para enviar imagens.');
  }

  const { folder, maxWidth = 1600, maxHeight = 1600, quality = 0.85 } = options;

  // 1. Compress image to optimized Blob
  const { blob, mimeType, extension } = await compressImageToBlob(file, maxWidth, maxHeight, quality);

  // 2. Generate clean, collision-free filename
  const cleanBaseName = file.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 30);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const finalFilename = `${timestamp}_${cleanBaseName}_${randomSuffix}.${extension}`;
  const storagePath = `site-images/${folder}/${finalFilename}`;

  // 3. Upload to Firebase Storage
  const storageReference = ref(storage, storagePath);
  const metadata = {
    contentType: mimeType,
    customMetadata: {
      originalName: file.name,
      uploadedBy: auth.currentUser.uid,
      uploadedAt: new Date().toISOString(),
      folder
    }
  };

  const uploadResult = await uploadBytes(storageReference, blob, metadata);
  
  // 4. Retrieve permanent download URL
  const downloadUrl = await getDownloadURL(uploadResult.ref);
  return downloadUrl;
}
