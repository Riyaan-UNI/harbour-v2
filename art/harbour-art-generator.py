import math

C = 0.866
CX, CY = 600, 440
OUT = '#04201D'
SW = 2.4

def P(x, y, z):
    return (CX + (x - y) * C, CY + (x + y) * 0.5 - z)

def pts(lst):
    return ' '.join(f'{a:.1f},{b:.1f}' for a, b in lst)

out = []
def add(s): out.append(s)

def poly(lst, fill, sw=SW, extra=''):
    add(f'<polygon points="{pts(lst)}" fill="{fill}" stroke="{OUT}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>')

def box(x, y, z, w, d, h, top, left, right, sw=SW):
    # right face (x+w plane), left face (y+d plane), top
    poly([P(x+w, y, z), P(x+w, y+d, z), P(x+w, y+d, z+h), P(x+w, y, z+h)], right, sw)
    poly([P(x, y+d, z), P(x+w, y+d, z), P(x+w, y+d, z+h), P(x, y+d, z+h)], left, sw)
    poly([P(x, y, z+h), P(x+w, y, z+h), P(x+w, y+d, z+h), P(x, y+d, z+h)], top, sw)

def spire(x, y, z, w, d, h, left, right):
    apex = P(x + w/2, y + d/2, z + h)
    poly([P(x+w, y, z), P(x+w, y+d, z), apex], right)
    poly([P(x, y+d, z), P(x+w, y+d, z), apex], left)

def at(px, py, z):
    dx = (px - CX) / C
    dy = 2 * (py - CY + z)
    return ((dx + dy) / 2, (dy - dx) / 2)

