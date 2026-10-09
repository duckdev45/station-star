"""
福懋站前之星 外觀去背 + 樓層多邊形產生器
=========================================
輸入：外觀渲染圖（預設 source-render.png）
輸出（out/）：
  building.webp       2x 去背外觀（被樹／紅綠燈擋住的低樓層依立面規律補齊，1F 拉高為落地玻璃）
  tower-polys.json    每層樓的多邊形（1x 座標），給前端 hover／抽出樓層用
  debug-polys.png     多邊形疊圖，檢查對位用

用法：
  python -m venv .venv && . .venv/bin/activate
  pip install -r requirements.txt
  python build_tower.py                       # 用預設圖
  python build_tower.py --src new.png --scale 3   # 換更高解析的同角度渲染圖（scale = 相對原圖 386px 寬的倍數）
  cp out/building.webp ../../src/assets/building.webp
  cp out/tower-polys.json ../../src/data/tower-polys.json

注意：下方「這張渲染圖的參數」是依目前這張圖的構圖量出來的（樓層數、轉角位置、裁切範圍）。
換成不同角度或構圖的圖，需要重新調整這些參數並看 debug-polys.png 確認。
"""
import argparse, json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter, median_filter

# ---------- 這張渲染圖的參數（以 386px 寬的原圖為基準） ----------
TRACE_X = 328        # 右側立面上用來找樓板線的取樣欄
XC, XL = 196, 112    # V 形樓板線的轉角 x、左側立面邊緣 x
CUT_LINE = 22        # 從第幾條樓板線以下改用合成（避開樹與紅綠燈）
EXTRA_FLOORS = 4     # 合成的標準層數（5F、4F、3F、2F）
F1_RATIO = 1.6       # 1F 樓高 = 標準層 × 1.6
CROP_X = (58, 352)   # 輸出裁切範圍
TOP_FLOOR = 27


def cutout(img: Image.Image) -> np.ndarray:
    from rembg import new_session, remove
    out = remove(img, session=new_session('u2net'))
    return np.array(out)[:, :, 3].astype(float)


def trace_lines(gray: np.ndarray):
    """沿右側立面找每一層樓板的上緣，再往左右追蹤成一條線"""
    Is = gaussian_filter(gray, (0.8, 1.5))
    G = np.zeros_like(Is); G[1:-1] = Is[2:] - Is[:-2]
    H = gray.shape[0]
    col = G[:, TRACE_X - 1:TRACE_X + 2].mean(axis=1)
    cands = [y for y in range(60, H - 2) if col[y] > 25 and col[y] == col[max(0, y - 6):y + 7].max()]
    lines = []
    for y0 in cands:
        pts, y = {}, y0
        for x in range(TRACE_X, 104, -1):
            lo, hi = max(1, y - 2), min(H - 2, y + 3); y = lo + int(np.argmax(G[lo:hi, x])); pts[x] = y
        y = y0
        for x in range(TRACE_X, 342):
            lo, hi = max(1, y - 2), min(H - 2, y + 3); y = lo + int(np.argmax(G[lo:hi, x])); pts[x] = y
        lines.append(pts)
    # 每層有上下兩道邊，取每組的第一道
    sel, prev = [], -99
    for p in sorted([p for p in lines if p[TRACE_X] > 80], key=lambda p: p[TRACE_X]):
        if p[TRACE_X] - prev > 15: sel.append(p); prev = p[TRACE_X]
    return sel


def fit_model(sel):
    """每條線擬合成 V 形（轉角 + 左右斜率），再對樓層序號做線性平滑"""
    rows = []
    for p in sel:
        xs = np.array(sorted(p)); ys = median_filter(np.array([p[x] for x in xs], float), 9)
        m = (xs >= 145) & (xs <= 225); xc = xs[m][np.argmin(ys[m])]
        r = (xs >= xc + 12) & (xs <= 336); l = (xs >= 112) & (xs <= xc - 12)
        br = np.polyfit(xs[r], ys[r], 1); bl = np.polyfit(xs[l], ys[l], 1) if l.sum() > 5 else br
        rows.append(((np.polyval(br, xc) + np.polyval(bl, xc)) / 2, br[0], bl[0]))
    rows = np.array(rows); K = np.arange(len(rows)); use = K <= 24
    fits = [np.polyfit(K[use], rows[use, i], 1) for i in range(3)]
    def line(k, x):
        x = np.maximum(np.asarray(x, float), XL)
        yc, sr, sl = (np.polyval(f, k) for f in fits)
        return np.where(x >= XC, yc + sr * (x - XC), yc + sl * (x - XC))
    return line


