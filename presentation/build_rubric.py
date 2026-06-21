from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.pdfgen import canvas

# ── Palette ──────────────────────────────────────────────
GREEN   = colors.HexColor("#4A7A2E")
GREENDK = colors.HexColor("#2E5A18")
PINK    = colors.HexColor("#C85A72")
BROWN   = colors.HexColor("#5D3A1A")
BROWNMD = colors.HexColor("#8A6A45")
BEIGE   = colors.HexColor("#FDF6EC")
LINE    = colors.HexColor("#D9C9A8")
SUN     = colors.HexColor("#E08A00")

PATH = "/Users/alagumuthu/hobby/ieprep/presentation/IEPrep_Lesson_Review.pdf"
W, H = letter
M = 0.6 * inch

c = canvas.Canvas(PATH, pagesize=letter)
c.setTitle("IEPrep — Lesson Plan Review")

y = H - M

# ── Header band ──────────────────────────────────────────
c.setFillColor(GREEN)
c.rect(0, H - 0.95 * inch, W, 0.95 * inch, fill=1, stroke=0)
c.setFillColor(SUN)
c.rect(0, H - 0.99 * inch, W, 0.04 * inch, fill=1, stroke=0)

c.setFillColor(colors.white)
c.setFont("Helvetica-Bold", 20)
c.drawString(M, H - 0.55 * inch, "IEPrep  ·  Lesson Plan Review")
c.setFont("Helvetica-Oblique", 9.5)
c.setFillColor(colors.HexColor("#F3E9C9"))
c.drawString(M, H - 0.78 * inch, "Independent evaluation. Be critical — the goal is to find what's wrong, not to be encouraging.")

y = H - 1.25 * inch

# ── Info fields ──────────────────────────────────────────
def field(x, y, label, w, lw=None):
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(BROWNMD)
    c.drawString(x, y, label)
    lw = lw if lw else w
    c.setStrokeColor(LINE)
    c.setLineWidth(0.8)
    c.line(x + w, y - 1, x + w + lw, y - 1)

c.setFont("Helvetica-Bold", 9)
c.setFillColor(BROWN)
field(M, y, "Reviewer:", 0.65*inch, 1.9*inch)
field(M + 2.9*inch, y, "Date:", 0.4*inch, 1.4*inch)
y -= 0.3 * inch
field(M, y, "Subject:", 0.55*inch, 0.9*inch)
field(M + 1.7*inch, y, "Grade:", 0.5*inch, 0.7*inch)
field(M + 3.2*inch, y, "Standard (SOL):", 1.05*inch, 1.65*inch)
y -= 0.3 * inch
field(M, y, "Student / profile this was generated for:", 2.45*inch, 2.5*inch)

y -= 0.42 * inch

# ── Section heading helper ───────────────────────────────
def section(y, text):
    c.setFillColor(GREEN)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(M, y, text)
    return y - 0.06 * inch

# ── Part A — scored table ────────────────────────────────
y = section(y, "Part A  —  Score each   (1 = no / poor,  5 = yes / excellent)")
y -= 0.16 * inch

rows = [
    ("1", "Standard accuracy", "Correctly reflects the SOL; no factual or content errors"),
    ("2", "Right level", "Pitched to THIS child's actual level, not a generic version of the disability"),
    ("3", "Accommodations applied", "Built INTO the activities, not just listed and ignored"),
    ("4", "Differentiation is real", "Genuinely different for different needs, not surface relabeling"),
    ("5", "Pacing & length", "Realistic for the class length and the child's attention / stamina"),
    ("6", "Sensory / behavioral", "Accounts for sensory needs, regulation, transitions, behavior supports"),
    ("7", "Engagement", "Activities a child like this would actually respond to"),
    ("8", "Safety & dignity", "Nothing inappropriate, unsafe, or that talks down to the child"),
    ("9", "IEP-goal alignment", "Supports the kinds of goals these students carry"),
    ("10", "Usable by a sub", "A substitute could follow it without things going wrong"),
]

col_score_x = W - M - 1.55*inch   # left edge of the 1-5 boxes area
box = 0.26 * inch
gap = 0.035 * inch
row_h = 0.345 * inch

# header for score columns
c.setFont("Helvetica-Bold", 7.5)
c.setFillColor(BROWNMD)
for i in range(5):
    bx = col_score_x + i * (box + gap)
    c.drawCentredString(bx + box/2, y + 0.02*inch, str(i+1))
y -= 0.16 * inch

