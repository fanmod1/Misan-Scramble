# Copyright (c) 2026 fanmod
# First-party code: MIT (see LICENSE). Third-party notices: THIRD_PARTY_NOTICES.txt.
"""MisanScramble v1.4 — standalone core (Python 3.10+, NumPy, Pillow).

Public API: process(mode, input, cover, key, output, progress).

Gilbert traversal adapted from iris10086/pic-scramble (MIT) and

jakubcerveny/gilbert (BSD-2-Clause); see THIRD_PARTY_NOTICES.txt.


"""

VERSION = "v1.4"
AUTHOR = "fanmod"

__all__ = ["process", "VERSION", "AUTHOR"]

cfbch_EXP = [0] * 126

cfbch_LOG = [-1] * 64

cfbch_value = 1

for cfbch_i in range(63):

    cfbch_EXP[cfbch_i] = cfbch_value

    cfbch_LOG[cfbch_value] = cfbch_i

    cfbch_value <<= 1

    if cfbch_value & 64:

        cfbch_value ^= 67

for cfbch_i in range(63, 126):

    cfbch_EXP[cfbch_i] = cfbch_EXP[cfbch_i - 63]



def cfbch_mul(a, b):

    return 0 if not a or not b else cfbch_EXP[(cfbch_LOG[a] + cfbch_LOG[b]) % 63]



def cfbch_div(a, b):

    if not b:

        raise ValueError('GF division by zero')

    return 0 if not a else cfbch_EXP[(cfbch_LOG[a] - cfbch_LOG[b]) % 63]

cfbch_roots = set()

for cfbch_i in range(1, 11):

    cfbch_n = cfbch_i

    while cfbch_n not in cfbch_roots:

        cfbch_roots.add(cfbch_n)

        cfbch_n = 2 * cfbch_n % 63

cfbch_g = [1]

for cfbch_root in sorted(cfbch_roots):

    cfbch_p = [0] * (len(cfbch_g) + 1)

    for cfbch_i, cfbch_v in enumerate(cfbch_g):

        cfbch_p[cfbch_i] ^= cfbch_mul(cfbch_v, cfbch_EXP[cfbch_root])

        cfbch_p[cfbch_i + 1] ^= cfbch_v

    cfbch_g = cfbch_p

cfbch_GEN = sum((cfbch_v << cfbch_i for cfbch_i, cfbch_v in enumerate(cfbch_g)))



def cfbch_encode_word(message):

    raw = message << 27

    remainder = raw

    for i in range(62, 26, -1):

        if remainder & 1 << i:

            remainder ^= cfbch_GEN << i - 27

    return raw | remainder



def cfbch_syndromes(word):

    return [cfbch_evaluate(word, i) for i in range(1, 11)]



def cfbch_evaluate(word, root):

    s = 0

    for degree in range(63):

        if word & 1 << degree:

            s ^= cfbch_EXP[root * degree % 63]

    return s



def cfbch_decode_word(word):

    s = cfbch_syndromes(word)

    if not any(s):

        return (word >> 27, 0)

    c = [1] + [0] * 10

    b = c.copy()

    length = 0

    m = 1

    last = 1

    for n in range(10):

        discrepancy = s[n]

        for j in range(1, length + 1):

            discrepancy ^= cfbch_mul(c[j], s[n - j])

        if not discrepancy:

            m += 1

            continue

        saved = c.copy()

        factor = cfbch_div(discrepancy, last)

        for j in range(11 - m):

            c[j + m] ^= cfbch_mul(factor, b[j])

        if 2 * length <= n:

            length = n + 1 - length

            b = saved

            last = discrepancy

            m = 1

        else:

            m += 1

    positions = []

    for p in range(63):

        test = c[0]

        for j in range(1, length + 1):

            test ^= cfbch_mul(c[j], cfbch_EXP[-p * j % 63])

        if not test:

            positions.append(p)

    if len(positions) != length or length > 5:

        raise ValueError('BCH uncorrectable')

    for p in positions:

        word ^= 1 << p

    if any(cfbch_syndromes(word)):

        raise ValueError('BCH invalid corrected word')

    return (word >> 27, length)



def cfbch_encode(data):

    bits = ''.join((f'{v:08b}' for v in data))

    bits += '0' * (-len(bits) % 36)

    result = []

    for i in range(0, len(bits), 36):

        result.extend(map(int, f'{cfbch_encode_word(int(bits[i:i + 36], 2)):063b}'))

    return result



def cfbch_decode(bits):

    if len(bits) % 63:

        raise ValueError('Invalid BCH length')

    result = ''

    errors = 0

    for i in range(0, len(bits), 63):

        word = 0

        for bit in bits[i:i + 63]:

            word = word << 1 | int(bit)

        message, corrected = cfbch_decode_word(word)

        result += f'{message:036b}'

        errors += corrected

    return (bytes((int(result[i:i + 8], 2) for i in range(0, len(result) - 7, 8))), errors)

import zlib

import numpy as np



def cfboundary_encode(raw, w, h):

    a = np.unpackbits(np.frombuffer(raw, np.uint8))[:w * h].reshape(h, w)

    out = bytearray()

    prev = []

    older = []

    for row in a:

        edges = np.flatnonzero(row != np.r_[0, row[:-1]]).tolist()

        out.append(len(edges))

        for i, x in enumerate(edges):

            pred = 2 * prev[i] - older[i] if len(prev) == len(edges) == len(older) else prev[i] if len(prev) == len(edges) else edges[i - 1] + 1 if i else 0

            d = x - pred

            v = 2 * d if d >= 0 else -2 * d - 1

            while v >= 128:

                out.append(v & 127 | 128)

                v >>= 7

            out.append(v)

        older, prev = (prev, edges)

    return bytes(out)



def cfboundary_decode(data, w, h):

    p = 0

    prev = []

    older = []

    a = np.zeros((h, w), np.uint8)

    for y in range(h):

        if p >= len(data):

            raise ValueError('Truncated geometry transitions')

        n = data[p]

        p += 1

        edges = []

        if n > w:

            raise ValueError('Invalid transition count')

        for i in range(n):

            v = shift = 0

            for _ in range(3):

                if p >= len(data):

                    raise ValueError('Truncated transition')

                b = data[p]

                p += 1

                v |= (b & 127) << shift

                shift += 7

                if b < 128:

                    break

            else:

                raise ValueError('Invalid transition varint')

            pred = 2 * prev[i] - older[i] if len(prev) == n == len(older) else prev[i] if len(prev) == n else edges[i - 1] + 1 if i else 0

            delta = v // 2 if v % 2 == 0 else -(v // 2) - 1

            x = pred + delta

            if not 0 <= x < w or (edges and x <= edges[-1]):

                raise ValueError('Invalid transition position')

            edges.append(x)

        for i, x in enumerate(edges):

            if i % 2 == 0:

                a[y, x:edges[i + 1] if i + 1 < n else w] = 1

        older, prev = (prev, edges)

    raw = np.packbits(a).tobytes()

    if p != len(data) or cfboundary_encode(raw, w, h) != data:

        raise ValueError('Noncanonical transitions')

    return raw



def cfboundary_unpack(data, w, h):

    d = zlib.decompressobj()

    out = d.decompress(data, h * (1 + 3 * w) + 1)

    if len(out) > h * (1 + 3 * w) or not d.eof or d.unused_data:

        raise ValueError('Invalid transition stream')

    return cfboundary_decode(out, w, h)

import numpy as np

cfmask_CTX = [(-1, 0), (-2, 0), (-2, -1), (-1, -1), (0, -1), (1, -1), (2, -1), (-1, -2), (0, -2)]

cfmask_HALF = 1 << 31

cfmask_QUARTER = 1 << 30

cfmask_FULL = 1 << 32



