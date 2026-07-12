# Developpement local

## Prerequis

- Node.js 24 portable deja disponible dans `.tools/node`.
- Git for Windows.

## Lancer le jeu

```powershell
$nodeDir = Join-Path (Get-Location) '.tools\node\node-v24.18.0-win-x64'
$env:PATH = "$nodeDir;$env:PATH"
npm install
npm run dev
```

URL locale:

```text
http://127.0.0.1:5176/
```

## Build

```powershell
npm run build
```

## Backend mock

```powershell
npm run backend
```

URL:

```text
http://127.0.0.1:8787/api/health
```

## Tests de base

```powershell
npm test
```