def circle(cx, cy, r, fill, sw=SW, extra=''):
    add(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{OUT}" stroke-width="{sw}" {extra}/>')

def limb(pl, w, color):
    d = 'M' + ' L'.join(f'{a:.1f},{b:.1f}' for a, b in pl)
    add(f'<path d="{d}" fill="none" stroke="{OUT}" stroke-width="{w+4.4}" stroke-linecap="round" stroke-linejoin="round"/>')
    add(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>')

def pennant(px, py, color, length=44, cls='wave'):
    add(f'<g class="{cls}" style="transform-origin:{px}px {py}px">'
        f'<path d="M{px},{py} q{length*0.4},-5 {length},4 q-{length*0.35},7 -{length},13 Z" fill="{color}" stroke="{OUT}" stroke-width="{SW}" stroke-linejoin="round"/></g>')

def pole(px, py, h):
    add(f'<line x1="{px}" y1="{py}" x2="{px}" y2="{py-h}" stroke="{OUT}" stroke-width="3.2" stroke-linecap="round"/>')

def flag_at(world, z, color, h=58):
    x, y = world
    px, py = P(x, y, z)
    pole(px, py, h)
    pennant(px, py - h, color)

def person(fx, fy, s, shirt, pants, skin, hair, pose, hairstyle='short', pack=None, objs=None):
    add(f'<g transform="translate({fx:.1f},{fy:.1f}) scale({s})">')
    # local coords: feet at (0,0), up is negative y
    if pack:
        add(f'<rect x="-15" y="-46" width="11" height="17" rx="3" fill="{pack}" stroke="{OUT}" stroke-width="{SW}"/>')
    # legs
    if pose == 'climb':
        limb([(-4, -26), (-13, -16), (-11, -5)], 7, pants)
        limb([(4, -26), (8, -14), (7, -2)], 7, pants)
    else:
        limb([(-4, -26), (-5, -4)], 7, pants)
        limb([(4, -26), (5, -4)], 7, pants)
    add(f'<ellipse cx="-5.5" cy="-1.5" rx="6" ry="3" fill="{OUT}"/>')
    add(f'<ellipse cx="6" cy="-1.5" rx="6" ry="3" fill="{OUT}"/>')
    # back arm (left)
    shl, shr = (-8, -43), (8, -43)
    if pose == 'cheer':
        limb([shl, (-13, -55), (-15, -66)], 5.5, skin)
    elif pose == 'climb':
        limb([shl, (-14, -54), (-19, -66)], 5.5, skin)
    elif pose == 'carry':
        limb([shl, (-4, -33), (6, -35)], 5.5, skin)
    else:
        limb([shl, (-12, -34), (-12, -27)], 5.5, skin)
    # torso
    add(f'<rect x="-10" y="-47" width="20" height="23" rx="6" fill="{shirt}" stroke="{OUT}" stroke-width="{SW}"/>')
    # front arm (right)
    if pose == 'cheer':
        limb([shr, (13, -55), (16, -66)], 5.5, skin)
    elif pose == 'flag':
        limb([shr, (14, -52), (15, -62)], 5.5, skin)
        add(f'<line x1="15.5" y1="-58" x2="15.5" y2="-112" stroke="{OUT}" stroke-width="3.2" stroke-linecap="round"/>')
    elif pose == 'carry':
        limb([shr, (9, -34), (13, -36)], 5.5, skin)
    elif pose == 'climb':
        limb([shr, (12, -36), (11, -30)], 5.5, skin)
    else:
        limb([shr, (12, -35), (12, -29)], 5.5, skin)
    if objs: add(objs)
    # head
    if hairstyle == 'long':
        add(f'<path d="M-9,-56 a9,9 0 0 1 18,0 v14 q0,4 -4,4 h-10 q-4,0 -4,-4 Z" fill="{hair}" stroke="{OUT}" stroke-width="{SW}" stroke-linejoin="round"/>')
    if hairstyle == 'bun':
        circle(0, -69, 5.5, hair)
    circle(0, -56, 8.6, skin)
    if hairstyle in ('short', 'bun'):
        add(f'<path d="M-8.6,-57 a8.6,8.6 0 0 1 17.2,0 q-6,-3 -8.6,-1 q-4,-3 -8.6,1 Z" fill="{hair}" stroke="{OUT}" stroke-width="{SW}" stroke-linejoin="round"/>')
    if hairstyle == 'long':
        add(f'<path d="M-8.6,-57 a8.6,8.6 0 0 1 17.2,0 q-4,-2 -8.6,-1 q-4.6,-1 -8.6,1 Z" fill="{hair}"/>')
    add('</g>')

def papers():
    s = ''
    for (x, y, r) in [(14, -42, 14), (20, -34, -10), (11, -30, 6)]:
        s += f'<rect x="{x}" y="{y}" width="11" height="14" rx="1.5" fill="#F4F8F7" stroke="{OUT}" stroke-width="2" transform="rotate({r} {x+5} {y+7})"/>'
    return s

# ---------- palette ----------
BG1, BG2 = '#0B3935', '#0F6B63'
CORAL = ('#FFC4AE', '#FF9E7A', '#C9654A')
TEAL = ('#7DEBDD', '#1AA89B', '#0F6B63')
GOLD = ('#F9E3A3', '#F1C96F', '#C99A2E')
LAV = ('#DCC2FF', '#C79BFF', '#8E63D9')
DEEP = ('#2C7F78', '#155A54', '#0B3935')

# ---------- document ----------
W, H = 1200, 900
add(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-labelledby="t d">')
add('<title id="t">Isometric city steps</title><desc id="d">Small figures climb a stepped terrace toward a tower with flags, while four floating tiles hover nearby: a shield, a checklist, a speech bubble and a question bubble.</desc>')
add('''<defs>
<linearGradient id="bg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0B3935"/><stop offset=".55" stop-color="#0F6B63"/><stop offset="1" stop-color="#1AA89B"/></linearGradient>
<radialGradient id="glow" cx="600" cy="300" r="460" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F1C96F" stop-opacity=".55"/><stop offset="1" stop-color="#F1C96F" stop-opacity="0"/></radialGradient>
<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F9E3A3"/><stop offset="1" stop-color="#F1C96F"/></linearGradient>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .9 -.25"/></filter>
<clipPath id="panel"><rect width="1200" height="900" rx="40"/></clipPath>
<style>
.bob{animation:bob 6s ease-in-out infinite}.bob2{animation:bob 7.5s ease-in-out -2s infinite}.bob3{animation:bob 5.5s ease-in-out -1s infinite}.bob4{animation:bob 8s ease-in-out -3.5s infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.wave{animation:wave 3.6s ease-in-out infinite}@keyframes wave{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(3deg)}}
@media (prefers-reduced-motion:reduce){.bob,.bob2,.bob3,.bob4,.wave{animation:none}}
</style></defs>''')
add('<g clip-path="url(#panel)">')
add(f'<rect width="{W}" height="{H}" fill="url(#bg)"/>')
add(f'<rect width="{W}" height="{H}" fill="url(#glow)"/>')

# sun + back hills
circle(600, 300, 175, 'url(#sun)')
circle(250, 760, 250, '#1AA89B')
circle(1010, 800, 300, '#2C9C90')

# floating diamonds
def diamond(cx, cy, r, c1, c2):
    add(f'<polygon points="{cx-r},{cy} {cx},{cy-r*1.2} {cx},{cy+r*1.4}" fill="{c1}" stroke="{OUT}" stroke-width="2" stroke-linejoin="round"/>')
    add(f'<polygon points="{cx+r},{cy} {cx},{cy-r*1.2} {cx},{cy+r*1.4}" fill="{c2}" stroke="{OUT}" stroke-width="2" stroke-linejoin="round"/>')
add('<g class="bob3">'); diamond(110, 520, 16, GOLD[0], GOLD[2]); add('</g>')
add('<g class="bob">'); diamond(1120, 560, 13, LAV[0], LAV[2]); add('</g>')
add('<g class="bob4">'); diamond(470, 150, 11, TEAL[0], TEAL[1]); add('</g>')

# side towers (back)
lx, ly = -2 - 35, 402 - 35
box(lx, ly, 0, 70, 70, 430, DEEP[0], DEEP[1], DEEP[2])
for i in range(7):  # window slits on left face
    z0 = 40 + i*52
    poly([P(lx+14, ly+70, z0), P(lx+24, ly+70, z0), P(lx+24, ly+70, z0+26), P(lx+14, ly+70, z0+26)], '#F1C96F' if i % 3 == 1 else '#0B3935', 1.6)
spire(lx, ly, 430, 70, 70, 80, CORAL[1], CORAL[2])
rx_, ry_ = 402 - 35, -2 - 35
box(rx_, ry_, 0, 70, 70, 540, CORAL[0], CORAL[1], CORAL[2])
for i in range(9):
    z0 = 40 + i*52
    poly([P(rx_+70, ry_+14, z0), P(rx_+70, ry_+24, z0), P(rx_+70, ry_+24, z0+26), P(rx_+70, ry_+14, z0+26)], '#8E63D9' if i % 2 == 0 else '#C9654A', 1.6)
spire(rx_, ry_, 540, 70, 70, 90, LAV[1], LAV[2])

# ziggurat
tiers = [(0, 360, 0, 60, TEAL), (50, 260, 60, 60, GOLD), (100, 160, 120, 60, CORAL), (150, 60, 180, 60, LAV)]
for (o, size, z, h, c) in tiers:
    box(o, o, z, size, size, h, c[0], c[1], c[2])
    # stair seams on left face
    for k in range(1, 4):
        xx = o + size * k / 4
        a, b = P(xx, o+size, z), P(xx, o+size, z+h)
        add(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{OUT}" stroke-width="1.4" opacity=".55"/>')

# staircase down the front-left of the base
for k in range(6):
    box(120, 360 + k*13, 0, 110, 13, 54 - k*9, TEAL[0], TEAL[1], TEAL[2], 2.0)

# tower on top
box(165, 165, 240, 30, 30, 190, DEEP[0], DEEP[1], DEEP[2])
for i in range(3):
    z0 = 262 + i*55
    poly([P(165+8, 195, z0), P(165+14, 195, z0), P(165+14, 195, z0+26), P(165+8, 195, z0+26)], '#F1C96F', 1.4)
spire(165, 165, 430, 30, 30, 62, GOLD[1], GOLD[2])
apex = P(180, 180, 492)
pole(apex[0], apex[1], 40)
pennant(apex[0], apex[1]-40, CORAL[1], 46)

# milestone flags on tier corners


# milestone flags (front corners, drawn after the tiers so nothing hides them)
flag_at((300, 120), 120, GOLD[1], 54)
flag_at((110, 215), 180, CORAL[1], 52)
flag_at((345, 345), 60, LAV[1], 50)

# people
fx, fy = P(335, 235, 60)
person(fx, fy+4, 1.0, '#FF9E7A', '#155A54', '#8D5A3B', '#04201D', 'carry', 'short', objs=papers())
fx, fy = P(150, 292, 120)
person(fx, fy+4, 1.0, '#F1C96F', '#0B3935', '#F2B38C', '#5B3A1E', 'climb', 'long', pack='#8E63D9')
fx, fy = P(250, 168, 180)
person(fx, fy+4, 1.0, '#DCC2FF', '#0B3935', '#D9A066', '#04201D', 'flag', 'bun')
add(f'<g transform="translate({fx+15.5:.1f},{fy+4-112:.1f})"><g class="wave" style="transform-origin:0 0"><path d="M0,0 q18,-5 44,4 q-16,7 -44,13 Z" fill="{GOLD[1]}" stroke="{OUT}" stroke-width="{SW}" stroke-linejoin="round"/></g></g>')
fx, fy = P(196, 206, 240)
person(fx, fy+4, 0.9, '#7DEBDD', '#0B3935', '#C98B5F', '#04201D', 'cheer', 'short')

# floating tiles
def tile(px, py, z, icon_fn, cls, c=GOLD):
    x, y = at(px, py, z)
    add(f'<g class="{cls}">')
    box(x, y, z, 72, 72, 12, c[0], c[1], c[2])
    ox, oy = P(x, y, z+12)
    add(f'<g transform="matrix({C} .5 {-C} .5 {ox:.1f} {oy:.1f})">{icon_fn()}</g>')
    add('</g>')

def shield():
    return (f'<path d="M36 10 L58 19 V37 C58 50 48 58 36 63 C24 58 14 50 14 37 V19 Z" fill="#7DEBDD" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>'
            f'<path d="M25 36 l8 8 l14 -16" fill="none" stroke="{OUT}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>')
def checklist():
    s = ''
    for i, yy in enumerate((16, 31, 46)):
        s += f'<rect x="12" y="{yy}" width="11" height="11" rx="2.5" fill="#F9E3A3" stroke="{OUT}" stroke-width="2.5"/>'
        if i < 2: s += f'<path d="M14.5 {yy+5.5} l3 3 l5 -6" fill="none" stroke="{OUT}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
        s += f'<line x1="30" y1="{yy+5.5}" x2="{58 - i*6}" y2="{yy+5.5}" stroke="{OUT}" stroke-width="3.4" stroke-linecap="round"/>'
    return s
def speech():
    return (f'<path d="M14 18 h44 a6 6 0 0 1 6 6 v20 a6 6 0 0 1 -6 6 h-20 l-12 11 v-11 h-12 a6 6 0 0 1 -6 -6 v-20 a6 6 0 0 1 6 -6 Z" fill="#FFC4AE" stroke="{OUT}" stroke-width="3" stroke-linejoin="round"/>'
            f'<circle cx="26" cy="34" r="3.4" fill="{OUT}"/><circle cx="38" cy="34" r="3.4" fill="{OUT}"/><circle cx="50" cy="34" r="3.4" fill="{OUT}"/>')
def ask():
    return (f'<circle cx="36" cy="36" r="24" fill="#DCC2FF" stroke="{OUT}" stroke-width="3"/>'
            f'<path d="M28 30 a8 8 0 1 1 11 7 c-3 1.5 -3 4 -3 6" fill="none" stroke="{OUT}" stroke-width="4.4" stroke-linecap="round"/>'
            f'<circle cx="36" cy="51" r="3" fill="{OUT}"/>')

tile(430, 300, 150, speech, 'bob', CORAL)
tile(800, 270, 150, shield, 'bob2', TEAL)
tile(90, 290, 100, checklist, 'bob3', GOLD)
tile(1060, 330, 140, ask, 'bob4', LAV)

# foreground hills + steps
circle(120, 930, 190, '#0F6B63')
circle(1120, 940, 210, '#0B3935')
add('</g>')
# grain
add(f'<rect width="{W}" height="{H}" rx="40" filter="url(#grain)" opacity=".5" style="mix-blend-mode:overlay;pointer-events:none"/>')
add('</svg>')

svg = '\n'.join(out)
open('hero-concept-01.svg', 'w').write(svg)
print(len(svg), 'bytes')