def synthesize(src, alpha, line):
    """CUT_LINE 以下：逐欄依該欄的樓層週期往下複製乾淨的一層，最後補一層挑高 1F"""
    H, W = alpha.shape; xs = np.arange(W)
    L21, L22 = line(CUT_LINE - 1, xs), line(CUT_LINE, xs); P = L22 - L21
    L26 = L22 + EXTRA_FLOORS * P; L27 = L26 + F1_RATIO * P
    NH = int(np.ceil(L27.max())) + 2
    out = np.zeros((NH, W, 4)); out[:H, :, :3] = src; out[:H, :, 3] = alpha

    def samp(arr, x, yf):
        y0 = np.floor(yf).astype(int); t = yf - y0; y1 = np.minimum(y0 + 1, H - 1)
        return arr[y0, x] * (1 - t)[..., None] + arr[y1, x] * t[..., None] if arr.ndim == 3 else arr[y0, x] * (1 - t) + arr[y1, x] * t

    for x in range(W):
        p, y22 = P[x], L22[x]
        ys = np.arange(int(np.floor(y22)), NH); ph = np.zeros_like(ys, float)
        a = ys < L26[x]; ph[a] = np.mod(ys[a] - y22, p)
        b = (ys >= L26[x]) & (ys < L27[x]); t = ys[b] - L26[x]; lip = 0.3 * p
        ph[b] = np.where(t < lip, t, lip + (t - lip) * (0.7 * p) / (F1_RATIO * p - lip))
        srcy = np.clip(L21[x] + ph, 0, H - 1.001); xx = np.full_like(ys, x)
        out[ys, x, :3] = samp(src, xx, srcy)
        out[ys, x, 3] = np.where(ys < L27[x], samp(alpha, xx, srcy), 0)
    return out, NH, (xs, L22, P, L27)


def polygons(line, extra, NH):
    xs, L22, P, L27 = extra; X0, X1 = CROP_X
    samp = np.array([XL, XC, X1], float)
    def at(k, frac):
        y = line(k, samp) if k <= CUT_LINE else np.interp(samp, xs, L22) + (k - CUT_LINE) * np.interp(samp, xs, P)
        return y + frac * np.interp(samp, xs, P)
    n = TOP_FLOOR; out = []
    for k in range(1, n + 1):
        top = at(k - 1, 0 if k == 1 else 0.3)
        bot = np.interp(samp, xs, L27) if k == n else at(k, 0.3)
        pts = [(round(x - X0, 1), round(y, 1)) for x, y in zip(samp, top)] + \
              [(round(x - X0, 1), round(y, 1)) for x, y in zip(samp[::-1], bot[::-1])]
        out.append({'floor': n + 1 - k, 'pts': pts, 'rightY': [round(float(top[-1]), 1), round(float(bot[-1]), 1)]})
    return {'w': X1 - X0, 'h': NH, 'polys': out}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default='source-render.png')
    ap.add_argument('--scale', type=float, default=1.0, help='來源圖相對 386px 原圖的倍數')
    ap.add_argument('--out', default='out')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    img = Image.open(a.src).convert('RGB')
    alpha_full = cutout(img)
    # 樓層偵測在 1x 基準上做，最後再輸出 2x 圖
    base = img.resize((round(img.width / a.scale), round(img.height / a.scale)), Image.LANCZOS) if a.scale != 1 else img
    alpha = np.array(Image.fromarray(alpha_full.astype(np.uint8)).resize(base.size, Image.LANCZOS)).astype(float)
    src = np.array(base).astype(float)
    line = fit_model(trace_lines(np.array(base.convert('L')).astype(float)))
    _, NH, extra = synthesize(src, alpha, line)          # 1x：給多邊形用
    # 2x 輸出直接從來源圖取樣（來源越清楚，輸出越清楚）
    S = 2
    hi = img.resize((base.width * S, base.height * S), Image.LANCZOS)
    alpha_hi = np.array(Image.fromarray(alpha_full.astype(np.uint8)).resize(hi.size, Image.LANCZOS)).astype(float)
    out_hi, _, _ = synthesize(np.array(hi).astype(float), alpha_hi, lambda k, x: line(k, np.asarray(x, float) / S) * S)
    canvas = np.zeros((NH * S, out_hi.shape[1], 4)); h = min(NH * S, out_hi.shape[0]); canvas[:h] = out_hi[:h]
    big = Image.fromarray(np.clip(canvas, 0, 255).astype(np.uint8), 'RGBA').crop((CROP_X[0] * S, 0, CROP_X[1] * S, NH * S))
    rgb = big.convert('RGB').filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))
    big = Image.merge('RGBA', (*rgb.split(), big.split()[3]))
    big.save(os.path.join(a.out, 'building.webp'), quality=88, method=6)
    data = polygons(line, extra, NH)
    json.dump(data, open(os.path.join(a.out, 'tower-polys.json'), 'w'))
    dbg = Image.new('RGBA', big.size, (60, 50, 40, 255)); dbg.alpha_composite(big); d = ImageDraw.Draw(dbg)
    for i, p in enumerate(data['polys']):
        d.polygon([(x * 2, y * 2) for x, y in p['pts']], outline=(255, 80, 80) if i % 2 else (80, 255, 140))
    dbg.save(os.path.join(a.out, 'debug-polys.png'))
    print(f"done: {big.size} → {a.out}/")


if __name__ == '__main__':
    main()
