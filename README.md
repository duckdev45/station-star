# 福懋站前之星｜樓層招租網頁

左側是建築外觀，可以逐層 hover／點選；右側顯示該層的 3D 等角剖切空間規劃、出租狀態與聯絡資訊。

**技術選型**：Vite 6 + React 19 + TypeScript + Tailwind CSS v4 + three.js（r170），套件管理用 pnpm。

## 開始

```bash
corepack enable        # 啟用 pnpm（package.json 已鎖定 pnpm@9.15.9）
pnpm install
pnpm dev               # http://localhost:5173
pnpm build             # 型別檢查 + 輸出到 dist/
pnpm preview           # 預覽 build 結果
```

需要 Node.js 20 以上。

## 目錄結構

```
src/
├─ data/                    ← 內容資料（日常只改這裡）
│  ├─ project.ts            建案名稱、標語、聯絡、樓層主題 ZONES、戶別坪數、已出租清單 LEASED
│  ├─ floors.ts             樓層計算（樓層型態、分區、可租戶數、預設規劃）
│  ├─ tower.ts              外觀圖座標系與每層多邊形
│  ├─ tower-polys.json      由 tools/tower-cutout 產生
│  └─ types.ts
├─ state/
│  ├─ floorState.tsx        目前樓層（鎖定／預覽）、手動切換的規劃、hover 中的戶
│  ├─ useElementSize.ts
│  └─ useMediaQuery.ts
├─ components/
│  ├─ stage/                左側：品牌、星、外觀與樓層列、分區標示
│  ├─ panel/                右側：樓層標題、圖例、戶別卡片、聯絡資訊
│  └─ floorplan/            3D 區塊的 React 外殼（方案切換、重設視角）
├─ engine/                  3D 引擎（純 TypeScript，不依賴 React）
│  ├─ FloorPlanEngine.ts    場景、正交相機、光影、快取、標籤投影、滑鼠偵測
│  ├─ buildFloor.ts         組一整層：樓板、立面、核心、兩戶配置
│  ├─ layouts.ts            各種空間規劃（自習中心、課程教室、創作工作室、企業總部、講堂、書店咖啡）
│  ├─ furniture.ts          家具與人物
│  ├─ primitives.ts         牆、玻璃隔間、立面窗、戶內座標系
│  ├─ merge.ts              合併 mesh + 插畫描邊
│  ├─ kit.ts                共用材質、幾何、固定種子亂數
│  └─ wallpaper.ts          櫃台主牆的插畫壁紙
├─ assets/                  去背外觀圖、福懋 logo（webp）
└─ index.css                Tailwind 匯入、色票、主題變數、動畫
design/brand/               福懋 logo 原檔（奶油、綠、灰褐）
tools/tower-cutout/         外觀去背與樓層多邊形產生器（Python）
```

## 常見修改

| 要改什麼 | 檔案 |
|---|---|
| 某戶租出去了 | `src/data/project.ts` → `LEASED` 加上 `'樓層-戶別'`，例如 `'18-S2'` |
| 坪數、戶別說明 | `src/data/project.ts` → `FLOOR_TYPES` |
| 樓層主題分區、各區預設規劃 | `src/data/project.ts` → `ZONES` |
| 標語、聯絡電話 | `src/data/project.ts` → `PROJECT` |
| 色票、字體、斷點 | `src/index.css` 的 `@theme` |

### 新增一種空間規劃

1. `src/data/types.ts` 的 `PresetId` 加一個 id
2. `src/data/project.ts` 的 `PRESETS` 加按鈕文字
3. `src/engine/layouts.ts` 寫配置函式，註冊到 `LAYOUTS`

配置函式用戶內座標 `(u, v)`：u 從分戶牆往外牆，v 從梯廳往建國三路，單位公尺。
同一個函式會自動鏡射到 S1、S2 兩戶。`L.pin(u, v, '名稱')` 會在 3D 上放編號並出現在圖例。

## 3D 引擎說明

- `FloorPlanEngine` 不依賴 React，React 端只負責 `show()`、`setHot()`、`resetCamera()`、`dispose()`。
- 每種「樓層型態 × 規劃 × 出租狀態」只建一次，之後從快取切換。
- 同材質物件會合併成單一 mesh 再加描邊，一層約幾十個 draw call。
- 3D 上的文字（編號、戶別、核心名稱）是 DOM，每次渲染時投影定位，樣式在 `index.css` 的 `.lb-*`。
- 光線強度已換算成 three r155+ 的物理單位；若升級 three 後畫面變暗或變亮，調 `FloorPlanEngine.ts` 的兩盞燈。

## 換外觀圖

目前用的是官網截圖（386px 寬），放大會有點糊。拿到同角度的高解析渲染圖後：

```bash
cd tools/tower-cutout
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
python build_tower.py --src 高解析圖.png --scale 3     # scale = 相對 386px 寬的倍數
cp out/building.webp ../../src/assets/building.webp
cp out/tower-polys.json ../../src/data/tower-polys.json
```

先看 `out/debug-polys.png` 確認每層對位。不同角度或構圖的圖，需要調整 `build_tower.py` 上方的參數。

## 部署

`pnpm build` 後把 `dist/` 放到任何靜態主機即可。若部署在子路徑（例如 `/leasing/`），在 `vite.config.ts` 加 `base: '/leasing/'`。

## 備註

- 出租狀態、樓層主題與空間配置目前是示意資料。
- 字體從 Google Fonts 載入（Noto Sans TC / Noto Serif TC），離線時會退回系統字體。
