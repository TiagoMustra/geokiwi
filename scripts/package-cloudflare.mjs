import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { deflateRawSync } from 'node:zlib';

const root = resolve('dist');
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile()) files.push({ path, name: relative(root, path).split('\\').join('/') });
  }
}
await walk(root);
files.sort((a, b) => a.name.localeCompare(b.name));
if (!files.some(file => file.name === 'index.html')) throw Error('Run the production build first.');
if (files.length > 1000) throw Error('More than 1,000 files: use Wrangler instead of dashboard upload.');
if (files.some(file => file.name === '_worker.js' || file.name.startsWith('.openai/'))) throw Error('Expected a plain Vite build, without hosting-specific runtime files.');
const table = Array.from({ length: 256 }, (_, n) => {
  for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
const crc32 = data => { let crc = 0xffffffff; for (const byte of data) crc = table[(crc ^ byte) & 255] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; };
const chunks = [], central = [];
let offset = 0;
for (const file of files) {
  const data = await readFile(file.path);
  if (data.length > 25 * 1024 * 1024) throw Error(`File exceeds the Pages limit: ${file.name}`);
  const name = Buffer.from(file.name), compressed = deflateRawSync(data), crc = crc32(data);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6); header.writeUInt16LE(8, 8);
  header.writeUInt16LE(33, 12); header.writeUInt32LE(crc, 14); header.writeUInt32LE(compressed.length, 18); header.writeUInt32LE(data.length, 22); header.writeUInt16LE(name.length, 26);
  const entry = Buffer.alloc(46);
  entry.writeUInt32LE(0x02014b50); entry.writeUInt16LE(20, 4); entry.writeUInt16LE(20, 6); entry.writeUInt16LE(0x800, 8); entry.writeUInt16LE(8, 10); entry.writeUInt16LE(33, 14);
  entry.writeUInt32LE(crc, 16); entry.writeUInt32LE(compressed.length, 20); entry.writeUInt32LE(data.length, 24); entry.writeUInt16LE(name.length, 28); entry.writeUInt32LE(offset, 42);
  chunks.push(header, name, compressed); central.push(entry, name); offset += header.length + name.length + compressed.length;
}
const directory = Buffer.concat(central), end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
await mkdir('releases', { recursive: true });
const output = resolve('releases/geokiwi-cloudflare-pages.zip');
await writeFile(output, Buffer.concat([...chunks, directory, end]));
console.log(`${output}\n${files.length} static files. Upload this ZIP to Cloudflare Pages.`);
