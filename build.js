// build.js
// Usage: node build.js
import { build } from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'
import { rm, mkdir, cp, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// === config rapide ===
const entry = 'src/server.js'             // ton fichier principal Fastify
const outdir = 'axelior_build'
const outFile = 'server.js'
const assetsDir = 'public'             // change si tu as des assets/statics
const targetNode = 'node20'            // adapte si besoin

async function main () {
  // clean dist/
  if (existsSync(outdir)) await rm(outdir, { recursive: true, force: true })
  await mkdir(outdir, { recursive: true })

  // build (bundle single file ESM pour Node)
  await build({
    entryPoints: [entry],
    outfile: path.join(outdir, outFile),
    bundle: true,
    platform: 'node',
    target: [targetNode],
    format: 'esm',            // garde l’ESM si ton code est en "type": "module"
    sourcemap: true,
    minify: false,            // passe à true en prod si tu veux
    plugins: [
      nodeExternalsPlugin({   // exclut node_modules de ton bundle
        packagePaths: [process.cwd()]
      })
    ],
    // optionnel: définir des variables d'env au build
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    }
  })

  // copie les assets statiques s’il y en a
  if (existsSync(assetsDir)) {
    await cp(assetsDir, path.join(outdir, assetsDir), { recursive: true })
  }

  // écrit un launcher pour prod (utile si ton "type":"module" n’est pas copié)
  await writeFile(
    path.join(outdir, 'start.js'),
    `import('./${outFile}');\n`
  )

  // petite note de déploiement
  await writeFile(
    path.join(outdir, 'README.deploy.txt'),
    [
      'Lancer en prod:',
      '  node dist/start.js',
      '',
      'Exposer HOST/PORT via env si besoin:',
      '  HOST=0.0.0.0 PORT=3000 node dist/start.js',
      ''
    ].join('\n'),
    'utf8'
  )

  console.log('✅ Build OK →', outdir)
}

main().catch((err) => {
  console.error('❌ Build failed')
  console.error(err)
  process.exit(1)
})
