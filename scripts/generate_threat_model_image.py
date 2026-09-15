import os
import textwrap
from PIL import Image, ImageDraw, ImageFont

# Ensure target directories exist
os.makedirs('images', exist_ok=True)
os.makedirs('docs/images', exist_ok=True)
os.makedirs('docs/thesis/images', exist_ok=True)
os.makedirs('docs/thesis/figures', exist_ok=True)

FONT_REG_PATH = '/System/Library/Fonts/Supplemental/Arial.ttf'
FONT_BOLD_PATH = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
FONT_SERIF_PATH = '/System/Library/Fonts/Supplemental/Times New Roman.ttf'

def get_font(size, bold=False):
    path = FONT_BOLD_PATH if bold else FONT_REG_PATH
    return ImageFont.truetype(path, size)

def draw_rounded_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    x0, y0, x1, y1 = bbox
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)

def generate_threat_model():
    W, H = 1600, 960
    img = Image.new('RGB', (W, H), '#f1f5f9')
    draw = ImageDraw.Draw(img)

    # Top Header Banner
    draw.text((80, 42), "SAFEVOICE DIGITAL PUBLIC INFRASTRUCTURE: ADVERSARIAL THREAT SPECIFICATION", fill='#dc2626', font=get_font(15, True))
    draw.text((80, 70), "Adversarial Threat Model & Attack Vector Classification", fill='#0f172a', font=get_font(34, True))
    draw.text((80, 118), "Taxonomy of physical, network, and institutional threat actors targeting domestic crisis reporting systems", fill='#64748b', font=get_font(19))

    # Main Card Bounding Box
    card_x0, card_y0, card_x1, card_y1 = 80, 165, 1520, 890
    draw_rounded_rect(draw, [card_x0, card_y0, card_x1, card_y1], radius=16, fill='#ffffff', outline='#cbd5e1', width=2)

    # Table Header (Navy Bar)
    hdr_h = 68
    draw.rounded_rectangle([card_x0, card_y0, card_x1, card_y0 + hdr_h], radius=16, fill='#0f172a')
    draw.rectangle([card_x0, card_y0 + hdr_h - 16, card_x1, card_y0 + hdr_h], fill='#0f172a')

    # Column Split X
    col_split = 560

    # Header Titles
    draw.text((card_x0 + 35, card_y0 + 22), "THREAT ACTOR & SECURITY PROFILE", fill='#ffffff', font=get_font(18, True))
    draw.line([(col_split, card_y0 + 12), (col_split, card_y0 + hdr_h - 12)], fill='#334155', width=1)
    draw.text((col_split + 35, card_y0 + 22), "ATTACK VECTOR, CAPABILITY & ADVERSARIAL MOTIVATION", fill='#ffffff', font=get_font(18, True))

    rows = [
        {
            "badge": "CRITICAL RISK • PHYSICAL DOMAIN",
            "badge_bg": "#fee2e2",
            "badge_fg": "#991b1b",
            "bullet_color": "#dc2626",
            "actor_title": "1. Physically Proximate Abuser",
            "actor_sub": "(Coercive Domestic Control)",
            "desc_lines": [
                "Immediate physical proximity; coercive device authority;",
                "shared domestic quarters; unannounced visual access."
            ],
            "bullets": [
                "Sudden room entry during active report drafting or voice note recording",
                "Unannounced phone handover demand and interactive visual inspection",
                "Forensic examination of browser tabs, navigation history, and active caches",
                "Inspection of smartphone home-screen launcher for persistent crisis icons"
            ],
            "bg": "#ffffff"
        },
        {
            "badge": "HIGH RISK • NETWORK & FORENSIC DOMAIN",
            "badge_bg": "#dbeafe",
            "badge_fg": "#1e40af",
            "bullet_color": "#2563eb",
            "actor_title": "2. Hostile Network / Forensic Adversary",
            "actor_sub": "(Technical Interception & Legal Spoliation)",
            "desc_lines": [
                "Local Wi-Fi eavesdropper; digital forensic examiner;",
                "defense counsel in circuit/high court proceedings."
            ],
            "bullets": [
                "Inspection of browser DevTools, process memory, and local storage artifacts",
                "Man-in-the-Middle (MitM) Wi-Fi packet sniffing and unencrypted transport snooping",
                "Defense subpoena challenging evidentiary integrity and hash spoliation under Act 772",
                "Attempted injection of manipulated media payloads into evidence storage buckets"
            ],
            "bg": "#f8fafc"
        },
        {
            "badge": "ELEVATED RISK • TENANCY & SYSTEM DOMAIN",
            "badge_bg": "#fef3c7",
            "badge_fg": "#92400e",
            "bullet_color": "#d97706",
            "actor_title": "3. Compromised Insider / Untrusted Tenant",
            "actor_sub": "(Unauthorized Access & Record Tampering)",
            "desc_lines": [
                "Curious or compromised caseworker; malicious anonymous tenant;",
                "rogue database operator attempting unauthorized inspection."
            ],
            "bullets": [
                "Caseworker querying unassigned case files or unauthorized cross-tenant victim profiles",
                "Anonymous victim or external actor attempting privilege escalation to administrator role",
                "Tampering with or unauthorized modification of immutable case audit trails and evidence hashes",
                "Unauthorized forgery of official caseworker triage advice or automated AI first-response records"
            ],
            "bg": "#ffffff"
        }
    ]

    row_h = (card_y1 - (card_y0 + hdr_h)) / 3.0

    for i, r in enumerate(rows):
        ry0 = card_y0 + hdr_h + i * row_h
        ry1 = ry0 + row_h

        # Row Background
        if i == 2: # bottom rounded
            draw.rectangle([card_x0, ry0, card_x1, ry1 - 16], fill=r['bg'])
            draw.rounded_rectangle([card_x0, ry1 - 32, card_x1, ry1], radius=16, fill=r['bg'])
        else:
            draw.rectangle([card_x0, ry0, card_x1, ry1], fill=r['bg'])

        # Top border of row
        draw.line([(card_x0, ry0), (card_x1, ry0)], fill='#cbd5e1', width=1)

        # Vertical Column Divider
        draw.line([(col_split, ry0), (col_split, ry1)], fill='#e2e8f0', width=1)

        # Left Column Content
        lx = card_x0 + 35
        ly = ry0 + 22

        # Badge
        badge_text = r['badge']
        badge_w = draw.textlength(badge_text, font=get_font(12, True)) + 20
        draw_rounded_rect(draw, [lx, ly, lx + badge_w, ly + 24], radius=6, fill=r['badge_bg'])
        draw.text((lx + 10, ly + 4), badge_text, fill=r['badge_fg'], font=get_font(12, True))

        # Actor Title
        draw.text((lx, ly + 36), r['actor_title'], fill='#0f172a', font=get_font(21, True))
        draw.text((lx, ly + 66), r['actor_sub'], fill=r['badge_fg'], font=get_font(16, True))
        
        # Wrapped Actor Description
        desc_y = ly + 96
        for d_line in r['desc_lines']:
            draw.text((lx, desc_y), d_line, fill='#64748b', font=get_font(13.5))
            desc_y += 20

        # Right Column Content (Bullets)
        rx = col_split + 35
        by = ry0 + 26
        spacing = 38

        for bullet in r['bullets']:
            # Bullet marker
            draw.ellipse([rx, by + 4, rx + 8, by + 12], fill=r['bullet_color'])
            draw.text((rx + 20, by - 2), bullet, fill='#1e293b', font=get_font(16))
            by += spacing

    # Re-stroke outer border of table
    draw_rounded_rect(draw, [card_x0, card_y0, card_x1, card_y1], radius=16, outline='#94a3b8', width=2)

    # Bottom Metadata
    draw.text((80, 915), "SafeVoice DPI • Security Threat Model • Compliant with Act 732 (Domestic Violence), Act 772 (Electronic Transactions) & Act 843 (Data Protection)", fill='#64748b', font=get_font(14))
    draw.text((1240, 915), "Architectural Reference Model", fill='#0f172a', font=get_font(14, True))

    # Save to all target locations
    out_paths = [
        'images/adversarial_threat_model.png',
        'docs/images/adversarial_threat_model.png',
        'docs/thesis/images/adversarial_threat_model.png',
        'docs/thesis/figures/adversarial_threat_model.png'
    ]

    for p in out_paths:
        img.save(p, 'PNG', optimize=True)
        print(f"Saved threat model image: {p}")

if __name__ == '__main__':
    generate_threat_model()
