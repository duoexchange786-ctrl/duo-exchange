import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const srcDir = path.join(rootDir, 'src');

const imageDirs = [
  path.join(publicDir, 'image'),
  path.join(publicDir, 'images')
];

function getAllFiles(dirPath, arrayOfFiles) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

// Get all image files
let allImagePaths = [];
imageDirs.forEach(dir => {
  allImagePaths = allImagePaths.concat(getAllFiles(dir, []));
});

// Get all files to search for usages
let allSearchableFiles = [];
allSearchableFiles = allSearchableFiles.concat(getAllFiles(srcDir, []));
if (fs.existsSync(path.join(publicDir, 'css'))) {
  allSearchableFiles = allSearchableFiles.concat(getAllFiles(path.join(publicDir, 'css'), []));
}
if (fs.existsSync(path.join(publicDir, 'manifest.json'))) {
  allSearchableFiles.push(path.join(publicDir, 'manifest.json'));
}

console.log(`Found ${allImagePaths.length} image files.`);
console.log(`Found ${allSearchableFiles.length} files to search in.`);

// Read contents of all searchable files
const fileContents = allSearchableFiles.map(filePath => fs.readFileSync(filePath, 'utf8'));
const concatenatedContent = fileContents.join('\n');

let unusedCount = 0;
for (const imagePath of allImagePaths) {
  const imageName = path.basename(imagePath);
  
  // We check if the exact image name exists within a path or string literal
  // Examples: src="/image/bell.png", url('images/bell.png'), url(../images/bell.png), "bell.png"
  const escapedImageName = imageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`['"\`\\\\/]${escapedImageName}['"\\\\\`)]?`, 'i');
  
  // Exclude some core files that might be dynamically referenced or we know we need
  const keepList = ['favicon.ico', 'logo-192.png', 'logo-512.png', 'logo-icon.png'];
  
  if (keepList.includes(imageName)) {
    continue;
  }

  // To be safe against comments, we could strip comments from JS/CSS first, but for now strict regex helps.
  if (!regex.test(concatenatedContent)) {
    console.log(`Unused image found and deleted: ${imageName} (${imagePath})`);
    fs.unlinkSync(imagePath);
    unusedCount++;
  }
}

console.log(`Finished checking. Deleted ${unusedCount} unused images.`);