for (num, title, desc) in rows:
    # zebra background
    c.setFillColor(colors.HexColor("#FBF4E6"))
    c.rect(M - 0.05*inch, y - 0.10*inch, W - 2*M + 0.1*inch, row_h - 0.04*inch, fill=1, stroke=0)
    # number chip
    c.setFillColor(GREEN)
    c.circle(M + 0.07*inch, y + 0.05*inch, 0.10*inch, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawCentredString(M + 0.07*inch, y + 0.025*inch, num)
    # title + desc
    c.setFillColor(BROWN)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(M + 0.28*inch, y + 0.07*inch, title)
    c.setFillColor(BROWNMD)
    c.setFont("Helvetica", 7.3)
    c.drawString(M + 0.28*inch, y - 0.05*inch, desc)
    # score boxes
    for i in range(5):
        bx = col_score_x + i * (box + gap)
        c.setStrokeColor(LINE); c.setLineWidth(0.9)
        c.setFillColor(colors.white)
        c.roundRect(bx, y - 0.07*inch, box, box, 2, fill=1, stroke=1)
    y -= row_h

y -= 0.02 * inch
c.setFillColor(BROWN)
c.setFont("Helvetica-Bold", 9.5)
c.drawString(M, y, "Total:")
c.setStrokeColor(LINE); c.setLineWidth(0.9)
c.line(M + 0.55*inch, y - 1, M + 1.15*inch, y - 1)
c.setFont("Helvetica", 9.5); c.setFillColor(BROWNMD)
c.drawString(M + 1.2*inch, y, "/ 50")

y -= 0.34 * inch

# ── Part B — key questions ───────────────────────────────
y = section(y, "Part B  —  The two questions that matter most")
y -= 0.22 * inch

def checkbox(x, y, label):
    c.setStrokeColor(BROWNMD); c.setLineWidth(0.9)
    c.rect(x, y - 0.02*inch, 0.13*inch, 0.13*inch, fill=0, stroke=1)
    c.setFillColor(BROWN); c.setFont("Helvetica", 8.5)
    c.drawString(x + 0.2*inch, y, label)

c.setFillColor(BROWN); c.setFont("Helvetica-Bold", 9)
c.drawString(M, y, "1.  Would you put this in front of your students — as written, with no changes?")
y -= 0.24 * inch
checkbox(M + 0.15*inch, y, "Yes, as is")
checkbox(M + 1.55*inch, y, "Yes, with minor tweaks")
checkbox(M + 3.55*inch, y, "Only after significant rewriting")
y -= 0.22*inch
checkbox(M + 0.15*inch, y, "No")
y -= 0.34 * inch

c.setFillColor(BROWN); c.setFont("Helvetica-Bold", 9)
c.drawString(M, y, "2.  How much of your normal planning time did this actually save?")
y -= 0.24 * inch
for i, lbl in enumerate(["Almost all", "Most", "Some", "Little", "Made more work"]):
    checkbox(M + 0.15*inch + i*1.4*inch, y, lbl)
y -= 0.34 * inch

# ── Part C — open feedback ───────────────────────────────
y = section(y, "Part C  —  Where it fell short   (most valuable section — be specific)")
y -= 0.05 * inch
c.setFillColor(BROWNMD); c.setFont("Helvetica-Oblique", 7.8)
c.drawString(M, y, "Point to exact lines / activities that were wrong, generic, unsafe, or missed the child. This list becomes our fix list.")
y -= 0.22 * inch

def writeline(y, length=W - 2*M):
    c.setStrokeColor(LINE); c.setLineWidth(0.8)
    c.line(M, y, M + length, y)

for _ in range(3):
    writeline(y); y -= 0.26 * inch

y -= 0.05*inch
c.setFillColor(BROWN); c.setFont("Helvetica-Bold", 8.5)
c.drawString(M, y, "What it got genuinely right (worth keeping):")
y -= 0.24*inch
writeline(y); y -= 0.30*inch

c.setFillColor(BROWN); c.setFont("Helvetica-Bold", 8.5)
c.drawString(M, y, "The one thing that would most improve it:")
y -= 0.24*inch
writeline(y); y -= 0.18*inch

# ── Footer ───────────────────────────────────────────────
c.setStrokeColor(LINE); c.setLineWidth(0.8)
c.line(M, M - 0.05*inch, W - M, M - 0.05*inch)
c.setFillColor(BROWNMD); c.setFont("Helvetica-Oblique", 7.5)
c.drawString(M, M - 0.22*inch, "IEPrep  ·  Fill out independently — do not confer first.  Review 3+ lessons across different students / disabilities.")

c.showPage()
c.save()
print("Wrote", PATH)
