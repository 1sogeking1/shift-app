# PWAアイコンのセットアップガイド

## 現在の状態
SVGアイコンを使用していますが、一部のデバイス（特にiPhone）ではPNGアイコンが推奨されます。

## PNGアイコンの作成方法

### 方法1: オンラインツールを使用（推奨）

1. **RealFaviconGenerator** を使用
   - URL: https://realfavicongenerator.net/
   - `public/icon-maskable.svg` をアップロード
   - すべてのプラットフォーム用のアイコンを自動生成
   - 生成されたファイルを `public/` フォルダに配置

2. **PWA Asset Generator** を使用
   ```bash
   npx pwa-asset-generator public/icon-maskable.svg public/icons
   ```

### 方法2: 手動で変換

1. **Inkscape** や **GIMP** を使用してSVGをPNGに変換
2. 必要なサイズ:
   - 192x192 px (Android用)
   - 512x512 px (Android用)
   - 180x180 px (iOS用)

3. 生成したファイルを以下のように保存:
   ```
   public/
   ├── icon-192.png
   ├── icon-512.png
   └── apple-touch-icon.png (180x180)
   ```

4. `public/manifest.json` を更新:
   ```json
   "icons": [
     {
       "src": "/icon-192.png",
       "sizes": "192x192",
       "type": "image/png",
       "purpose": "any maskable"
     },
     {
       "src": "/icon-512.png",
       "sizes": "512x512",
       "type": "image/png",
       "purpose": "any maskable"
     }
   ]
   ```

5. `index.html` を更新:
   ```html
   <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
   ```

## 確認方法

1. デプロイ後、Chromeの開発者ツールを開く
2. Application タブ → Manifest を確認
3. アイコンが正しく表示されているか確認

## 注意事項

- SVGアイコンは軽量で拡大縮小に強い
- PNGアイコンは古いブラウザとの互換性が高い
- 両方を用意することで、すべてのデバイスに対応可能
