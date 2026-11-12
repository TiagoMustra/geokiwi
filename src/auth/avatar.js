export const AVATAR_BUCKET = 'avatars';
export const AVATAR_BYTES = 512 * 1024;
export const AVATAR_INPUT_BYTES = 10 * 1024 * 1024;
export const avatarPath = id => `${id}/avatar.webp`;
const failure = code => Object.assign(new Error(code), { code });

export function validateAvatarFile(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file?.type)) throw failure('avatar_type');
  if (!file.size || file.size > AVATAR_INPUT_BYTES) throw failure('avatar_size');
}

/** Decode and re-encode a square thumbnail; original files and their metadata never upload. */
export async function prepareAvatar(file) {
  validateAvatarFile(file);
  let image;
  try { image = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch { throw failure('avatar_read'); }
  try {
    if (!image.width || !image.height || image.width * image.height > 40_000_000) throw failure('avatar_size');
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 320;
    const context = canvas.getContext('2d');
    const side = Math.min(image.width, image.height);
    context.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 320, 320);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.85));
    if (!blob || blob.type !== 'image/webp' || blob.size > AVATAR_BYTES) throw failure('avatar_read');
    return blob;
  } finally { image.close(); }
}

export async function signAvatar(client, path) {
  if (!path) return null;
  const { data, error } = await client.storage.from(AVATAR_BUCKET).createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export async function saveAvatar(client, owner, blob) {
  if (blob.type !== 'image/webp' || !blob.size || blob.size > AVATAR_BYTES) throw failure('avatar_type');
  const path = avatarPath(owner);
  const { error } = await client.storage.from(AVATAR_BUCKET).upload(path, blob, { upsert: true, contentType: 'image/webp', cacheControl: '60' });
  if (error) throw error;
  const result = await client.from('profiles').update({ avatar_path: path }).eq('id', owner);
  if (result.error) throw result.error;
  return { avatar_path: path, avatar_url: await signAvatar(client, path) };
}

export async function removeAvatar(client, owner) {
  const { error } = await client.from('profiles').update({ avatar_path: null }).eq('id', owner);
  if (error) throw error;
  // Once unlinked, an unreachable storage object does not block removing the photo.
  await client.storage.from(AVATAR_BUCKET).remove([avatarPath(owner)]).catch(() => {});
  return { avatar_path: null, avatar_url: null };
}
