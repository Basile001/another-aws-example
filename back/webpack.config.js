const path = require('path');
const { readdirSync, statSync } = require('fs');
const exec = require('child_process').execSync;

const getAllFiles = function (dirPath, arrayOfFiles) {
  files = readdirSync(dirPath)
  arrayOfFiles = arrayOfFiles || []

  files.forEach(function (file) {
    if (statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(`./${dirPath}/${file}`)
    }
  })

  return arrayOfFiles
}

const dir = 'src/handlers';

const entry = getAllFiles(dir)
  .filter(item => /\.(t|j)s$/.test(item))
  .filter(item => !/\.d\.(t|j)s$/.test(item))
  .reduce((acc, fileName) => ({
    ...acc,
    [path.basename(fileName).replace(/\.(t|j)s$/, '')]: `${fileName}`
  }), {})
const distFolder = 'bin';
const distPath = path.resolve(process.cwd(), distFolder);
console.log(entry)

module.exports = {
  entry,
  output: {
    path: distPath
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.tsx', '.ts', '.js', '.json'],
  },
  target: 'node',
  mode: 'production',
  plugins: [
    {
      apply: compiler => {
        compiler.hooks.done.tap(
          'ZipPlugin',
          () => {
            Object.keys(entry).forEach(name => {
              exec(`zip ${name}.zip ${name}.js`, { cwd: distPath })
              //exec(`7z a ${name}.zip ${name}.js`, { cwd: distPath })// FOR WINDOWS
            })
            exec(`rm *.js`, { cwd: distPath })
            //exec(`del *.js`, { cwd: distPath }); //FOR WINDOWS
            console.info(
              'produced deployment packages:\n\n',
              Object.keys(entry).map(name => '  💾  ./' + path.join('./', distFolder, `${name}.zip`)).join('\n\n '),
              '\n'
            );
          });
      }
    }
  ]
};