import random
random.seed(11)
O='#04201D'; W,H=1600,900
o=[]; a=o.append
def poly(p,f,sw=2.4): a(f'<polygon points="{" ".join(f"{x:.0f},{y:.0f}" for x,y in p)}" fill="{f}" stroke="{O}" stroke-width="{sw}" stroke-linejoin="round"/>')
def rect(x,y,w,h,f,r=0,sw=2.4): a(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{f}" stroke="{O}" stroke-width="{sw}"/>')
def circ(x,y,r,f,sw=2.4): a(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{f}" stroke="{O}" stroke-width="{sw}"/>')
def path(d,f='none',s=O,sw=2.4,extra=''): a(f'<path d="{d}" fill="{f}" stroke="{s}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" {extra}/>')

a(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-labelledby="t d"><title id="t">Harbour at golden hour</title><desc id="d">A Hong Kong style harbour with a skyline, a red-sailed junk, a ferry, gulls and a bunny mascot waving from a pier.</desc>')
a('''<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0F6B63"/><stop offset=".5" stop-color="#1AA89B"/><stop offset=".85" stop-color="#F9E3A3"/><stop offset="1" stop-color="#F1C96F"/></linearGradient>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2C9C90"/><stop offset=".5" stop-color="#0F6B63"/><stop offset="1" stop-color="#0B3935"/></linearGradient>
<radialGradient id="glow" cx="1050" cy="520" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF3C4" stop-opacity=".9"/><stop offset="1" stop-color="#F1C96F" stop-opacity="0"/></radialGradient>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="5" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .9 -.25"/></filter>
<clipPath id="c"><rect width="1600" height="900" rx="40"/></clipPath>
<style>
.drift{animation:drift 60s linear infinite}.drift2{animation:drift2 90s linear infinite}.bob{animation:bob 4.5s ease-in-out infinite}.bob2{animation:bob 5.5s ease-in-out -2s infinite}
.wv{animation:wv 9s ease-in-out infinite alternate}.wv2{animation:wv 12s ease-in-out -4s infinite alternate}
.sail{animation:glide 80s linear infinite}.fer{animation:ferry 70s linear infinite}
.flap{animation:flap .9s ease-in-out infinite;transform-box:fill-box;transform-origin:center}.fly{animation:fly 40s linear infinite}
.hi{animation:hi 1.4s ease-in-out infinite;transform-box:fill-box;transform-origin:10% 90%}
@keyframes drift{from{transform:translateX(-300px)}to{transform:translateX(1900px)}}@keyframes drift2{from{transform:translateX(-300px)}to{transform:translateX(1900px)}}
@keyframes bob{0%,100%{transform:translateY(0) rotate(-.6deg)}50%{transform:translateY(7px) rotate(.8deg)}}
@keyframes wv{from{transform:translateX(-40px)}to{transform:translateX(40px)}}
@keyframes glide{from{transform:translateX(-80px)}to{transform:translateX(120px)}}
@keyframes ferry{from{transform:translateX(0)}to{transform:translateX(-1900px)}}
@keyframes flap{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.45)}}
@keyframes fly{from{transform:translate(-200px,0)}to{transform:translate(1800px,-60px)}}
@keyframes hi{0%,100%{transform:rotate(-14deg)}50%{transform:rotate(18deg)}}
@media (prefers-reduced-motion:reduce){.drift,.drift2,.bob,.bob2,.wv,.wv2,.sail,.fer,.flap,.fly,.hi{animation:none}}
</style></defs><g clip-path="url(#c)">''')
a(f'<rect width="{W}" height="{H}" fill="url(#sky)"/><rect width="{W}" height="{H}" fill="url(#glow)"/>')
circ(1050,500,130,'#FFF3C4')
# clouds
def cloud(x,y,s,cls):
    a(f'<g class="{cls}"><g transform="translate({x},{y}) scale({s})"><path d="M0,40 q-8,-30 28,-32 q10,-30 46,-14 q34,-18 56,12 q38,4 30,34 Z" fill="#FFF8E6" stroke="{O}" stroke-width="2.4" stroke-linejoin="round"/></g></g>')
cloud(150,110,1.3,'drift'); cloud(700,60,1,'drift2'); cloud(1200,160,1.5,'drift')
# hills + skyline
path('M0,520 Q220,330 470,430 T900,470 L900,560 L0,560Z','#2C7F78'); path('M500,560 Q760,360 1100,450 T1600,500 L1600,560Z','#1E6B65')
x=40; cols=[('#0B3935','#155A54'),('#155A54','#2C7F78'),('#0F6B63','#1AA89B')]
while x<1560:
    w=random.choice([48,60,72,90]); h=random.randint(110,330); c=random.choice(cols); top=560-h
    rect(x,top,w,h,c[1]); poly([(x+w*0.62,top),(x+w,top),(x+w,560),(x+w*0.62,560)],c[0],0)
    rect(x,top,w,h,'none')
    for ry in range(int(top)+18,550,26):
        for cx in range(x+10,int(x+w*0.55),16):
            if random.random()<.38: rect(cx,ry,6,10,'#F9E3A3',1,0)
    if random.random()<.3: poly([(x+w/2-10,top),(x+w/2+10,top),(x+w/2,top-46)],c[1])
    x+=w+random.choice([6,10,16])
# sea
a(f'<rect y="545" width="{W}" height="{H-545}" fill="url(#sea)" stroke="{O}" stroke-width="2.4"/>')
for i,(yy,cl) in enumerate([(590,'wv'),(650,'wv2'),(720,'wv'),(800,'wv2')]):
    d='M-120,%d '%yy+' '.join(f'q40,-16 80,0 t80,0' for _ in range(22))
    a(f'<g class="{cl}"><path d="{d}" fill="none" stroke="#9BF0E4" stroke-opacity="{.55-.1*i}" stroke-width="{3-i*.4}" stroke-linecap="round"/></g>')
# junk boat
def junk(x,y,s,cls):
    a(f'<g class="sail"><g transform="translate({x},{y}) scale({s})"><g class="{cls}">')
    path('M-110,0 Q-80,48 -10,50 L130,50 Q165,30 175,-14 Z','#C9654A')
    path('M-100,6 L165,-8','none',O,2)
    for mx,mh,sw in [(-60,170,70),(20,205,84),(100,160,66)]:
        a(f'<line x1="{mx}" y1="0" x2="{mx}" y2="{-mh}" stroke="{O}" stroke-width="4"/>')
        poly([(mx,-mh+8),(mx+sw,-mh+26),(mx+sw+8,-30),(mx,-18)],'#FF9E7A')
        for k in range(1,5):
            yy=-mh+8+k*(mh-26)/5; a(f'<line x1="{mx}" y1="{yy:.0f}" x2="{mx+sw+3}" y2="{yy+ (14 if True else 0)*0:.0f}" stroke="{O}" stroke-width="1.6" opacity=".7"/>')
    poly([(20,-205),(20,-225),(46,-217)],'#F1C96F',2)
    a('</g></g></g>')
junk(800,640,1.1,'bob')
# ferry
def ferry(x,y,s):
    a(f'<g class="fer"><g transform="translate({x},{y}) scale({s})"><g class="bob2">')
    poly([(-150,0),(150,0),(120,40),(-130,40)],'#F4F8F7'); rect(-150,-6,300,10,'#1AA89B',2)
    rect(-110,-52,200,48,'#DCEFEA',6); rect(-70,-90,120,40,'#F4F8F7',6); rect(40,-125,22,40,'#FF9E7A',3)
    for k in range(7): rect(-98+k*28,-40,18,16,'#0F6B63',3,1.8)
    for k in range(4): rect(-58+k*28,-80,18,16,'#0F6B63',3,1.8)
    a('</g></g></g>'); 
ferry(1780,665,1.0)
# buoy
a('<g class="bob"><g transform="translate(900,700)">'); rect(-9,-34,18,34,'#FF9E7A',6); rect(-9,-18,18,9,'#F4F8F7',0,1.6); circ(0,-40,5,'#F1C96F',1.8); a('</g></g>')
# pier
poly([(0,760),(520,760),(560,810),(0,810)],'#8E5B3A'); poly([(0,810),(560,810),(560,900),(0,900)],'#5B3A1E')
for k in range(0,540,60): a(f'<line x1="{k}" y1="760" x2="{k+18}" y2="810" stroke="{O}" stroke-width="2"/>')
for px in (90,300,500): rect(px,810,18,90,'#3E2813',2)
rect(430,700,14,62,'#3E2813',2); circ(437,694,13,'#F9E3A3')
# bunny mascot
a('<g transform="translate(330,764)"><g class="bob2">')
rect(-30,-96,60,70,'#F4F8F7',28); path('M-30,-70 Q0,-52 30,-70','none','#1AA89B',9)       # body + scarf
a('<ellipse cx="-14" cy="-24" rx="13" ry="7" fill="#F4F8F7" stroke="'+O+'" stroke-width="2.4"/><ellipse cx="14" cy="-24" rx="13" ry="7" fill="#F4F8F7" stroke="'+O+'" stroke-width="2.4"/>')
circ(0,-118,34,'#F4F8F7')
a(f'<ellipse cx="-17" cy="-176" rx="11" ry="34" fill="#F4F8F7" stroke="{O}" stroke-width="2.4" transform="rotate(-10 -17 -176)"/><ellipse cx="-17" cy="-174" rx="5" ry="24" fill="#FFC4AE" transform="rotate(-10 -17 -174)"/>')
a(f'<ellipse cx="19" cy="-176" rx="11" ry="34" fill="#F4F8F7" stroke="{O}" stroke-width="2.4" transform="rotate(14 19 -176)"/><ellipse cx="19" cy="-174" rx="5" ry="24" fill="#FFC4AE" transform="rotate(14 19 -174)"/>')
circ(-12,-122,4.2,O,0); circ(12,-122,4.2,O,0); path('M-4,-108 Q0,-103 4,-108','none'); a('<ellipse cx="0" cy="-112" rx="4" ry="3" fill="#FF9E7A"/>')
a('<ellipse cx="-22" cy="-108" rx="6" ry="4" fill="#FFC4AE" opacity=".8"/><ellipse cx="22" cy="-108" rx="6" ry="4" fill="#FFC4AE" opacity=".8"/>')
a('<g class="hi">'); path('M26,-82 Q52,-96 56,-130','none',O,15); path('M26,-82 Q52,-96 56,-130','none','#F4F8F7',10); circ(56,-134,9,'#F4F8F7'); a('</g>')
a('</g></g>')
# gulls
for gx,gy,s,dl in [(300,170,1,0),(420,120,.8,-8),(900,90,1.1,-20),(1300,200,.9,-30)]:
    a(f'<g class="fly" style="animation-delay:{dl}s"><g transform="translate({gx},{gy}) scale({s})"><g class="flap"><path d="M-22,0 Q-11,-14 0,0 Q11,-14 22,0" fill="none" stroke="{O}" stroke-width="3.2" stroke-linecap="round"/></g></g></g>')
a('</g>'); a(f'<rect width="{W}" height="{H}" rx="40" filter="url(#grain)" opacity=".45" style="mix-blend-mode:overlay;pointer-events:none"/></svg>')
open('harbour-scene-01.svg','w').write('\n'.join(o)); print(sum(len(s) for s in o))