def cfmask_encode(raw, w, h):

    a = np.unpackbits(np.frombuffer(raw, np.uint8))[:w * h].reshape(h, w)

    p = np.pad(a, ((2, 0), (2, 2)))

    counts = [[1, 1] for _ in range(512)]

    lo = 0

    hi = cfmask_FULL - 1

    pending = 0

    out = bytearray()

    nb = 0



    def put(bit):

        nonlocal nb

        if nb % 8 == 0:

            out.append(0)

        out[-1] |= bit << 7 - nb % 8

        nb += 1



    def emit(bit):

        nonlocal pending

        put(bit)

        for _ in range(pending):

            put(1 - bit)

        pending = 0

    for y in range(h):

        for x in range(w):

            ctx = 0

            for dx, dy in cfmask_CTX:

                ctx = ctx * 2 + int(p[y + 2 + dy, x + 2 + dx])

            v = int(a[y, x])

            c = counts[ctx]

            cut = lo + (hi - lo + 1) * c[0] // sum(c)

            if v:

                lo = cut

            else:

                hi = cut - 1

            while True:

                if hi < cfmask_HALF:

                    emit(0)

                elif lo >= cfmask_HALF:

                    emit(1)

                    lo -= cfmask_HALF

                    hi -= cfmask_HALF

                elif lo >= cfmask_QUARTER and hi < 3 * cfmask_QUARTER:

                    pending += 1

                    lo -= cfmask_QUARTER

                    hi -= cfmask_QUARTER

                else:

                    break

                lo *= 2

                hi = hi * 2 + 1

            c[v] += 1

            if sum(c) >= 16384:

                c[:] = [(v + 1) // 2 for v in c]

    pending += 1

    emit(0 if lo < cfmask_QUARTER else 1)

    for _ in range(32):

        put(0)

    return bytes(out)



def cfmask_decode(data, w, h):

    counts = [[1, 1] for _ in range(512)]

    p = np.zeros((h + 2, w + 4), np.uint8)

    lo = 0

    hi = cfmask_FULL - 1

    pos = 0



    def get():

        nonlocal pos

        if pos >= len(data) * 8:

            raise ValueError('Truncated arithmetic mask')

        v = data[pos // 8] >> 7 - pos % 8 & 1

        pos += 1

        return v

    code = 0

    for _ in range(32):

        code = code * 2 + get()

    for y in range(h):

        for x in range(w):

            ctx = 0

            for dx, dy in cfmask_CTX:

                ctx = ctx * 2 + int(p[y + 2 + dy, x + 2 + dx])

            c = counts[ctx]

            cut = lo + (hi - lo + 1) * c[0] // sum(c)

            v = int(code >= cut)

            p[y + 2, x + 2] = v

            if v:

                lo = cut

            else:

                hi = cut - 1

            while True:

                if hi < cfmask_HALF:

                    pass

                elif lo >= cfmask_HALF:

                    code -= cfmask_HALF

                    lo -= cfmask_HALF

                    hi -= cfmask_HALF

                elif lo >= cfmask_QUARTER and hi < 3 * cfmask_QUARTER:

                    code -= cfmask_QUARTER

                    lo -= cfmask_QUARTER

                    hi -= cfmask_QUARTER

                else:

                    break

                lo *= 2

                hi = hi * 2 + 1

                code = code * 2 + get()

            c[v] += 1

            if sum(c) >= 16384:

                c[:] = [(v + 1) // 2 for v in c]

    raw = np.packbits(p[2:, 2:-2].ravel()).tobytes()

    if cfmask_encode(raw, w, h) != data:

        raise ValueError('Noncanonical arithmetic mask')

    return raw



def cfmask_pack(raw, w, h, enhanced=False):

    import zlib

    if not 1 <= w <= 255 or not 1 <= h <= 255:

        raise ValueError('Invalid mask dimensions')

    a = b'\x01' + cfmask_encode(raw, w, h)

    b = b'\x00' + zlib.compress(raw, 9)

    best = a if len(a) < len(b) else b

    if enhanced:

        c = b'\x02' + zlib.compress(cfboundary_encode(raw, w, h), 9)

        if len(c) < len(best):

            best = c

    return best



def cfmask_unpack(data, w, h):

    import zlib, math

    if not data or not 1 <= w <= 255 or (not 1 <= h <= 255):

        raise ValueError('Invalid mask dimensions')

    if data[0] == 2:

        return cfboundary_unpack(data[1:], w, h)

    if data[0] == 1:

        return cfmask_decode(data[1:], w, h)

    if data[0] != 0:

        raise ValueError('Invalid mask mode')

    d = zlib.decompressobj()

    size = math.ceil(w * h / 8)

    out = d.decompress(data[1:], size + 1)

    if len(out) != size or not d.eof or d.unused_data:

        raise ValueError('Invalid compressed mask')

    return out

import hashlib

import numpy as np

from PIL import Image, ImageOps

try:

    import pillow_heif

    pillow_heif.register_heif_opener()

except ImportError:

    pass

cfpixels2_ITERATIONS = 300000

cfpixels2_MAX_KEY_BYTES = 16384



def cfpixels2_check_key(password):

    if not isinstance(password, str):

        raise ValueError('Password must be a string')

    key = password.encode('utf-8')

    if len(key) > cfpixels2_MAX_KEY_BYTES:

        raise ValueError('Password exceeds 16384 UTF-8 bytes')

    return key



def cfpixels2_derive(password, salt):

    return hashlib.pbkdf2_hmac('sha256', cfpixels2_check_key(password), bytes((67,111,110,116,111,117,114,70,105,108,108,45,118,49,49,0)) + salt, cfpixels2_ITERATIONS, 32)

import numpy as np



def cfstroke_field(base):

    strength = 255 - base[:, :, 0].astype(np.int32)

    h, w = strength.shape

    short = min(w, h)

    radius = max(16, (short * 16 + 81) // 162)

    halo = min(32, max(16, (short * 16 + 600) // 1200))

    ink = strength >= 128

    yy, xx = np.nonzero(strength > 0)

    count = np.zeros(len(xx), np.int64)

    sx = count.copy()

    sy = count.copy()

    sxx = count.copy()

    syy = count.copy()

    sxy = count.copy()

    for dy in range(-3, 4):

        for dx in range(-3, 4):

            x = xx + dx

            y = yy + dy

            hit = (x >= 0) & (x < w) & (y >= 0) & (y < h)

            v = np.zeros(len(xx), np.int64)

            v[hit] = ink[y[hit], x[hit]]

            count += v

            sx += v * dx

            sy += v * dy

            sxx += v * dx * dx

            syy += v * dy * dy

            sxy += v * dx * dy

    cx = count * sxx - sx * sx

    cy = count * syy - sy * sy

    cxy = count * sxy - sx * sy

    direction = np.argmax(np.stack([2 * cx, 2 * cy, cx + cy + 2 * cxy, cx + cy - 2 * cxy]), axis=0)

    dirs = np.array([[0, 1], [1, 0], [1, -1], [1, 1]])

    vx = dirs[direction, 0]

    vy = dirs[direction, 1]

    step = np.where((vx != 0) & (vy != 0), 23, 16)

    local = np.full(len(xx), radius, np.int64)

    for sign in [-1, 1]:

        start = np.zeros(len(xx), int)

        done = np.zeros(len(xx), bool)

        for n in range(1, (2 * radius + 80) // 16 + 1):

            x = xx + sign * vx * n

            y = yy + sign * vy * n

            inside = (x >= 0) & (x < w) & (y >= 0) & (y < h)

            v = np.zeros(len(xx), np.int32)

            v[inside] = strength[y[inside], x[inside]]

            first = (start == 0) & (v < 16)

            start[first] = n

            short_gap = (start > 0) & (v >= 128) & (n - start < 3)

            start[short_gap] = 0

            hit = ~done & inside & (start > 0) & (v >= 128)

            local[hit] = np.minimum(local[hit], np.maximum(16, ((n - start[hit]) * step[hit] - 32) // 2))

            done |= hit | ~inside

    smooth = np.full((h, w), 4095, np.int64)

    smooth[yy, xx] = local

    ax = np.arange(w, dtype=np.int64) * 16

    for y in range(h):

        if y:

            smooth[y] = np.minimum(smooth[y], smooth[y - 1] + 16)

            smooth[y, 1:] = np.minimum(smooth[y, 1:], smooth[y - 1, :-1] + 23)

            smooth[y, :-1] = np.minimum(smooth[y, :-1], smooth[y - 1, 1:] + 23)

        smooth[y] = np.minimum(4095, np.minimum.accumulate(smooth[y] - ax) + ax)

    for y in range(h - 1, -1, -1):

        if y + 1 < h:

            smooth[y] = np.minimum(smooth[y], smooth[y + 1] + 16)

            smooth[y, 1:] = np.minimum(smooth[y, 1:], smooth[y + 1, :-1] + 23)

            smooth[y, :-1] = np.minimum(smooth[y, :-1], smooth[y + 1, 1:] + 23)

        smooth[y] = np.minimum(4095, np.minimum.accumulate((smooth[y] + ax)[::-1])[::-1] - ax)

    local = smooth[yy, xx]

    radii = np.full((h, w), radius, np.int64)

    radii[yy, xx] = local

    B = 4096

    d = np.where(strength > 0, ((255 - strength) * 16 + 127) // 255, 4095).astype(np.int64) * B + radii

    axis = np.arange(w, dtype=np.int64) * 16 * B

    cap = 4095 * B + radius

    for y in range(h):

        if y:

            d[y] = np.minimum(d[y], d[y - 1] + 16 * B)

            d[y, 1:] = np.minimum(d[y, 1:], d[y - 1, :-1] + 23 * B)

            d[y, :-1] = np.minimum(d[y, :-1], d[y - 1, 1:] + 23 * B)

        d[y] = np.minimum(cap, np.minimum.accumulate(d[y] - axis) + axis)

    for y in range(h - 1, -1, -1):

        if y + 1 < h:

            d[y] = np.minimum(d[y], d[y + 1] + 16 * B)

            d[y, 1:] = np.minimum(d[y, 1:], d[y + 1, :-1] + 23 * B)

            d[y, :-1] = np.minimum(d[y, :-1], d[y + 1, 1:] + 23 * B)

        d[y] = np.minimum(cap, np.minimum.accumulate((d[y] + axis)[::-1])[::-1] - axis)

    r = d % B

    d = d // B

    outer = (np.clip(r + 16 - d, 0, 16) * 255 + 8) // 16

    inner = (np.clip(r - np.minimum(halo, np.maximum(8, r // 4)) + 16 - d, 0, 16) * 255 + 8) // 16

    return (inner, outer, dict(stroke_expansion_px=radius / 16, stroke_halo_px=halo / 16, minimum_local_radius_px=float(local.min() / 16) if len(local) else radius / 16, thin_fraction=float((local < radius).mean()) if len(local) else 0))

cfstroke_PALETTE = np.array([[248, 240, 16], [248, 168, 16], [248, 88, 24], [248, 40, 64], [240, 24, 208], [168, 48, 248], [48, 96, 248], [16, 224, 248], [128, 240, 24], [244, 244, 244], [12, 12, 12], [16, 32, 88], [112, 16, 104], [12, 72, 32]], np.int32)



def cfstroke_accent(out, base, state, bg, outer):

    h, w = state.shape

    step = max(1, (min(w, h) + 127) // 128)

    take = outer[::step, ::step] > 0

    samples = np.where((state[::step, ::step] == 0)[:, :, None], bg[::step, ::step, :3], out[::step, ::step, :3])[take].astype(np.int32)

    if not len(samples):

        samples = bg[::step, ::step, :3].reshape(-1, 3).astype(np.int32)

    yy = (samples @ np.array([19595, 38470, 7471]) + 32768) // 65536

    rg = samples[:, 0] - samples[:, 1]

    by = 2 * samples[:, 2] - samples[:, 0] - samples[:, 1]

    best = None

    best_score = -10 ** 20

    for c in cfstroke_PALETTE:

        cy = int((c @ np.array([19595, 38470, 7471]) + 32768) // 65536)

        ds = 4 * abs(cy - yy) + abs(int(c[0] - c[1]) - rg) + abs(int(2 * c[2] - c[0] - c[1]) - by) // 2

        hist = np.bincount(ds, minlength=2048)

        rank = max(1, (len(ds) + 4) // 5)

        q = int(np.searchsorted(np.cumsum(hist), rank))

        mean = int(ds.sum()) // len(ds)

        near = int((ds < 200).sum()) * 1000 // len(ds)

        score = 4 * q + 2 * mean + int(c.max() - c.min()) - near

        if score > best_score:

            best_score = score

            best = c

    return best



def cfstroke_reservation(cover):

    inner, outer, info = cfstroke_field(cover)

    return outer == 255



def cfstroke_render(out, base, state, bg):

    inner, outer, info = cfstroke_field(base)

    fg = cfstroke_accent(out, base, state, bg, outer)

    lum = int((fg @ np.array([19595, 38470, 7471]) + 32768) // 65536)

    border = 12 if lum >= 128 else 244

    empty = state == 0

    for c in range(3):

        ring = (bg[:, :, c].astype(np.int32) * (255 - outer) + border * outer + 127) // 255

        color = (ring * (255 - inner) + int(fg[c]) * inner + 127) // 255

        out[:, :, c][empty] = color[empty]

    return dict(info, accent=fg.tolist())

import math

import numpy as np



def cfsketch_skeleton(ink):

    ink = ink.copy()

    for iteration in range(48):

        changed = False

        for phase in (0, 1):

            a = np.pad(ink, 1)

            n = [a[:-2, 1:-1], a[:-2, 2:], a[1:-1, 2:], a[2:, 2:], a[2:, 1:-1], a[2:, :-2], a[1:-1, :-2], a[:-2, :-2]]

            count = sum((p.astype(np.uint8) for p in n))

            turns = sum(((~n[i] & n[(i + 1) % 8]).astype(np.uint8) for i in range(8)))

            remove = ink & (count >= 2) & (count <= 6) & (turns == 1)

            remove &= ~(n[0] & n[2] & (n[4] if phase == 0 else n[6]))

            remove &= ~((n[2] if phase == 0 else n[0]) & n[4] & n[6])

            if remove.any():

                ink[remove] = 0

                changed = True

        if not changed:

            break

    return ink



def cfsketch_blur(a):

    a = a.astype(np.int32)

    p = np.pad(a, ((0, 0), (2, 2)), mode='edge')

    a = (p[:, :-4] + 4 * p[:, 1:-3] + 6 * p[:, 2:-2] + 4 * p[:, 3:-1] + p[:, 4:] + 8) // 16

    p = np.pad(a, ((2, 2), (0, 0)), mode='edge')

    return (p[:-4] + 4 * p[1:-3] + 6 * p[2:-2] + 4 * p[3:-1] + p[4:] + 8) // 16



def cfsketch_drawing(rgb, strength=0):

    g = (rgb[:, :, 0].astype(np.int32) * 19595 + rgb[:, :, 1].astype(np.int32) * 38470 + rgb[:, :, 2].astype(np.int32) * 7471 + 32768) // 65536

    if np.mean(g >= 240) > 0.65 and np.mean(g < 96) < 0.25:

        return cfsketch_skeleton(g < 144)

    a = np.pad(cfsketch_blur(cfsketch_blur(g)), 1, mode='edge')

    gx = -a[:-2, :-2] + a[:-2, 2:] - 2 * a[1:-1, :-2] + 2 * a[1:-1, 2:] - a[2:, :-2] + a[2:, 2:]

    gy = -a[:-2, :-2] - 2 * a[:-2, 1:-1] - a[:-2, 2:] + a[2:, :-2] + 2 * a[2:, 1:-1] + a[2:, 2:]

    mag = np.minimum(255, (np.abs(gx) + np.abs(gy) + 4) // 8)

    p = np.pad(mag, 1)

    ax = np.abs(gx)

    ay = np.abs(gy)

    same = gx * gy >= 0

    v1 = np.where(ax > 2 * ay, p[1:-1, :-2], np.where(ay > 2 * ax, p[:-2, 1:-1], np.where(same, p[:-2, :-2], p[:-2, 2:])))

    v2 = np.where(ax > 2 * ay, p[1:-1, 2:], np.where(ay > 2 * ax, p[2:, 1:-1], np.where(same, p[2:, 2:], p[2:, :-2])))

    thin = np.where((mag >= v1) & (mag > v2), mag, 0)

    hist = np.bincount(thin.ravel(), minlength=256)

    hist[:6] = 0

    high = max(12, int(np.searchsorted(np.cumsum(hist), hist.sum() * (0.6, 0.78, 0.9, 0.96)[strength])))

    low = max(6, int(high * (0.5, 0.65, 0.8, 0.9)[strength]))

    eligible = thin >= low

    seen = np.zeros_like(eligible)

    ink = np.zeros_like(eligible)

    h, w = ink.shape

    for yy, xx in zip(*np.nonzero(thin >= high)):

        if seen[yy, xx]:

            continue

        todo = [(yy, xx)]

        seen[yy, xx] = 1

        component = []

        while todo:

            y, x = todo.pop()

            component.append((y, x))

            for dy in (-1, 0, 1):

                for dx in (-1, 0, 1):

                    ny, nx = (y + dy, x + dx)

                    if 0 <= ny < h and 0 <= nx < w and eligible[ny, nx] and (not seen[ny, nx]):

                        seen[ny, nx] = 1

                        todo.append((ny, nx))

        if len(component) >= max(8 + strength * 8, w // 48):

            for y, x in component:

                ink[y, x] = 1

    return ink



def cfsketch_free_fraction(ink, short):

    h, w = ink.shape

    ow, oh = (int(short * w / h + 0.5), short) if w >= h else (short, int(short * h / w + 0.5))

    total = good = 0

    s = np.pad(ink.astype(np.int32), ((1, 0), (1, 0))).cumsum(0).cumsum(1)

    for y in range(oh // 16):

        for x in range(math.ceil(ow / 256), 15 * ow // 256):

            x0 = max(0, x * 16 * w // ow - 1)

            x1 = min(w, math.ceil((x + 1) * 16 * w / ow) + 1)

            y0 = max(0, y * 16 * h // oh - 1)

            y1 = min(h, math.ceil((y + 1) * 16 * h / oh) + 1)

            good += int(s[y1, x1] - s[y0, x1] - s[y1, x0] + s[y0, x0] == 0)

            total += 1

    return good / max(1, total)



def cfsketch_prepare(cover, count, resize):

    h, w = cover.shape[:2]

    size = 1024

    cw = max(8, int(w * min(1, size / max(w, h)) + 0.5))

    ch = max(8, int(h * min(1, size / max(w, h)) + 0.5))

    rgb = resize(cover[:, :, :3], cw, ch)

    ink = cfsketch_drawing(rgb, 0)

    short = max(640, int(math.sqrt(count * 256 * min(w, h) / max(w, h) / 0.65)))

    ratio = cfsketch_free_fraction(ink, short)

    return (np.repeat(np.where(ink, 0, 255).astype(np.uint8)[:, :, None], 3, 2), dict(sketch_level=size, sketch_strength=0, sketch_free_fraction=ratio, sketch_ink_fraction=float(ink.mean()), detail_preserved=True))



def cfsketch_marker_boxes(w, h):

    u = max(2, int(min(w, h) / 320 + 0.5))

    r = 4 * u + 3

    return [(w * x, h * y, r) for y in (1 / 32, 31 / 32) for x in (1 / 8, 7 / 8)]



def cfsketch_paint(out, base, state, resize):

    h, w = state.shape

    gw = (w + 7) // 8

    gh = (h + 7) // 8

    guide = np.zeros((gh, gw, 3), np.int32)

    known = np.zeros((gh, gw), bool)

    for y in range(gh):

        for x in range(gw):

            mask = state[y * 8:min(h, y * 8 + 8), x * 8:min(w, x * 8 + 8)] == 1

            v = out[y * 8:min(h, y * 8 + 8), x * 8:min(w, x * 8 + 8)]

            if mask.any():

                guide[y, x] = (v[mask].astype(np.int64).sum(0) + int(mask.sum()) // 2) // int(mask.sum())

                known[y, x] = 1

    if not known.any():

        guide[:] = 128

    for _ in range(gw + gh):

        if known.all() or not known.any():

            break

        s = np.zeros_like(guide)

        n = np.zeros_like(known, dtype=np.int32)

        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):

            p = np.pad(guide * known[:, :, None], ((1, 1), (1, 1), (0, 0)))

            k = np.pad(known, 1)

            s += p[1 + dy:1 + dy + gh, 1 + dx:1 + dx + gw]

            n += k[1 + dy:1 + dy + gh, 1 + dx:1 + dx + gw]

        fill = ~known & (n > 0)

        guide[fill] = (s[fill] + n[fill, None] // 2) // n[fill, None]

        known |= fill

    for _ in range(3):

        for c in range(3):

            guide[:, :, c] = cfsketch_blur(guide[:, :, c])

    bg = resize(guide.astype(np.uint8), w, h)

    empty = state == 0

    out[empty] = bg[empty]

    return cfstroke_render(out, base, state, bg)



def cfsketch__stroke_reservation(cover):

    return cfstroke_reservation(cover)

import math

import numpy as np



def cfframe_draw(out):

    h, w = out.shape[:2]

    u = max(2, int(min(w, h) / 320 + 0.5))

    for yy in (1 / 32, 31 / 32):

        for xx in (1 / 8, 7 / 8):

            cx = w * xx

            cy = h * yy

            r = 4 * u

            x0 = max(0, int(cx - r - 1))

            x1 = min(w, int(cx + r + 2))

            y0 = max(0, int(cy - r - 1))

            y1 = min(h, int(cy + r + 2))

            y, x = np.mgrid[y0:y1, x0:x1]

            d2 = (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2

            a = out[y0:y1, x0:x1]

            a[d2 <= (4 * u) ** 2] = 255

            a[d2 <= (3 * u) ** 2] = 12

            a[d2 <= (2 * u) ** 2] = 255

            a[d2 <= u * u] = 12



def cfframe_locate(image):

    h, w = image.shape[:2]

    gray = (image[:, :, 0].astype(np.int32) * 19595 + image[:, :, 1].astype(np.int32) * 38470 + image[:, :, 2].astype(np.int32) * 7471 + 32768) // 65536

    dark = gray < 128

    found = []

    for y in range(1, h - 1):

        cuts = np.flatnonzero(dark[y, 1:] != dark[y, :-1]) + 1

        starts = np.r_[0, cuts]

        ends = np.r_[cuts, w]

        lens = ends - starts

        for k in range(2, len(lens) - 2):

            if not dark[y, starts[k]]:

                continue

            rr = lens[k - 2:k + 3].astype(float)

            u = rr.sum() / 6

            if not 1 <= u <= max(w, h) / 40 or np.max(np.abs(rr - np.array([1, 1, 2, 1, 1]) * u)) > u * 0.7:

                continue

            cx = (starts[k] + ends[k]) / 2

            x = min(w - 1, int(cx))

            if any(((cx - f[0]) ** 2 + (y + 0.5 - f[1]) ** 2 <= (2 * f[2]) ** 2 for f in found)):

                continue

            top = y

            while top > 0 and dark[top - 1, x]:

                top -= 1

            bottom = y + 1

            while bottom < h and dark[bottom, x]:

                bottom += 1

            up = top - 1

            while up >= 0 and (not dark[up, x]):

                up -= 1

            up2 = up

            while up2 >= 0 and dark[up2, x]:

                up2 -= 1

            down = bottom

            while down < h and (not dark[down, x]):

                down += 1

            down2 = down

            while down2 < h and dark[down2, x]:

                down2 += 1

            vr = np.array([up - up2, top - 1 - up, bottom - top, down - bottom, down2 - down], float)

            v = vr.sum() / 6

            if abs(v / u - 1) > 0.35 or np.max(np.abs(vr - np.array([1, 1, 2, 1, 1]) * v)) > v * 0.7:

                continue

            cy = (top + bottom) / 2

            u = (u + v) / 2

            r = 3.6 * u

            x0 = max(0, int(cx - r))

            x1 = min(w, math.ceil(cx + r))

            y0 = max(0, int(cy - r))

            y1 = min(h, math.ceil(cy + r))

            yy, xx = np.mgrid[y0:y1, x0:x1]

            weight = np.maximum(0, 200 - gray[y0:y1, x0:x1])

            weight[(xx + 0.5 - cx) ** 2 + (yy + 0.5 - cy) ** 2 > r * r] = 0

            total = weight.sum()

            if total <= 0:

                continue

            cx = float(((xx + 0.5) * weight).sum() / total)

            cy = float(((yy + 0.5) * weight).sum() / total)

            yy, xx = np.mgrid[y0:y1, x0:x1]

            rad = np.sqrt((xx + 0.5 - cx) ** 2 + (yy + 0.5 - cy) ** 2) / u

            patch = gray[y0:y1, x0:x1]

            means = []

            for lo, hi in ((0, 0.8), (1.2, 1.8), (2.2, 2.8), (3.2, 3.7)):

                values = patch[(rad >= lo) & (rad <= hi)]

                means.append(float(values.mean()) if len(values) else 128.0)

            if min(means[1] - means[0], means[1] - means[2], means[3] - means[2]) < 65:

                continue

            found.append((cx, cy, u))

            if len(found) >= 64:

                break

        if len(found) >= 64:

            break

    best = None

    for a in found:

        for b in found:

            span = b[0] - a[0]

            if span < 128 or abs(b[1] - a[1]) > max(2, span * 0.004) or abs(b[2] / a[2] - 1) > 0.25:

                continue

            for c in found:

                tall = c[1] - a[1]

                if tall < 128 or abs(c[0] - a[0]) > max(2, tall * 0.004) or abs(c[2] / a[2] - 1) > 0.25:

                    continue

                for d in found:

                    if abs(d[0] - b[0]) > max(2, tall * 0.004) or abs(d[1] - c[1]) > max(2, span * 0.004) or abs(d[2] / a[2] - 1) > 0.25:

                        continue

                    ww = (b[0] + d[0] - (a[0] + c[0])) / 1.5

                    hh = (c[1] + d[1] - (a[1] + b[1])) / 1.875

                    left = (a[0] + c[0]) / 2 - ww / 8

                    top = (a[1] + b[1]) / 2 - hh / 32

                    if left < -0.8 or top < -0.8 or left + ww > w + 0.8 or (top + hh > h + 0.8):

                        continue

                    if best is None or ww * hh > best[0]:

                        best = (ww * hh, left, top, ww, hh)

    if best is None:

        return (image, dict(screenshot_registered=False, markers=len(found)))

    _, left, top, ww, hh = best

    x = max(0, int(left + 0.5))

    y = max(0, int(top + 0.5))

    x1 = min(w, int(left + ww + 0.5))

    y1 = min(h, int(top + hh + 0.5))

    return (image[y:y1, x:x1].copy(), dict(screenshot_registered=(x, y, x1, y1) != (0, 0, w, h), markers=4, bounds=[x, y, x1, y1]))

import math

import numpy as np



def cfpacking_plan(m, key, mask, curve, stream, maximum=8):

    if m['d'] >= 15 and maximum == 8:

        maximum = 1

    elif m['d'] >= 14 and maximum == 8:

        maximum = 64

    w, h, ow, oh = (m['w'], m['h'], m['ow'], m['oh'])

    nx, ny = (ow // 16, oh // 16)

    sc, sr = (math.ceil(w / 16), math.ceil(h / 16))

    cm = np.unpackbits(np.frombuffer(__import__('base64').b64decode(m['mask']), np.uint8))[:m['c'] * m['r']].reshape(m['r'], m['c'])

    Y, X = np.mgrid[:ny, :nx]

    mx = np.minimum(m['c'] - 1, ((X + 1) * m['c'] - 1) // nx)

    my = np.minimum(m['r'] - 1, ((Y + 1) * m['r'] - 1) // ny)

    free = (cm[my, mx] > 0) & (X >= (math.ceil(ow / 512) if m['d'] >= 14 else math.ceil(ow / 256) if m['d'] >= 13 else (math.ceil(ow / 64) + 1) // 2)) & (X < (31 * ow // 512 if m['d'] >= 14 else 15 * ow // 256 if m['d'] >= 13 else 7 * ow // 64 // 2))

    initial = free.copy()

    ii = np.pad(initial.astype(np.int32), ((1, 0), (1, 0))).cumsum(0).cumsum(1)

    cache = {}

    rng = stream(key, b'payload-rectangles\x00')

    source = mask.reshape(sr, sc)

    src_integral = np.pad(source.astype(np.int32), ((1, 0), (1, 0))).cumsum(0).cumsum(1)

    out = []

    dest = []



    def locate(ww, hh):

        shape = (ww, hh)

        if shape not in cache:

            if ww > nx or hh > ny:

                candidates = np.empty(0, np.int32)

            else:

                totals = ii[hh:, ww:] - ii[:-hh, ww:] - ii[hh:, :-ww] + ii[:-hh, :-ww]

                yy, xx = np.nonzero(totals == ww * hh)

                candidates = (yy * nx + xx).astype(np.int32)

            n = len(candidates)

            start = rng(n) if n else 0

            stride = 997

            while n and math.gcd(stride, n) != 1:

                stride += 2

            cache[shape] = [candidates, start, stride, 0]

        state = cache[shape]

        a, start, stride, cursor = state

        n = len(a)

        while cursor < n:

            tile = int(a[(start + cursor * stride) % n])

            cursor += 1

            state[3] = cursor

            dx, dy = (tile % nx, tile // nx)

            if free[dy:dy + hh, dx:dx + ww].all():

                return (dx, dy)

        return None



    def place(x, y, ww, hh):

        count = int(src_integral[y + hh, x + ww] - src_integral[y, x + ww] - src_integral[y + hh, x] + src_integral[y, x])

        if not count:

            return

        target = locate(ww, hh) if count == ww * hh else None

        if target is not None:

            dx, dy = target

            free[dy:dy + hh, dx:dx + ww] = False

            for v in range(hh):

                for u in range(ww):

                    out.append((y + v) * sc + x + u)

                    dest.append((dy + v) * nx + dx + u)

            return

        if ww == 1 and hh == 1:

            raise ValueError('Contour packing capacity exhausted')

        if ww >= hh and ww > 1:

            cut = ww // 2

            place(x, y, cut, hh)

            place(x + cut, y, ww - cut, hh)

        else:

            cut = hh // 2

            place(x, y, ww, cut)

            place(x, y + cut, ww, hh - cut)

    regions = [(x, y, min(maximum, sc - x), min(maximum, sr - y)) for y in range(0, sr, maximum) for x in range(0, sc, maximum)]

    for i in range(len(regions) - 1, 0, -1):

        j = rng(i + 1)

        regions[i], regions[j] = (regions[j], regions[i])

    for args in regions:

        place(*args)

    if len(out) != m['k']:

        raise ValueError('Incomplete payload mapping')

    if m['a']:

        remaining = curve(nx, ny)

        remaining = remaining[free.reshape(-1)[remaining]]

        if len(remaining) < len(out):

            raise ValueError('Insufficient alpha capacity')

        start = rng(len(remaining) - len(out) + 1)

        dest.extend(remaining[start:start + len(out)].tolist())

    return (np.array(out, np.int32), np.array(dest, np.int32))

import math

import numpy as np

from PIL import Image, ImageFilter



def cfrestore_palette(source):

    a = source[:, :, :3]

    p = np.pad(a, ((1, 1), (1, 1), (0, 0)), mode='edge')

    h, w = a.shape[:2]

    same = source[:, :, 3] == 255

    for dy, dx in [(0, -1), (0, 1), (-1, 0), (1, 0)]:

        same &= np.all(a == p[1 + dy:1 + dy + h, 1 + dx:1 + dx + w], axis=2)

    col = a[same].astype(np.int32)

    col = col[:, 0] * 65536 + col[:, 1] * 256 + col[:, 2]

    u, n = np.unique(col, return_counts=True)

    pairs = sorted([(int(count), int(v)) for v, count in zip(u, n) if count >= max(64, math.ceil(w * h / 64))], key=lambda p: (-p[0], p[1]))[:4]

    out = []

    for count, v in pairs:

        rgb = np.array([v >> 16, v >> 8 & 255, v & 255])

        ambiguous = False

        for other, num in zip(u, n):

            other = int(other)

            if other != v and num >= 4 and (np.max(np.abs(rgb - np.array([other >> 16, other >> 8 & 255, other & 255]))) <= 24):

                ambiguous = True

                break

        if not ambiguous:

            out.append(rgb.tolist())

    return out



def cfrestore_expand(work, m):

    if not m['t']:

        return work

    full = np.empty((m['fh'], m['fw'], 4), np.uint8)

    full[:] = np.frombuffer(bytes.fromhex(m['bg']), np.uint8)

    full[m['y']:m['y'] + m['h'], m['x']:m['x'] + m['w']] = work

    return full



def cfrestore_selective(im, pal):

    a = im[:, :, :3]

    guide = np.array(Image.fromarray(a).filter(ImageFilter.MedianFilter(3)))

    target = np.array(Image.fromarray(a).filter(ImageFilter.MedianFilter(5)))

    hi = np.array(Image.fromarray(guide).filter(ImageFilter.MaxFilter(3))).astype(float)

    lo = np.array(Image.fromarray(guide).filter(ImageFilter.MinFilter(3))).astype(float)

    gate = ((hi - lo).max(2) <= 24) & (np.abs(a.astype(float) - target).max(2) <= 64)

    chosen = target.copy()

    best = np.full(a.shape[:2], float('inf'))

    diff = a.astype(np.int16) - target

    norm = (diff.astype(np.int32) ** 2).sum(2)

    p = np.pad(a, ((2, 2), (2, 2), (0, 0)), mode='edge')

    h, w = a.shape[:2]

    supported = np.zeros((h, w), bool)

    for dy, dx in [(0, 1), (1, 0), (1, 1), (1, -1)]:

        votes = np.zeros((h, w), np.uint8)

        for distance in [-2, -1, 1, 2]:

            other = p[2 + dy * distance:2 + dy * distance + h, 2 + dx * distance:2 + dx * distance + w].astype(np.int16) - target

            dot = (diff.astype(np.int32) * other).sum(2)

            votes += (dot * 4 >= norm) & (dot > 0)

        supported |= votes >= np.where(np.abs(diff).max(2) <= 12, 2, 3)

    gate &= ~((norm >= 4) & supported)

    for col in pal:

        diff = target.astype(float) - np.array(col)

        distance = (diff * diff).sum(2)

        near = (np.abs(diff).max(2) <= 12) & (distance < best)

        chosen[near] = col

        best[near] = distance[near]

    out = im.copy()

    out[:, :, :3] = np.where(gate[:, :, None], chosen, a)

    return out

import math

import numpy as np



def cftransport_triangle_inverse(c, valid=None):

    h, w = c.shape[:2]

    hh, ww = (h // 2, w // 2)

    if not hh or not ww:

        return (None, dict(model='full', ratio=1.0, rmse=999.0))

    a = c[:hh * 2, :ww * 2].reshape(hh, 2, ww, 2, 2).mean((1, 3))

    for axis in [1, 0]:

        v = np.moveaxis(a, axis, 0).copy()

        n = len(v)

        if n > 1:

            cp = np.zeros(n)

            b = np.full(n, 0.75)

            b[[0, -1]] = 0.875

            cp[0] = 0.125 / b[0]

            v[0] /= b[0]

            for i in range(1, n):

                den = b[i] - 0.125 * cp[i - 1]

                cp[i] = 0.125 / den

                v[i] = (v[i] - 0.125 * v[i - 1]) / den

            for i in range(n - 2, -1, -1):

                v[i] -= cp[i] * v[i + 1]

        a = np.moveaxis(v, 0, axis)

    y = np.arange(hh * 2)

    x = np.arange(ww * 2)

    yi = y // 2

    xi = x // 2

    yn = np.clip(yi + np.where(y % 2 == 0, -1, 1), 0, hh - 1)

    xn = np.clip(xi + np.where(x % 2 == 0, -1, 1), 0, ww - 1)

    pred = (a[yi[:, None], xi] * 0.75 + a[yi[:, None], xn] * 0.25) * 0.75 + (a[yn[:, None], xi] * 0.75 + a[yn[:, None], xn] * 0.25) * 0.25

    obs = c[:hh * 2, :ww * 2]

    nearest = a[yi[:, None], xi]

    take = valid[:hh * 2, :ww * 2] if valid is not None and np.count_nonzero(valid) >= 256 else np.ones((hh * 2, ww * 2), bool)

    err = float(np.mean((pred - obs)[take] ** 2))

    variation = float(np.mean((nearest - obs)[take] ** 2))

    ratio = err / max(variation, 1e-09)

    accepted = err <= 4 and (ratio < 0.18 or variation < 1.0)

    return (np.floor(a * 256 + 0.5) / 256 if accepted else None, dict(model='triangle420' if accepted else 'full', ratio=ratio, rmse=math.sqrt(err)))

import zlib, base64, binascii, hashlib, hmac, json, math, os, struct, sys

from pathlib import Path

import numpy as np

from PIL import Image

cfcarrier2_VMIN, cfcarrier2_MAX_PIXELS = (1088, 48000000)

cfcarrier2_DCT = np.array([[math.sqrt(1 / 8) if cfcarrier2_u == 0 else math.sqrt(2 / 8) * math.cos((2 * cfcarrier2_x + 1) * cfcarrier2_u * math.pi / 16) for cfcarrier2_x in range(8)] for cfcarrier2_u in range(8)])

cfcarrier2_PAIRS = [((0, 1), (1, 0)), ((0, 2), (2, 0)), ((1, 2), (2, 1)), ((0, 3), (3, 0)), ((1, 1), (2, 2)), ((1, 3), (3, 1))]

cfcarrier2_PATTERNS = np.array([np.outer(cfcarrier2_DCT[cfcarrier2_a[0]], cfcarrier2_DCT[cfcarrier2_a[1]]) - np.outer(cfcarrier2_DCT[cfcarrier2_b[0]], cfcarrier2_DCT[cfcarrier2_b[1]]) for cfcarrier2_a, cfcarrier2_b in cfcarrier2_PAIRS])

cfcarrier2_Q = 320



class cfcarrier2_InvalidFormat(Exception):

    pass



def cfcarrier2_canonical(d):

    return json.dumps(d, separators=(',', ':'), sort_keys=True).encode()



def cfcarrier2_crc(a):

    return binascii.crc32(a) & 4294967295



def cfcarrier2_resize_float(a, w, h):

    single = a.ndim == 2

    if single:

        a = a[:, :, None]

    sh, sw, channels = a.shape

    xs = np.clip((np.arange(w) + 0.5) * sw / w - 0.5, 0, sw - 1)

    x0 = np.floor(xs).astype(int)

    x1 = np.minimum(sw - 1, x0 + 1)

    fx = (xs - x0)[:, None]

    out = np.empty((h, w, channels), np.float32)

    for y in range(h):

        yy = max(0, min(sh - 1, (y + 0.5) * sh / h - 0.5))

        y0 = int(yy)

        y1 = min(sh - 1, y0 + 1)

        fy = yy - y0

        top = a[y0, x0] * (1 - fx) + a[y0, x1] * fx

        bottom = a[y1, x0] * (1 - fx) + a[y1, x1] * fx

        out[y] = top * (1 - fy) + bottom * fy

    return out[:, :, 0] if single else out



def cfcarrier2_resize(a, w, h):

    sh, sw, channels = a.shape

    Q = 16384



    def axis(original, output):

        den = 2 * output

        t = (2 * np.arange(output, dtype=np.int64) + 1) * original - output

        base = t // den

        rem = t - base * den

        f = (rem * Q + output) // den

        return (np.clip(base, 0, original - 1), np.clip(base + 1, 0, original - 1), f)

    x0, x1, fx = axis(sw, w)

    y0, y1, fy = axis(sh, h)

    fx = fx[:, None]

    out = np.empty((h, w, channels), np.uint8)

    for y in range(h):

        top = a[y0[y], x0].astype(np.int64) * (Q - fx) + a[y0[y], x1].astype(np.int64) * fx

        bottom = a[y1[y], x0].astype(np.int64) * (Q - fx) + a[y1[y], x1].astype(np.int64) * fx

        out[y] = (top * (Q - fy[y]) + bottom * fy[y] + Q * Q // 2) // (Q * Q)

    return out



def cfcarrier2_virtual_shape(w, h, old=False, revision=14):

    scale = (640 if old else 832 if revision == 13 else cfcarrier2_VMIN) / min(w, h)

    a, b = (max(8, int(w * scale / 8 + 0.5) * 8), max(8, int(h * scale / 8 + 0.5) * 8))

    if a * b > cfcarrier2_MAX_PIXELS:

        raise ValueError('Extreme aspect ratio')

    return (a, b)



def cfcarrier2_pilot_positions(w, h, old=False, revision=14):

    return [(max(2, int(((0.055 if i % 2 == 0 else 0.945) if old else (0.03 if i % 2 == 0 else 0.97) if revision == 13 else 0.014 if i % 2 == 0 else 0.986) * w / 8)), min(h // 8 - 3, max(2, int((i + 1) * h / 17 / 8)))) for i in range(16)]



def cfcarrier2_pilot_means(rgb, w, h, old=False, revision=14):

    return np.array([rgb[y * 8:y * 8 + 8, x * 8:x * 8 + 8].mean(axis=(0, 1)) for x, y in cfcarrier2_pilot_positions(w, h, old, revision)])



def cfcarrier2_edges(cover):

    return cfsketch__stroke_reservation(cover).astype(float) * 1024



def cfcarrier2_pack_meta(m):

    cv = cfmask_pack(base64.b64decode(m['mask']), m['c'], m['r'], m['d'] >= 14) if m['d'] >= 13 else zlib.compress(base64.b64decode(m['mask']), 9)

    sm = base64.b64decode(m['sm'])

    extra = struct.pack('>HHHH', m['fw'], m['fh'], m['x'], m['y']) + bytes.fromhex(m['bg']) if m['t'] else b''

    return struct.pack('>HH', m['iw'], m['ih']) + struct.pack('>BHHHHBBBBB', int(m['a']) + 2 * int(m['p']) + 4 * int(m['t']) + 8 * int(m['u']), m['w'], m['h'], m['ow'], m['oh'], m['c'], m['r'], m['b'], m['d'], m['z']) + bytes.fromhex(m['s']) + struct.pack('>I', m['crc']) + (base64.b64decode(m['cal'])[36:36 + 3 * m['z']] if m['d'] >= 14 else base64.b64decode(m['cal'])) + struct.pack('>IHH', m['k'], len(cv), len(sm)) + cv + sm + extra + bytes.fromhex(m['tag'])



def cfcarrier2_unpack_meta(data):

    if len(data) < 62:

        raise ValueError('Invalid CFT2 header')

    iw, ih = struct.unpack('>HH', data[:4])

    data = data[4:]

    flags, w, h, ow, oh, c, r, b, d, z = struct.unpack('>BHHHHBBBBB', data[:14])

    caln = 3 * z if d >= 14 else 48

    kp = 34 + caln

    if z > 4 or len(data) < kp + 24:

        raise ValueError('Invalid CFT2 calibration')

    k, cl, sl = struct.unpack('>IHH', data[kp:kp + 8])

    pos = kp + 8

    t = bool(flags & 4)

    u = bool(flags & 8)

    if flags > 15 or len(data) != pos + 16 + cl + sl + (12 if t else 0) or u != bool(sl):

        raise ValueError('Invalid CFT2 header length')

    cal = bytes((v for i in range(12) for v in [int(i * 255 / 11 + 0.5)] * 3)) + data[34:kp] + bytes([128]) * (12 - 3 * z) if d >= 14 else data[34:82]

    mask = cfmask_unpack(data[pos:pos + cl], c, r) if d >= 13 else cfcarrier2_bounded_inflate(data[pos:pos + cl], math.ceil(c * r / 8))

    m = dict(a=bool(flags & 1), p=bool(flags & 2), t=t, u=u, k=k, w=w, h=h, ow=ow, oh=oh, c=c, r=r, b=b, d=d, z=z, s=data[14:30].hex(), crc=struct.unpack('>I', data[30:34])[0], cal=base64.b64encode(cal).decode(), mask=base64.b64encode(mask).decode(), sm=base64.b64encode(data[pos + cl:pos + cl + sl]).decode(), tag=data[-16:].hex())

    if t:

        pp = pos + cl + sl

        fw, fh, x, y = struct.unpack('>HHHH', data[pp:pp + 8])

        m.update(fw=fw, fh=fh, x=x, y=y, bg=data[pp + 8:pp + 12].hex())

    m.update(iw=iw, ih=ih)

    cfcarrier2_validate(m)

    return m



def cfcarrier2_stream(key, domain):

    counter = 0

    buf = b''

    pos = 0



    def below(n):

        nonlocal counter, buf, pos

        limit = 2 ** 32 // n * n

        while True:

            if pos >= len(buf):

                buf = hmac.digest(key, domain + struct.pack('>I', counter), 'sha256')

                counter += 1

                pos = 0

            v = int.from_bytes(buf[pos:pos + 4], 'big')

            pos += 4

            if v < limit:

                return v % n

    return below



def cfcarrier2_calibration(small, shape, meta):

    expected = np.frombuffer(base64.b64decode(meta['cal']), np.uint8).reshape(16, 3).astype(float)

    obs = cfcarrier2_pilot_means(small, *shape, old=meta['d'] < 13, revision=meta['d'])

    table = np.tile(np.arange(256)[:, None], (1, 3)).astype(float)

    for ch in range(3):

        if meta['d'] >= 14:

            ids = [i for i in range(12) if 2 < obs[i, ch] < 253]

            slopes = [(obs[j, ch] - obs[i, ch]) / (expected[j, ch] - expected[i, ch]) for i in ids for j in ids if j > i and expected[j, ch] - expected[i, ch] >= 32]

            if len(slopes) >= 3:

                a = float(np.median(slopes))

                b = float(np.median([obs[i, ch] - a * expected[i, ch] for i in ids]))

                res = float(np.median([abs(obs[i, ch] - a * expected[i, ch] - b) for i in ids]))

                if 0.5 < a < 1.5 and res <= 3:

                    v = (np.arange(256) - b) / a

                    if np.median(abs(v - np.arange(256))) < 1.5:

                        continue

        if np.median(np.abs(obs[:12, ch] - expected[:12, ch])) < 1.5:

            continue

        xs = []

        ys = []

        for i in range(12):

            xx = max(obs[i, ch], xs[-1] if xs else 0)

            if xs and xx - xs[-1] < 0.25:

                ys[-1] = expected[i, ch]

            else:

                xs.append(xx)

                ys.append(expected[i, ch])

        table[:, ch] = np.interp(np.arange(256), xs, ys)

    return np.clip(np.floor(table + 0.5), 0, 255).astype(np.uint8)



def cfcarrier2_locations(w, h, old=False, revision=14):

    excluded = {(x + dx, y + dy) for x, y in cfcarrier2_pilot_positions(w, h, old, revision) for dx in [-1, 0, 1] for dy in [-1, 0, 1]}

    loc = [(x, y) for y in range(h // 8) for x in range(w // 8) if (x < int((0.12 if old else 0.06 if revision == 13 else 0.031) * w / 8) or x >= math.ceil((0.88 if old else 0.94 if revision == 13 else 0.969) * w / 8)) and (x, y) not in excluded]

    stride = 997

    while math.gcd(stride, len(loc)) != 1:

        stride += 2

    return (loc, stride)



def cfcarrier2_differences(gray, loc, stride, old=False):

    h, w = gray.shape

    blocks = gray.reshape(h // 8, 8, w // 8, 8).transpose(0, 2, 1, 3)

    coeff = np.einsum('ijxy,kxy->kij', blocks, cfcarrier2_PATTERNS)

    order = np.arange(len(loc)) * stride % len(loc)

    diff = np.array([[p[y, x] for x, y in loc] for p in coeff])[:, order].reshape(-1)

    if old:

        return diff

    mix = len(loc) + 1

    while math.gcd(mix, len(diff)) != 1:

        mix += 1

    return diff[np.arange(len(diff)) * mix % len(diff)]



def cfcarrier2_read_metadata(image):

    h, w = image.shape[:2]

    for old, revision in [(False, 14), (False, 13), (True, 12)]:

        vw, vh = cfcarrier2_virtual_shape(w, h, old, revision)

        for dx, dy in [(0, 0), (-8, 0), (8, 0), (0, -8), (0, 8), (-8, -8), (8, 8), (-8, 8), (8, -8)]:

            ww, hh = (vw + dx, vh + dy)

            if min(ww, hh) < 8:

                continue

            small = cfcarrier2_resize(image[:, :, :3], ww, hh)

            loc, stride = cfcarrier2_locations(ww, hh, old, revision)

            diff = cfcarrier2_differences(small.astype(float) @ np.array([0.299, 0.587, 0.114]), loc, stride, old)

            for mode in [0, 1, 2]:

                bits = ((diff + diff[::-1] if mode == 0 else diff if mode == 1 else diff[::-1]) > 0).astype(np.uint8)

                try:

                    prefix, _ = cfbch_decode(bits[:189])

                except ValueError:

                    continue

                if old and prefix[:4] in [b'CFR4', b'CFR5', b'CFR6', b'CFR7', b'CFR9', b'CFT1']:

                    raise cfcarrier2_InvalidFormat()

                if prefix[:4] != b'CFT2':

                    continue

                length, checksum = struct.unpack('>HI', prefix[4:10])

                count = math.ceil((length + 10) * 8 / 36) * 63

                if not 62 <= length <= 1536 or count > len(diff):

                    continue

                try:

                    blob, errors = cfbch_decode(bits[:count])

                except ValueError:

                    continue

                data = blob[10:10 + length]

                if cfcarrier2_crc(data) == checksum:

                    meta = cfcarrier2_unpack_meta(data)

                    if (meta['d'] < 13) == old and (old or meta['d'] == revision or (revision == 14 and meta['d'] >= 15)):

                        return (meta, small, (ww, hh), errors)

    raise ValueError('CFT2 parameters missing or compression exceeds recovery limit')



def cfcarrier2_write_metadata(image, meta):

    data = cfcarrier2_pack_meta(meta)

    bits = cfbch_encode(b'CFT2' + struct.pack('>HI', len(data), cfcarrier2_crc(data)) + data)

    h, w = image.shape[:2]

    vw, vh = cfcarrier2_virtual_shape(w, h)

    loc, stride = cfcarrier2_locations(vw, vh)

    n = len(loc)

    capacity = 6 * n

    if len(bits) > capacity:

        raise ValueError('Insufficient repeated-header capacity')

    out = image.copy()

    for attempt in range(8):

        small = cfcarrier2_resize(out, vw, vh).astype(float)

        gray = small @ np.array([0.299, 0.587, 0.114])

        delta = np.zeros((vh, vw), np.float32)

        for side in [0, 1] if len(bits) * 2 <= capacity else [0]:

            for i, bit in enumerate(bits):

                mix = n + 1

                while math.gcd(mix, capacity) != 1:

                    mix += 1

                j = (i if side == 0 else capacity - 1 - i) * mix % capacity

                k, index = divmod(j, n)

                x, y = loc[index * stride % n]

                pat = cfcarrier2_PATTERNS[k]

                diff = float(np.sum(gray[y * 8:y * 8 + 8, x * 8:x * 8 + 8] * pat))

                target = (1 if bit else -1) * max(cfcarrier2_Q * max(1, min(2, 1088 / min(w, h))), abs(diff))

                delta[y * 8:y * 8 + 8, x * 8:x * 8 + 8] += (target - diff) * pat / 2

        out = np.clip(np.floor(out.astype(np.float32) + cfcarrier2_resize_float(delta, w, h)[:, :, None] + 0.5), 0, 255).astype(np.uint8)

        try:

            got, _, _, _ = cfcarrier2_read_metadata(out)

            if got == meta and attempt >= 1:

                return out

        except ValueError:

            pass

    raise ValueError('Cannot reliably encode parameters in this cover')



def cfcarrier2_coarse_layout(cover, w, h, alpha, guide, count):

    ch, cw = cover.shape[:2]

    div = math.gcd(cw, ch)

    aw, ah = (cw // div, ch // div)

    c = guide if cw >= ch else max(4, int(guide * cw / ch + 0.5))

    r = guide if ch >= cw else max(4, int(guide * ch / cw + 0.5))

    preview = cfcarrier2_resize(cover[:, :, :3], min(cw, 1024), max(1, int(ch * min(cw, 1024) / cw + 0.5)))

    edge = cfcarrier2_edges(preview)

    ph, pw = edge.shape

    mask = np.zeros((r, c), np.uint8)

    for row in range(r):

        for col in range(c):

            if (col + 1) / c <= 0.03125 or col / c >= 0.96875:

                continue

            patch = edge[max(0, int(row * ph / r) - 1):min(ph, math.ceil((row + 1) * ph / r) + 1), max(0, int(col * pw / c) - 1):min(pw, math.ceil((col + 1) * pw / c) + 1)]

            if not np.any(patch) and (not any((col / c < (cx + rad) / cw and (col + 1) / c > (cx - rad) / cw and (row / r < (cy + rad) / ch) and ((row + 1) / r > (cy - rad) / ch) for cx, cy, rad in cfsketch_marker_boxes(cw, ch)))):

                mask[row, col] = 1

    need = count * 256 * (2 if alpha else 1)

    fraction = float(mask.mean())

    if fraction <= 0:

        raise ValueError('Cover has no suitable low-contour regions')

    k = math.ceil(max(math.sqrt(need / fraction / (max(cw, ch) / min(cw, ch))), cfcarrier2_VMIN))

    while True:

        ow, oh = (int(k * cw / ch + 0.5), k) if cw >= ch else (k, int(k * ch / cw + 0.5))

        nx, ny = (ow // 16, oh // 16)

        if ow * oh > cfcarrier2_MAX_PIXELS:

            raise ValueError('Insufficient cover capacity within 48 MP')

        capacity = sum((max(0, min((col + 1) * nx // c, 31 * ow // 512) - max(col * nx // c, math.ceil(ow / 512))) * ((row + 1) * ny // r - row * ny // r) for row, col in zip(*np.nonzero(mask))))

        if capacity * 256 >= need:

            break

        k += 1

    return dict(w=w, h=h, ow=ow, oh=oh, c=c, r=r, b=1, d=15, z=0, a=alpha, mask=base64.b64encode(np.packbits(mask.reshape(-1))).decode())



def cfcarrier2_native_layout(cover, w, h, alpha, count):

    ch, cw = cover.shape[:2]

    pw = min(cw, 1024)

    ph = max(1, int(ch * pw / cw + 0.5))

    edge = cfcarrier2_edges(cfcarrier2_resize(cover[:, :, :3], pw, ph))

    summ = np.pad(edge, ((1, 0), (1, 0))).cumsum(0).cumsum(1)

    strong = np.pad((edge > 48).astype(np.int32), ((1, 0), (1, 0))).cumsum(0).cumsum(1)

    need = count * (2 if alpha else 1)

    lower = max(640, int(math.sqrt(need * 256 * min(cw, ch) / max(cw, ch))))

    for k in range((lower + 15) // 16 * 16, 65536, 16):

        ow, oh = (int(k * cw / ch + 0.5), k) if cw >= ch else (k, int(k * ch / cw + 0.5))

        nx, ny = (ow // 16, oh // 16)

        if max(nx, ny) > 255 or ow * oh > cfcarrier2_MAX_PIXELS:

            raise ValueError('Native contour grid exceeds header dimensions')

        Y, X = np.mgrid[:ny, :nx]

        x0 = np.maximum(0, X * 16 * pw // ow - 1)

        x1 = np.minimum(pw, np.maximum(x0 + 1, ((X + 1) * 16 * pw + ow - 1) // ow) + 1)

        y0 = np.maximum(0, Y * 16 * ph // oh - 1)

        y1 = np.minimum(ph, np.maximum(y0 + 1, ((Y + 1) * 16 * ph + oh - 1) // oh) + 1)

        area = (x1 - x0) * (y1 - y0)

        total = summ[y1, x1] - summ[y0, x1] - summ[y1, x0] + summ[y0, x0]

        n = strong[y1, x1] - strong[y0, x1] - strong[y1, x0] + strong[y0, x0]

        mask = (total == 0) & (X >= math.ceil(ow / 512)) & (X < 31 * ow // 512)

        for cx, cy, rad in cfsketch_marker_boxes(ow, oh):

            mask &= ~((X * 16 < cx + rad) & ((X + 1) * 16 > cx - rad) & (Y * 16 < cy + rad) & ((Y + 1) * 16 > cy - rad))

        if int(mask.sum()) >= need:

            return dict(w=w, h=h, ow=ow, oh=oh, c=nx, r=ny, b=1, d=15, z=0, a=alpha, mask=base64.b64encode(np.packbits(mask).tobytes()).decode())

    raise ValueError('Contour capacity exceeded')



def cfcarrier2_layout(cover, w, h, alpha, cropped, k, sm, iw, ih, z=0):

    for sparse in [True, False] if sm else [False]:

        for guide in [0, 128, 112, 96, 80, 64, 48, 40, 32, 24, 20, 16]:

            count = k if sparse else int(cfcarrier2_padding_mask(w, h, iw, ih).sum())

            blob = sm if sparse else b''

            try:

                m = cfcarrier2_native_layout(cover, w, h, alpha, count) if guide == 0 else cfcarrier2_coarse_layout(cover, w, h, alpha, guide, count)

            except ValueError:

                continue

            m.update(iw=iw, ih=ih)

            length = 62 + 3 * z + len(cfmask_pack(base64.b64decode(m['mask']), m['c'], m['r'], True)) + len(blob) + (12 if cropped else 0)

            shape = cfcarrier2_virtual_shape(m['ow'], m['oh'])

            loc, _ = cfcarrier2_locations(*shape)

            if math.ceil((length + 10) * 8 / 36) * 63 <= len(loc) * 6 and length <= 1536:

                m.update(k=count, u=sparse, sm=base64.b64encode(blob).decode())

                return m

    raise ValueError('Insufficient parameter capacity')



def cfcarrier2_prepare_pilots(out, pal):

    h, w = out.shape[:2]

    vw, vh = cfcarrier2_virtual_shape(w, h)

    targets = [[int(i * 255 / 11 + 0.5)] * 3 for i in range(12)] + pal + [[128] * 3] * (4 - len(pal))

    for i, (x, y) in enumerate(cfcarrier2_pilot_positions(vw, vh)):

        out[max(0, math.floor((y * 8 - 4) * h / vh)):min(h, math.ceil((y * 8 + 12) * h / vh)), max(0, math.floor((x * 8 - 4) * w / vw)):min(w, math.ceil((x * 8 + 12) * w / vw))] = targets[i]

    return np.array(targets, np.uint8)



def cfcarrier2_curve(w, h):

    out = np.empty(w * h, np.int32)

    pos = 0



    def gen(x, y, ax, ay, bx, by):

        nonlocal pos

        w = abs(ax + ay)

        h = abs(bx + by)

        dax = (ax > 0) - (ax < 0)

        day = (ay > 0) - (ay < 0)

        dbx = (bx > 0) - (bx < 0)

        dby = (by > 0) - (by < 0)

        if h == 1:

            for i in range(w):

                out[pos] = (y + day * i) * W + x + dax * i

                pos += 1

            return

        if w == 1:

            for i in range(h):

                out[pos] = (y + dby * i) * W + x + dbx * i

                pos += 1

            return

        ax2 = ax // 2

        ay2 = ay // 2

        bx2 = bx // 2

        by2 = by // 2

        w2 = abs(ax2 + ay2)

        h2 = abs(bx2 + by2)

        if 2 * w > 3 * h:

            if w2 % 2 and w > 2:

                ax2 += dax

                ay2 += day

            gen(x, y, ax2, ay2, bx, by)

            gen(x + ax2, y + ay2, ax - ax2, ay - ay2, bx, by)

        else:

            if h2 % 2 and h > 2:

                bx2 += dbx

                by2 += dby

            gen(x, y, bx2, by2, ax2, ay2)

            gen(x + bx2, y + by2, ax, ay, bx - bx2, by - by2)

            gen(x + ax - dax + bx2 - dbx, y + ay - day + by2 - dby, -bx2, -by2, -(ax - ax2), -(ay - ay2))

    W = w

    if w >= h:

        gen(0, 0, w, 0, 0, h)

    else:

        gen(0, 0, 0, h, w, 0)

    return out



def cfcarrier2_validate(m):

    if min(m['w'], m['h'], m['ow'], m['oh'], m['c'], m['r']) < 1 or max(m['w'], m['h'], m['ow'], m['oh']) > 65535 or m['w'] * m['h'] > cfcarrier2_MAX_PIXELS or (m['ow'] * m['oh'] > cfcarrier2_MAX_PIXELS) or (max(m['c'], m['r']) > 255) or (m['b'] not in ([1, 3, 5, 7] if m['d'] >= 15 else [1, 3])) or (m['d'] not in [11, 12, 13, 14, 15]) or (not 0 <= m['z'] <= 4) or (not 0 <= m['k'] <= math.ceil(m['w'] / 16) * math.ceil(m['h'] / 16)):

        raise ValueError('Invalid CFT2 parameters')

    if min(m['iw'], m['ih']) < 1 or m['w'] != max(16, 1 << (m['iw'] - 1).bit_length()) or m['h'] != max(16, 1 << (m['ih'] - 1).bit_length()) or m['t']:

        raise ValueError('Invalid padded frame')

    if m['t'] and (min(m['fw'], m['fh']) < 1 or max(m['fw'], m['fh']) > 65535 or m['fw'] * m['fh'] > cfcarrier2_MAX_PIXELS or (min(m['x'], m['y']) < 0) or (m['x'] + m['w'] > m['fw']) or (m['y'] + m['h'] > m['fh']) or (len(bytes.fromhex(m['bg'])) != 4)):

        raise ValueError('Invalid restored frame')



def cfcarrier2_mapping(m, key, mask):

    return cfpacking_plan(m, key, mask, cfcarrier2_curve, cfcarrier2_stream)



def cfcarrier2_point_destinations(m, tiles, reverse, start, stop):

    i = np.arange(start, stop)

    local = i % 256

    tile = tiles[i // 256]

    nx = m['ow'] // 16

    return (tile // nx * 16 + local // 16) * m['ow'] + tile % nx * 16 + local % 16



def cfcarrier2_guards(out, base, state, depth):

    h, w = state.shape

    left = math.ceil(w / 512) * 16

    right = 31 * w // 512 * 16

    for step in range(1, depth + 1):

        original = (state > 0) & (state <= step)

        empty = (state == 0) & (base[:, :, 0] >= 250)

        empty[:, :left] = False

        empty[:, right:] = False

        for dy, dx in [(0, -1), (0, 1), (-1, 0), (1, 0), (-1, -1), (-1, 1), (1, -1), (1, 1)]:

            y0 = max(0, -dy)

            y1 = min(h, h - dy)

            x0 = max(0, -dx)

            x1 = min(w, w - dx)

            hit = empty[y0:y1, x0:x1] & original[y0 + dy:y1 + dy, x0 + dx:x1 + dx]

            yy, xx = np.nonzero(hit)

            yy += y0

            xx += x0

            if not len(yy):

                continue

            empty[yy, xx] = False



            def lum(ox, oy):

                return base[np.clip(yy + oy, 0, h - 1), np.clip(xx + ox, 0, w - 1), :3].astype(float) @ np.array([0.299, 0.587, 0.114])

            tl = lum(-1, -1)

            tc = lum(0, -1)

            tr = lum(1, -1)

            ml = lum(-1, 0)

            mr = lum(1, 0)

            bl = lum(-1, 1)

            bc = lum(0, 1)

            br = lum(1, 1)

            edge = (np.abs(-tl + tr - 2 * ml + 2 * mr - bl + br) + np.abs(-tl - 2 * tc - tr + bl + 2 * bc + br)) / 8

            ok = edge < 18

            yy = yy[ok]

            xx = xx[ok]

            out[yy, xx] = out[yy + dy, xx + dx]

            state[yy, xx] = step + 1



def cfcarrier2_encrypt(source, cover, password='', options=None):

    options = options or {}

    h, w = source.shape[:2]

    cfpixels2_check_key(password)

    if source.dtype != np.uint8 or source.shape[2] != 4 or min(w, h) < 1 or (w * h > cfcarrier2_MAX_PIXELS) or (max(w, h) > 65535):

        raise ValueError('Requires uint8 RGBA input within 48 MP')

    expected = cfcarrier2_crc(source.tobytes())

    monochrome = bool(np.all(source[:, :, 0] == source[:, :, 1]) and np.all(source[:, :, 1] == source[:, :, 2]))

    pal = options['palette'] if 'palette' in options else cfrestore_palette(source)

    frame = dict(t=False)

    h, w = source.shape[:2]

    mask, sm = cfcarrier2_source_map(source)

    if np.array_equal(mask, cfcarrier2_padding_mask(w, h, options['iw'], options['ih'])):

        sm = b''

    if cover.shape[2] == 4:

        cover = np.clip(np.floor(cover[:, :, :3].astype(float) * (cover[:, :, 3:4] / 255) + 255 * (1 - cover[:, :, 3:4] / 255) + 0.5), 0, 255).astype(np.uint8)

    cover, sketch_info = cfsketch_prepare(cover, int(mask.sum()) * (2 if np.any(source[:, :, 3] != 255) else 1), cfcarrier2_resize)

    m = cfcarrier2_layout(cover, w, h, bool(np.any(source[:, :, 3] != 255)), frame['t'], int(mask.sum()), sm, options['iw'], options['ih'], len(pal))

    m.update(frame, z=len(pal), b=(3 if monochrome else 1) | (4 if pal and int(mask.sum()) * 256 < options['iw'] * options['ih'] * 0.65 else 0))

    salt = options.get('salt', os.urandom(16))

    if len(salt) != 16:

        raise ValueError('Salt must have 16 bytes')

    key = cfpixels2_derive(password, salt)

    if not m['u']:

        mask = cfcarrier2_padding_mask(w, h, m['iw'], m['ih'])

    m['sm'] = base64.b64encode(cfcarrier2_map_cipher(base64.b64decode(m['sm']), key)).decode()

    order, tiles = cfcarrier2_mapping(m, key, mask)

    reverse = False

    base = cfcarrier2_resize(cover[:, :, :3], m['ow'], m['oh'])

    out = base.copy()

    state = np.zeros(out.shape[:2], np.uint8)

    n = m['k'] * 256

    need = n * (2 if m['a'] else 1)

    src = source.reshape(-1, 4)

    for start in range(0, need, 65536):

        stop = min(need, start + 65536)

        i = np.arange(start, stop)

        dst = cfcarrier2_point_destinations(m, tiles, reverse, start, stop)

        ss, _ = cfcarrier2_source_points(m, order, start, stop)

        values = src[ss]

        out.reshape(-1, 3)[dst] = np.where((i < n)[:, None], values[:, :3], values[:, 3:4])

        state.reshape(-1)[dst] = 1

    cfcarrier2_guards(out, base, state, 3)

    cfsketch_paint(out, base, state, cfcarrier2_resize)

    cal = cfcarrier2_prepare_pilots(out, pal)

    m.update(p=bool(password), s=salt.hex(), crc=expected, cal=base64.b64encode(cal.tobytes()).decode())

    m['tag'] = hmac.digest(key, cfcarrier2_canonical(m), 'sha256')[:16].hex()

    out = cfcarrier2_write_metadata(out, m)

    cfframe_draw(out)

    return (out, dict(**sketch_info, width=m['ow'], height=m['oh'], format='CFT2', mapping='tomato-payload-rectangles', tile_size=16, tiles=m['k'], sparse=m['u'], pixel_count=m['ow'] * m['oh']))



def cfcarrier2_axis_map(original, received):

    den = 2 * original

    t = (2 * np.arange(original, dtype=np.int64) + 1) * received - original

    base = t // den

    rem = t - base * den

    f = ((rem * 1024 + original) // den).astype(float) / 1024

    g = 1 - f

    ff = f * f

    gg = g * g

    weight = np.stack([-0.75 * f * gg, 1.25 * ff * f - 2.25 * ff + 1, 1.25 * gg * g - 2.25 * gg + 1, -0.75 * ff * g], axis=1)

    q = np.floor(weight * 16384 + 0.5).astype(np.int64)

    q[:, 1] += 16384 - q.sum(axis=1)

    return (np.clip(base[:, None] + np.arange(-1, 3), 0, received - 1), q.astype(float) / 16384)



def cfcarrier2_decrypt(image, password=''):

    try:

        m, small, shape, corrected = cfcarrier2_read_metadata(image)

    except cfcarrier2_InvalidFormat:

        raise ValueError('Unsupported image format')

    tag = m.pop('tag')

    key = cfpixels2_derive(password, bytes.fromhex(m['s']))

    if not hmac.compare_digest(tag, hmac.digest(key, cfcarrier2_canonical(m), 'sha256')[:16].hex()):

        raise ValueError('Incorrect password')

    if abs(image.shape[1] / m['ow'] / (image.shape[0] / m['oh']) - 1) > 0.02:

        raise ValueError('Changed aspect ratio')

    w, h = (m['w'], m['h'])

    mask, bg = cfcarrier2_open_map(m, key)

    order, tiles = cfcarrier2_mapping(m, key, mask)

    reverse = False

    out = np.empty((w * h, 4), np.uint8)

    out[:] = bg

    active = np.zeros(w * h, bool)

    n = m['k'] * 256

    need = n * (2 if m['a'] else 1)

    direct = image.shape[1] == m['ow'] and image.shape[0] == m['oh']

    if not direct:

        xi, xw = cfcarrier2_axis_map(m['ow'], image.shape[1])

        yi, yw = cfcarrier2_axis_map(m['oh'], image.shape[0])

    for start in range(0, need, 16384):

        stop = min(need, start + 16384)

        i = np.arange(start, stop)

        dst = cfcarrier2_point_destinations(m, tiles, reverse, start, stop)

        x = dst % m['ow']

        y = dst // m['ow']

        if direct:

            rgb = image[y, x, :3].astype(float)

        else:

            rgb = np.zeros((len(i), 3))

            for dy in range(4):

                for dx in range(4):

                    rgb += image[yi[y, dy], xi[x, dx], :3] * (yw[y, dy] * xw[x, dx])[:, None]

        target, valid = cfcarrier2_source_points(m, order, start, stop)

        isrgb = (i < n) & valid

        isa = (i >= n) & valid

        active[target[valid]] = True

        out[target[isrgb], :3] = np.clip(np.floor(rgb[isrgb] + 0.5), 0, 255).astype(np.uint8)

        if np.any(isa):

            out[target[isa], 3] = np.clip(np.floor(rgb[isa].mean(axis=1) + 0.5), 0, 255).astype(np.uint8)

    work = out.reshape(h, w, 4)

    full = cfrestore_expand(work, m)

    damaged = cfcarrier2_crc(full.tobytes()) != m['crc']

    if damaged:

        table = cfcarrier2_calibration(small, shape, m)

        for ch in range(3):

            work[:, :, ch] = table[work[:, :, ch], ch]

        if m['a']:

            work[:, :, 3] = np.floor(table.mean(axis=1) + 0.5).astype(np.uint8)[work[:, :, 3]]

        if m['b'] & 2:

            rgb = work[:, :, :3]

            work[:, :, :3] = (rgb.astype(np.uint16).sum(axis=2) - rgb.min(2) - rgb.max(2))[:, :, None]

        pal = np.frombuffer(base64.b64decode(m['cal']), np.uint8).reshape(16, 3)[12:12 + m['z']].tolist()

        work.reshape(-1, 4)[~active] = bg

        full = cfrestore_expand(work, m)

    return (full, dict(format='CFT2', legacy=False, pixel_crc_match=cfcarrier2_crc(full.tobytes()) == m['crc'], corrected_header_bits=corrected, tiles=m['k'], sparse=m['u'], repair_applied=damaged, uniform_border_omitted=m['t'], palette=np.frombuffer(base64.b64decode(m['cal']), np.uint8).reshape(16, 3)[12:12 + m['z']].tolist()))



def cfcarrier2_bounded_inflate(data, size):

    dec = zlib.decompressobj()

    out = dec.decompress(data, size + 1)

    if len(out) != size or not dec.eof or dec.unused_data:

        raise ValueError('Invalid compressed map')

    return out



def cfcarrier2_map_cipher(data, key):

    out = bytearray(data)

    for p in range(0, len(out), 32):

        block = hmac.digest(key, b'source-map\x00' + struct.pack('>I', p // 32), 'sha256')

        for j in range(min(32, len(out) - p)):

            out[p + j] ^= block[j]

    return bytes(out)



def cfcarrier2_source_map(source):

    h, w = source.shape[:2]

    nx, ny = (math.ceil(w / 16), math.ceil(h / 16))

    a = np.pad(source, ((0, -h % 16), (0, -w % 16), (0, 0)), mode='edge')

    blocks = a.reshape(ny, 16, nx, 16, 4).transpose(0, 2, 1, 3, 4).reshape(-1, 16, 16, 4)

    same = np.all(blocks == blocks[:, 0, 0, None, None, :], axis=(1, 2, 3))

    colors = blocks[same, 0, 0]

    u, n = np.unique(colors, axis=0, return_counts=True)

    if not len(u):

        return (np.ones(nx * ny, bool), b'')

    bg = u[n.argmax()]

    mask = ~np.all(blocks == bg, axis=(1, 2, 3))

    if int(mask.sum()) * 4 > nx * ny * 3:

        return (np.ones(nx * ny, bool), b'')

    return (mask, zlib.compress(np.packbits(mask).tobytes() + bg.tobytes(), 9))



def cfcarrier2_open_map(m, key):

    count = math.ceil(m['w'] / 16) * math.ceil(m['h'] / 16)

    if not m['u']:

        mask = cfcarrier2_padding_mask(m['w'], m['h'], m['iw'], m['ih'], m['d'])

        if int(mask.sum()) != m['k']:

            raise ValueError('Invalid padded source count')

        return (mask, np.full(4, 255, np.uint8))

    raw = cfcarrier2_bounded_inflate(cfcarrier2_map_cipher(base64.b64decode(m['sm']), key), math.ceil(count / 8) + 4)

    mask = np.unpackbits(np.frombuffer(raw[:-4], np.uint8))[:count].astype(bool)

    if int(mask.sum()) != m['k']:

        raise ValueError('Invalid source map count')

    return (mask, np.frombuffer(raw[-4:], np.uint8))



def cfcarrier2_source_points(m, order, start, stop):

    i = np.arange(start, stop)

    tile = order[i // 256 % len(order)]

    local = i % 256

    xx = tile % math.ceil(m['w'] / 16) * 16 + local % 16

    yy = tile // math.ceil(m['w'] / 16) * 16 + local // 16

    valid = (xx < m['w']) & (yy < m['h'])

    return (np.minimum(yy, m['h'] - 1) * m['w'] + np.minimum(xx, m['w'] - 1), valid)



def cfcarrier2_padding_mask(w, h, iw, ih, revision=15):

    sc, sr = (w // 16, h // 16)

    path = cfcarrier2_curve(sc, sr)

    N = w * h

    phase = int((5 ** 0.5 - 1) / 2 * N / min(1024, N) + 0.5) * min(1024, N) % N

    dest = np.roll(path, -(phase // 256))

    mask = np.zeros(sc * sr, bool)

    mask[dest] = (path % sc < math.ceil(iw / 16)) & (path // sc < math.ceil(ih / 16))

    return mask

import math, base64

import numpy as np



def cfsampling_transform_map(m):

    w, h = (m['w'], m['h'])

    p = cfcarrier2_curve(w, h)

    n = w * h

    phase = int((5 ** 0.5 - 1) / 2 * n / min(1024, n) + 0.5) * min(1024, n) % n

    inv = np.empty(n, np.int32)

    inv[np.roll(p, -phase)] = p

    return inv



def cfsampling_spline(f):

    return np.stack([(1 - f) ** 3, 3 * f ** 3 - 6 * f * f + 4, -3 * f ** 3 + 3 * f * f + 3 * f + 1, f ** 3], 1) / 6



def cfsampling_grid(field, factor, w, h, cubic=False):

    """Keep the physical lattice origin; rounding a dimension must not shift it."""

    hh, ww, ch = field.shape

    xx = np.clip((np.arange(w) + 0.5) * factor - 0.5, 0, ww - 1)

    yy = np.clip((np.arange(h) + 0.5) * factor - 0.5, 0, hh - 1)

    x0 = xx.astype(int)

    y0 = yy.astype(int)

    x1 = np.minimum(ww - 1, x0 + 1)

    y1 = np.minimum(hh - 1, y0 + 1)

    fx = (xx - x0)[None, :, None]

    fy = (yy - y0)[:, None, None]

    if not cubic:

        return (field[y0[:, None], x0] * (1 - fx) + field[y0[:, None], x1] * fx) * (1 - fy) + (field[y1[:, None], x0] * (1 - fx) + field[y1[:, None], x1] * fx) * fy

    xw = cfsampling_spline(xx - x0)

    yw = cfsampling_spline(yy - y0)

    out = np.zeros((h, w, ch), np.float64)

    for dy in range(4):

        for dx in range(4):

            out += field[np.clip(y0 + dy - 1, 0, hh - 1)[:, None], np.clip(x0 + dx - 1, 0, ww - 1)] * (yw[:, dy, None] * xw[None, :, dx])[:, :, None]

    return out



def cfsampling_source_lattice(inv, m, mask, factor, ww, hh):

    w, h = (m['w'], m['h'])

    active = np.zeros(w * h, bool)

    active[inv] = mask[np.arange(w * h) // w // 16 * (w // 16) + np.arange(w * h) % w // 16]

    active = active.reshape(h, w)

    xx = np.clip(np.floor((np.arange(ww) + 0.5) / factor).astype(int), 0, m['iw'] - 1)

    yy = np.clip(np.floor((np.arange(hh) + 0.5) / factor).astype(int), 0, m['ih'] - 1)

    return active[yy[:, None], xx]



def cfsampling_point_fit(values, px, py, weight, ww, hh, bg, known, regular=0.01, iterations=8, cubic=False, seam_factor=None, seam_boost=0):

    px = np.clip(px, 0, ww - 1)

    py = np.clip(py, 0, hh - 1)

    x0 = np.floor(px).astype(np.int32)

    y0 = np.floor(py).astype(np.int32)

    fx = px - x0

    fy = py - y0

    ix = np.stack([y0 * ww + x0, y0 * ww + np.minimum(ww - 1, x0 + 1), np.minimum(hh - 1, y0 + 1) * ww + x0, np.minimum(hh - 1, y0 + 1) * ww + np.minimum(ww - 1, x0 + 1)], 1)

    basis = np.stack([(1 - fx) * (1 - fy), fx * (1 - fy), (1 - fx) * fy, fx * fy], 1).astype(np.float64)

    N = ww * hh

    ch = values.shape[1]

    values = values.astype(np.float64)

    weight = weight.astype(np.float64)

    if cubic:

        xw = cfsampling_spline(fx)

        yw = cfsampling_spline(fy)

        ix = np.stack([np.clip(y0 + dy - 1, 0, hh - 1) * ww + np.clip(x0 + dx - 1, 0, ww - 1) for dy in range(4) for dx in range(4)], 1)

        basis = np.stack([yw[:, dy] * xw[:, dx] for dy in range(4) for dx in range(4)], 1).astype(np.float64)

    K = basis.shape[1]



    def adj(y):

        out = np.zeros((N, ch), np.float64)

        for k in range(K):

            for a in range(ch):

                out[:, a] += np.bincount(ix[:, k], basis[:, k] * weight * y[:, a], minlength=N)

        return out

    splat = adj(values)

    coverage = np.zeros(N, np.float64)

    diag = np.zeros(N, np.float64)

    for k in range(K):

        coverage += np.bincount(ix[:, k], basis[:, k] * weight, minlength=N)

        diag += np.bincount(ix[:, k], basis[:, k] ** 2 * weight, minlength=N)

    initial = splat.reshape(hh, ww, ch)

    count = coverage.reshape(hh, ww)

    initial[known] = bg

    count[known] = 1

    for _ in range(48):

        missing = count < 1e-07

        if not missing.any():

            break

        a = np.pad(initial, ((1, 1), (1, 1), (0, 0)), mode='edge')

        b = np.pad(count, 1, mode='edge')

        s = a[:-2, 1:-1] + a[2:, 1:-1] + a[1:-1, :-2] + a[1:-1, 2:]

        t = b[:-2, 1:-1] + b[2:, 1:-1] + b[1:-1, :-2] + b[1:-1, 2:]

        hit = missing & (t > 1e-07)

        initial[hit] = s[hit] * 0.25

        count[hit] = t[hit] * 0.25

    initial = np.where((count > 1e-07)[:, :, None], initial / np.maximum(count[:, :, None], 1e-07), np.asarray(bg))

    initial[known] = bg

    anchor = known.ravel().astype(np.float64) * 2 + 0.0001



    def lap(x):

        a = x.reshape(hh, ww, ch)

        out = np.zeros_like(a)

        dx = a[:, 1:] - a[:, :-1]

        dy = a[1:] - a[:-1]

        out[:, 1:] += dx

        out[:, :-1] -= dx

        out[1:] += dy

        out[:-1] -= dy

        return out.reshape(N, ch)

    if seam_factor is not None and cubic and (ch == 1):

        Y, X = np.mgrid[:hh, :ww]

        sx = (X + 0.5) / seam_factor

        sy = (Y + 0.5) / seam_factor

        dx = np.minimum(sx % 16, 16 - sx % 16)

        dy = np.minimum(sy % 16, 16 - sy % 16)

        band = np.clip(1 - np.minimum(dx, dy) / 5, 0, 1)

        g = initial[:, :, 0]

        gy = np.zeros_like(g)

        gx = np.zeros_like(g)

        if ww > 1:

            gx[:, 1:-1] = (g[:, 2:] - g[:, :-2]) / 2

            gx[:, 0] = g[:, 1] - g[:, 0]

            gx[:, -1] = g[:, -1] - g[:, -2]

        if hh > 1:

            gy[1:-1] = (g[2:] - g[:-2]) / 2

            gy[0] = g[1] - g[0]

            gy[-1] = g[-1] - g[-2]

        strength = np.sqrt(gx * gx + gy * gy)

        native_strength = 0.2 * min(1, max(0, (seam_factor - 0.6) / 0.15)) ** 2
        regmap = (regular + native_strength * band / (1 + (strength / 6) ** 4)
                  + seam_boost * band / (1 + (strength / 8) ** 4)).reshape(-1, 1)

    else:

        regmap = np.full((N, 1), regular)



    def op(x):

        fitted = sum((x[ix[:, k]] * basis[:, k, None] for k in range(K)))

        return adj(fitted) + ((lap(regmap * lap(x)) if seam_factor is not None else regular * lap(lap(x))) if cubic else regular * lap(x)) + anchor[:, None] * x

    x = initial.reshape(N, ch).astype(np.float64)

    rhs = adj(values) + anchor[:, None] * x

    diagonal = diag + (20 * regmap[:, 0] if cubic else 4 * regular) + anchor

    r = rhs - op(x)

    z = r / diagonal[:, None]

    p = z.copy()

    rr = np.sum(r * z, axis=0, dtype=np.float64)

    for _ in range(iterations):

        ap = op(p)

        alpha = rr / np.maximum(np.sum(p * ap, axis=0, dtype=np.float64), 1e-20)

        x += p * alpha

        r -= ap * alpha

        z = r / diagonal[:, None]

        new = np.sum(r * z, axis=0, dtype=np.float64)

        p = z + p * (new / np.maximum(rr, 1e-20))

        rr = new

    return x.reshape(hh, ww, ch)



def cfsampling_block_score(initial):

    a = initial[:, :, :3].astype(np.float64)

    y = (a[:, :, 0] * 19595 + a[:, :, 1] * 38470 + a[:, :, 2] * 7471) / 65536

    ss = sb = 0.0

    ns = nb = 0

    for axis in [0, 1]:

        d = np.minimum(np.abs(np.diff(y, axis=axis)), 10)

        positions = np.arange(1, y.shape[axis])

        take = np.moveaxis(d, axis, 0)

        seam = positions % 32 == 0

        base = (positions % 8 == 0) & ~seam

        ss += float(take[seam].sum())

        sb += float(take[base].sum())

        ns += take[seam].size

        nb += take[base].size

    return ss / ns / (sb / nb) if min(ns, nb) >= 64 and sb / nb > 0.1 else 1.0



def cfsampling_resize_phase(luma, ow, oh):
    """Measure the shared displacement of the transport grid from seam energy."""
    rh, rw = luma.shape
    offsets = []
    for axis, length, period in ((1, rw, 16 * rw / ow), (0, rh, 16 * rh / oh)):
        if period < 5 or length < 12 * period:
            offsets.append(0.0)
            continue
        # Use independent halves so a localized edge cannot move the whole grid.
        diff = np.minimum(72, np.abs(np.diff(luma, axis=axis)))
        samples = np.arange(1, length)
        keep = (samples > 2 * period) & (samples < length - 2 * period)
        angle = samples[keep] * (2 * np.pi / period)
        carrier = np.exp(1j * angle)
        estimates = []
        for half in np.split(diff, [diff.shape[1 - axis] // 2], axis=1 - axis):
            energy = half.sum(axis=1 - axis)[keep]
            phasor = (energy - energy.mean()) @ carrier
            if abs(phasor) < 0.07 * energy.sum():
                break
            estimates.append(-np.angle(phasor) * period / (2 * np.pi))
        if len(estimates) == 2 and abs(estimates[0] - estimates[1]) <= 0.20:
            offset = sum(estimates) / 2
            offsets.append(offset if 0.20 <= abs(offset) <= 0.80 else 0.0)
        else:
            offsets.append(0.0)
    return tuple(offsets)


def cfsampling_box_mean(field, radius):
    for axis in (1, 0):
        pad = [(0, 0)] * 3
        pad[axis] = (radius, radius)
        summed = np.pad(field, pad, mode='edge').cumsum(axis=axis)
        pad[axis] = (1, 0)
        summed = np.pad(summed, pad)
        low = [slice(None)] * 3
        high = low.copy()
        width = 2 * radius + 1
        low[axis] = slice(None, -width)
        high[axis] = slice(width, None)
        field = (summed[tuple(high)] - summed[tuple(low)]) / width
    return field


def cfsampling_smooth_lattice(field, radius, threshold, strength):
    # A locally linear filter keeps high-contrast structure and averages flat regions.
    mean = cfsampling_box_mean(field, radius)
    variance = np.maximum(0, cfsampling_box_mean(field * field, radius) - mean * mean)
    gain = variance / (variance + threshold * threshold)
    filtered = cfsampling_box_mean(gain, radius) * field + cfsampling_box_mean((1 - gain) * mean, radius)
    return field + strength * (filtered - field)


def cfsampling_scatter(plane, step, m, order, tiles, mask, bg, inv, rw, rh, margin=0.5, regular=0.01, fit=True, cubic=False, full=False, native_margin=0, offset=(0, 0), severity=0, phase_strength=0):

    iw, ih, w, h, ow, oh = (m['iw'], m['ih'], m['w'], m['h'], m['ow'], m['oh'])

    nx = ow // 16

    ny = oh // 16

    factor = 1 if full else min(rw / ow, rh / oh) / step

    ww = max(1, math.ceil(iw * factor))

    hh = max(1, math.ceil(ih * factor))

    ch = plane.shape[2]

    srcx = order % (w // 16) * 16

    srcy = order // (w // 16) * 16

    orig = inv[srcy * w + srcx]

    ox = orig % w

    oy = orig // w

    right = inv[srcy * w + srcx + 1]

    down = inv[(srcy + 1) * w + srcx]

    ex = right % w - ox

    ey = right // w - oy

    vx = down % w - ox

    vy = down // w - oy

    if not np.all((abs(ex) + abs(ey) == 1) & (abs(vx) + abs(vy) == 1) & (ex * vx + ey * vy == 0)):

        raise ValueError('Payload is not sampling-aligned')

    which = np.full(nx * ny, -1, np.int32)

    which[tiles[:len(order)]] = np.arange(len(order))

    which = which.reshape(ny, nx)

    tx = tiles[:len(order)] % nx * 16

    ty = tiles[:len(order)] // nx * 16

    keys = list(zip(ex.tolist(), ey.tolist(), vx.tolist(), vy.tolist(), (ox - ex * tx - vx * ty).tolist(), (oy - ey * tx - vy * ty).tolist()))

    labels = np.full(nx * ny, -1, np.int32)

    unique = {}

    for j, key in enumerate(keys):

        labels[tiles[j]] = unique.setdefault(key, len(unique))

    labels = labels.reshape(ny, nx)

    Y, X = np.mgrid[:plane.shape[0], :plane.shape[1]]

    x = (X * step + step / 2 + offset[0]) * ow / rw - 0.5

    y = (Y * step + step / 2 + offset[1]) * oh / rh - 0.5

    cx = np.floor((x + 0.5) / 16).astype(int)

    cy = np.floor((y + 0.5) / 16).astype(int)

    valid = (cx >= 0) & (cy >= 0) & (cx < nx) & (cy < ny)

    cx = np.clip(cx, 0, nx - 1)

    cy = np.clip(cy, 0, ny - 1)

    j = which[cy, cx]

    valid &= j >= 0

    j = np.maximum(j, 0)

    u = x - cx * 16

    v = y - cy * 16

    radius = (step - 1) / 2 + native_margin if (rw, rh) == (ow, oh) else margin * step / min(rw / ow, rh / oh)

    lowx = np.floor((x - radius + 0.5) / 16).astype(int)

    highx = np.floor((x + radius + 0.5) / 16).astype(int)

    lowy = np.floor((y - radius + 0.5) / 16).astype(int)

    highy = np.floor((y + radius + 0.5) / 16).astype(int)

    center = labels[cy, cx]

    for dy in [-1, 0, 1]:

        for dx in [-1, 0, 1]:

            a = cx + dx

            b = cy + dy

            hit = (a >= lowx) & (a <= highx) & (b >= lowy) & (b <= highy)

            same = (a >= 0) & (a < nx) & (b >= 0) & (b < ny) & (labels[np.clip(b, 0, ny - 1), np.clip(a, 0, nx - 1)] == center)

            valid &= ~hit | same

    sx = ox[j] + ex[j] * u + vx[j] * v

    sy = oy[j] + ey[j] * u + vy[j] * v

    valid &= (sx >= -0.5) & (sy >= -0.5) & (sx < iw - 0.5) & (sy < ih - 0.5)

    px = (sx[valid] + 0.5) * factor - 0.5

    py = (sy[valid] + 0.5) * factor - 0.5

    values = plane[valid]

    known = ~cfsampling_source_lattice(inv, m, mask, factor, ww, hh)

    confidence = np.ones(len(values))

    if cubic and (rw, rh) != (ow, oh):

        distance = np.full(x.shape, float('inf'))

        for dy in [-1, 0, 1]:

            for dx in [-1, 0, 1]:

                a = cx + dx

                b = cy + dy

                foreign = (a < 0) | (a >= nx) | (b < 0) | (b >= ny) | (labels[np.clip(b, 0, ny - 1), np.clip(a, 0, nx - 1)] != center)

                ddx = np.maximum(np.maximum(a * 16 - 0.5 - x, 0), x - (a * 16 + 15.5))

                ddy = np.maximum(np.maximum(b * 16 - 0.5 - y, 0), y - (b * 16 + 15.5))

                dd = np.sqrt(ddx * ddx + ddy * ddy)

                distance = np.minimum(distance, np.where(foreign, dd, float('inf')))

        radius = (2.5 + (step - 1) * 0.5) / min(rw / ow, rh / oh)

        confidence = np.clip((distance[valid] / radius) ** 2, 0.1, 1)

    seam_factor = factor if m['d'] >= 14 and (rw, rh) != (ow, oh) and cubic and ch == 1 else None
    seam_boost = severity * (0.06 + 0.07 * phase_strength)
    field = cfsampling_point_fit(values, px, py, confidence, ww, hh, bg, known, regular, 12 if fit else 0, cubic, seam_factor, seam_boost)
    if severity:
        radius = max(1, int((10 if ch == 1 else 14) * factor + 0.5))
        threshold = (6 if ch == 1 else 13) + 2 * phase_strength
        field = cfsampling_smooth_lattice(field, radius, threshold, severity)

    return (cfsampling_grid(field, factor, iw, ih, cubic), dict(samples=len(values), lattice=[ww, hh], factor=factor, known=float(known.mean()), cubic=cubic))



def cfsampling_phase_error(field, obs):

    yy, xx = np.mgrid[2:field.shape[0] * 2 - 2:3, 2:field.shape[1] * 2 - 2:3]

    yi = yy // 2

    xi = xx // 2

    yn = yi + np.where(yy % 2, 1, -1)

    xn = xi + np.where(xx % 2, 1, -1)

    pred = (field[yi, xi] * 0.75 + field[yi, xn] * 0.25) * 0.75 + (field[yn, xi] * 0.75 + field[yn, xn] * 0.25) * 0.25

    return float(np.mean((pred - obs[yy, xx]) ** 2))



def cfsampling_photo_regular(m, rw, rh, text):

    if text:

        return 0.003

    if m['d'] >= 15 and (rw, rh) != (m['ow'], m['oh']):

        t = min(1, max(0, (min(rw / m['ow'], rh / m['oh']) - 0.6) / 0.15))

        return 0.02 + 0.3 * t * t

    return 0.16 if m['d'] >= 14 and (rw, rh) != (m['ow'], m['oh']) else 0.02



def cfsampling_restore(image, m, password, initial, small=None, shape=None, allow_phase=False):

    key = cfpixels2_derive(password, bytes.fromhex(m['s']))

    mask, bg = cfcarrier2_open_map(m, key)

    order, tiles = cfcarrier2_mapping(m, key, mask)

    inv = cfsampling_transform_map(m)

    a = image[:, :, :3].astype(np.float64)

    rh, rw = a.shape[:2]

    y = (a[:, :, 0] * 19595 + a[:, :, 1] * 38470 + a[:, :, 2] * 7471) / 65536

    uv = np.stack([a[:, :, 2] - y, a[:, :, 0] - y], 2)

    valid = None

    if m['d'] >= 14:

        nx = m['ow'] // 16

        ny = m['oh'] // 16

        allowed = np.zeros((ny, nx), bool)

        allowed.ravel()[tiles[:len(order)]] = 1

        xx = (np.arange(rw) + 0.5) * m['ow'] / rw

        yy = (np.arange(rh) + 0.5) * m['oh'] / rh

        ix = np.floor(xx / 16).astype(int)

        iy = np.floor(yy / 16).astype(int)

        valid = allowed[np.minimum(iy, ny - 1)[:, None], np.minimum(ix, nx - 1)] & ((xx % 16 >= 3) & (xx % 16 <= 13) & (ix < nx))[None, :] & ((yy % 16 >= 3) & (yy % 16 <= 13) & (iy < ny))[:, None]

    native, model = cftransport_triangle_inverse(uv, valid)

    step = 2 if native is not None else 1

    offset = (0, 0)

    if native is None and allow_phase:

        best = float('inf')

        for px, py in ((1, 0), (0, 1), (1, 1)):

            padded = np.pad(uv, ((py, 0), (px, 0), (0, 0)), mode='edge')

            probe, pm = cftransport_triangle_inverse(padded, np.pad(valid, ((py, 0), (px, 0))) if valid is not None else None)

            if probe is not None:

                score = cfsampling_phase_error(probe, padded)

                if score < best:

                    best = score

                    native = probe

                    model = pm

                    offset = (-px, -py)

                    step = 2

    if native is None and (not allow_phase) and ((rw, rh) == (m['ow'], m['oh'])):

        return (initial.copy(), dict(model=model, mode='native-rgb'))

    by = (float(bg[0]) * 19595 + float(bg[1]) * 38470 + float(bg[2]) * 7471) / 65536

    bc = np.array([float(bg[2]) - by, float(bg[0]) - by])

    text = bool(m['b'] & 4 or (m['z'] and m['k'] * 256 < m['iw'] * m['ih'] * 0.65))

    scale = min(rw / m['ow'], rh / m['oh'])
    phase = cfsampling_resize_phase(y, m['ow'], m['oh']) if m['d'] >= 15 and scale < 0.68 else (0.0, 0.0)
    phase_strength = min(1, max(map(abs, phase)) / 0.45)
    severity = min(1, max(0, (0.62 - scale) / 0.15)) if m['d'] >= 15 and not text else 0

    score = cfsampling_block_score(initial) if (native is not None or allow_phase) and (rw, rh) == (m['ow'], m['oh']) and (not text) else 1.0

    edge_margin = 1 if score > 1.35 else 0

    if m['b'] & 2:

        chroma = np.zeros((m['ih'], m['iw'], 2))

        ci = dict(model='monochrome')

    else:

        chroma_regular = cfsampling_photo_regular(m, rw, rh, text) + severity * (0.04 + 0.05 * phase_strength)
        chroma_offset = (offset[0] + phase[0], offset[1] + phase[1])
        chroma, ci = cfsampling_scatter(native if native is not None else uv, step, m, order, tiles, mask, bc, inv, rw, rh, 0.5, chroma_regular, cubic=not text, native_margin=edge_margin, offset=chroma_offset, severity=severity, phase_strength=phase_strength)

    yy, yi = cfsampling_scatter(y[:, :, None], 1, m, order, tiles, mask, np.array([by]), inv, rw, rh, 0 if (rw, rh) == (m['ow'], m['oh']) else 0.35, 0.001 if text else 0.01, cubic=not text and (rw, rh) != (m['ow'], m['oh']), full=text, native_margin=edge_margin, offset=phase, severity=severity, phase_strength=phase_strength)

    yy = yy[:, :, 0]

    r = yy + chroma[:, :, 1]

    b = yy + chroma[:, :, 0]

    g = (yy - 0.299 * r - 0.114 * b) / 0.587

    rgb = np.clip(np.floor(np.stack([r, g, b], 2) + 0.5), 0, 255).astype(np.uint8)

    if small is None:

        shape = cfcarrier2_virtual_shape(rw, rh)

        small = cfcarrier2_resize(image[:, :, :3], *shape)

    table = cfcarrier2_calibration(small, shape, m)

    if m['b'] & 2:

        lut = np.floor(table.astype(float) @ np.array([0.299, 0.587, 0.114]) + 0.5).astype(np.uint8)

        rgb[:] = lut[np.clip(np.floor(yy + 0.5), 0, 255).astype(np.uint8)][:, :, None]

    else:

        for channel in range(3):

            rgb[:, :, channel] = table[rgb[:, :, channel], channel]

    out = initial.copy()

    out[:, :, :3] = rgb

    return (out, dict(chroma=ci, luma=yi, model=model, chroma_origin=list(offset), resize_phase=phase, native_edge_margin=edge_margin, native_block_score=score))

import os, sys, json

from pathlib import Path

import numpy as np

from PIL import Image

cfmisan_read_metadata = cfcarrier2_read_metadata



def cfmisan_phase(n, revision=15):

    return int((5 ** 0.5 - 1) / 2 * n / min(1024, n) + 0.5) * min(1024, n) % n



def cfmisan_tomato_transform(source, inverse=False, original_size=None, revision=15):

    h, w = source.shape[:2]

    if not inverse:

        pw = max(16, 1 << (w - 1).bit_length())

        ph = max(16, 1 << (h - 1).bit_length())

        if pw > 65535 or ph > 65535 or pw * ph > 48000000:

            raise ValueError('Padded working image exceeds 48 MP or dimension limit')

        padded = np.full((ph, pw, 4), 255, np.uint8)

        eh = (h + 15) // 16 * 16

        ew = (w + 15) // 16 * 16

        padded[:eh, :ew] = np.pad(source, ((0, eh - h), (0, ew - w), (0, 0)), mode='edge')

        source = padded

        w, h = (pw, ph)

    path = cfcarrier2_curve(w, h)

    other = np.roll(path, -cfmisan_phase(w * h, revision))

    out = np.empty_like(source)

    if inverse:

        out.reshape(-1, 4)[path] = source.reshape(-1, 4)[other]

    else:

        out.reshape(-1, 4)[other] = source.reshape(-1, 4)[path]

    if inverse and original_size:

        out = out[:original_size[1], :original_size[0]].copy()

    return out



def cfmisan_encrypt(source, cover, password='', options=None):

    if source.ndim != 3 or source.shape[2] != 4 or source.dtype != np.uint8 or (min(source.shape[:2]) < 1):

        raise ValueError('Requires uint8 RGBA image')

    cfpixels2_check_key(password)

    options = dict(options or {}, iw=source.shape[1], ih=source.shape[0], palette=cfrestore_palette(source))

    payload = cfmisan_tomato_transform(source)

    out, info = cfcarrier2_encrypt(payload, cover, password, options)

    return (out, dict(info, pipeline='aligned-padded-gilbert-then-contour'))



def cfmisan_extract_payload(image, password=''):

    return cfcarrier2_decrypt(image, password)



def cfmisan_decrypt(image, password=''):

    original = image

    image, registration = cfframe_locate(image)

    if registration.get('screenshot_registered'):

        try:

            registered_meta, *_ = cfmisan_read_metadata(image)

            if image.shape[1] > registered_meta['ow'] or image.shape[0] > registered_meta['oh']:

                image = cfcarrier2_resize(image, registered_meta['ow'], registered_meta['oh'])

                registration['screenshot_downsampled'] = True

        except ValueError:

            image = original

            registration = dict(screenshot_registered=False)

    payload, info = cfmisan_extract_payload(image, password)

    if info.get('legacy'):

        return (payload, info)

    m, small, shape, _ = cfmisan_read_metadata(image)

    out = cfmisan_tomato_transform(payload, True, (m['iw'], m['ih']), m['d'])

    if info.get('repair_applied'):

        out, model = cfsampling_restore(image, m, password, out, small, shape, registration.get('screenshot_registered', False))

        if m['b'] & 4 or (m['z'] and m['k'] * 256 < m['iw'] * m['ih'] * 0.65):

            out = cfrestore_selective(out, info.get('palette', []))

        info['sampling'] = model

    return (out, dict(info, **registration, pipeline='misan-then-aligned-gilbert-inverse'))



def _image(value):

    import io

    from PIL import ImageOps

    if isinstance(value, np.ndarray):

        if value.dtype != np.uint8 or value.ndim != 3 or value.shape[2] != 4:

            raise ValueError('Expected uint8 RGBA')

        return value

    if isinstance(value, (bytes, bytearray, memoryview)):

        value = io.BytesIO(bytes(value))

    with Image.open(value) as im:

        if im.width * im.height > 48000000: raise ValueError('Input exceeds 48 MP')

        return np.array(ImageOps.exif_transpose(im).convert('RGBA'))



def process(mode, input, cover=None, key='', output=None, progress=None):

    """Return {data: PNG bytes, width, height, mime, output}.



    input/cover: path, encoded image bytes or uint8 RGBA array.

    output: optional PNG path; existing files are never overwritten.

    progress: optional callable receiving a number in [0, 1].

    """

    import io

    if mode not in ('encrypt', 'decrypt'): raise ValueError('mode must be encrypt or decrypt')

    cfpixels2_check_key(key)

    emit = progress if callable(progress) else lambda _: None

    emit(0.02)

    image = _image(input)

    emit(0.08)

    if mode == 'encrypt':

        if cover is None or isinstance(cover, str) and not cover: raise ValueError('Cover is required')

        surface = _image(cover)

        emit(0.15)

        result, _ = cfmisan_encrypt(image, surface, key)

    else:

        emit(0.15)

        result, _ = cfmisan_decrypt(image, key)

    emit(0.92)

    stream = io.BytesIO()

    png_image = Image.fromarray(result)

    if result.shape[2] == 4 and np.all(result[:, :, 3] == 255): png_image = png_image.convert('RGB')

    png_image.save(stream, format='PNG', optimize=True)

    data = stream.getvalue()

    if output is not None:

        target = Path(output)

        target.parent.mkdir(parents=True, exist_ok=True)

        with target.open('xb') as f: f.write(data)

    emit(1.0)

    return dict(data=data, width=result.shape[1], height=result.shape[0], mime='image/png', output=output)



if __name__ == '__main__':

    import argparse

    parser = argparse.ArgumentParser(description='弥散混淆 v1.4 · fanmod')

    parser.add_argument('mode', choices=['encrypt', 'decrypt'])

    parser.add_argument('input')

    parser.add_argument('cover', help='cover path, or - for decrypt')

    parser.add_argument('key', help='password; use - for empty')

    parser.add_argument('output')

    a = parser.parse_args()

    try:

        cli_key = '' if a.key == '-' else a.key[1:] if a.key.startswith('@@') else Path(a.key[1:]).read_text('utf-8-sig') if a.key.startswith('@') else a.key

        r = process(a.mode, a.input, None if a.cover == '-' else a.cover, cli_key, a.output)

        print(json.dumps({k:v for k,v in r.items() if k != 'data'}, ensure_ascii=False))

    except Exception as e:

        print(str(e), file=sys.stderr)

        sys.exit(1)

