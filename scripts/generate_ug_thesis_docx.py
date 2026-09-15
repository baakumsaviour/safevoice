import os
import re
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

FIGURES_DIR = 'docs/thesis/figures'
OUTPUT_DOCX = 'docs/thesis/SafeVoice_Thesis_Saviour_Baakum.docx'

# Map figure names to file paths
FIGURE_MAP = {
    "Figure 1.1": f"{FIGURES_DIR}/fig1_1_dovvsu_stats.png",
    "Figure 2.1": f"{FIGURES_DIR}/fig2_1_institutional_case_flow.png",
    "Figure 3.1": f"{FIGURES_DIR}/fig3_1_system_architecture.png",
    "Figure 3.2": f"{FIGURES_DIR}/fig3_2_ephemeral_vault.png",
    "Figure 3.3": f"{FIGURES_DIR}/fig3_3_stealth_state_machine.png",
    "Figure 3.4": f"{FIGURES_DIR}/fig3_4_calculator_keypad.png",
    "Figure 3.5": f"{FIGURES_DIR}/fig3_5_rls_security_boundary.png",
    "Figure 3.6": f"{FIGURES_DIR}/fig3_6_dual_track_routing.png",
    "Figure 4.1": f"{FIGURES_DIR}/fig4_1_rls_test_output.png",
    "Figure 4.2": f"{FIGURES_DIR}/fig4_2_latency_benchmark.png",
    "Figure 4.3": f"{FIGURES_DIR}/fig4_3_mapbox_ghana_map.png",
}

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_shading(cell, color_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def add_footer_page_number(run):
    fldSimple = OxmlElement('w:fldSimple')
    fldSimple.set(qn('w:instr'), 'PAGE')
    run._r.append(fldSimple)

def add_formatted_text(paragraph, text, base_font_name="Times New Roman", base_font_size=12, base_bold=False, base_italic=False, color_rgb=(0,0,0)):
    # Regex parse bold (**), italic (*), inline code (`)
    tokens = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', text)
    for token in tokens:
        if not token:
            continue
        run = paragraph.add_run()
        run.font.name = base_font_name
        run.font.size = Pt(base_font_size)
        run.font.color.rgb = RGBColor(*color_rgb)
        run.bold = base_bold
        run.italic = base_italic

        if token.startswith('**') and token.endswith('**'):
            run.text = token[2:-2]
            run.bold = True
        elif token.startswith('*') and token.endswith('*'):
            run.text = token[1:-1]
            run.italic = True
        elif token.startswith('`') and token.endswith('`'):
            run.text = token[1:-1]
            run.font.name = 'Courier New'
            run.font.size = Pt(base_font_size - 1.5)
            run.font.color.rgb = RGBColor(15, 23, 42)
        else:
            run.text = token

def build_thesis_docx():
    doc = docx.Document()

    # Configure styles
    styles = doc.styles
    normal_style = styles['Normal']
    normal_font = normal_style.font
    normal_font.name = 'Times New Roman'
    normal_font.size = Pt(12)
    normal_font.color.rgb = RGBColor(0, 0, 0)

    # 1. Section 1: Title Page (No header, no page numbers)
    section1 = doc.sections[0]
    section1.page_width = Inches(8.27)
    section1.page_height = Inches(11.69)
    section1.left_margin = Inches(1.5)
    section1.right_margin = Inches(1.0)
    section1.top_margin = Inches(1.0)
    section1.bottom_margin = Inches(1.0)
    section1.different_first_page_header_footer = True

    # Read front matter
    with open('docs/thesis/00_FRONT_MATTER.md', 'r', encoding='utf-8') as f:
        fm_text = f.read()

    # Split by \newpage
    fm_pages = fm_text.split('\\newpage')

    # Render Title Page (First element)
    title_page_content = fm_pages[0].strip().splitlines()
    for line in title_page_content:
        line = line.strip()
        if not line:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(4)
            continue
        if line.startswith('<br>'):
            p = doc.add_paragraph()
            continue
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.3
        p.paragraph_format.space_after = Pt(6)

        clean_text = line.replace('#', '').strip()
        if 'UNIVERSITY OF GHANA' in clean_text or 'COLLEGE OF BASIC' in clean_text:
            add_formatted_text(p, clean_text, base_font_size=14, base_bold=True)
        elif 'SAFEVOICE:' in clean_text:
            add_formatted_text(p, clean_text, base_font_size=15, base_bold=True)
        elif clean_text.startswith('BY') or clean_text.startswith('SAVIOUR BAAKUM'):
            add_formatted_text(p, clean_text, base_font_size=13, base_bold=True)
        elif 'A THESIS SUBMITTED' in clean_text or 'A PROJECT REPORT SUBMITTED' in clean_text:
            add_formatted_text(p, clean_text, base_font_size=11, base_bold=False)
        elif 'DEPARTMENT OF COMPUTER SCIENCE' in clean_text or 'SEPTEMBER, 2026' in clean_text:
            add_formatted_text(p, clean_text, base_font_size=12, base_bold=True)
        else:
            add_formatted_text(p, clean_text, base_font_size=12)

    # 2. Section 2: Preliminary Pages (Roman numerals in footer)
    section2 = doc.add_section(docx.enum.section.WD_SECTION.NEW_PAGE)
    section2.page_width = Inches(8.27)
    section2.page_height = Inches(11.69)
    section2.left_margin = Inches(1.5)
    section2.right_margin = Inches(1.0)
    section2.top_margin = Inches(1.0)
    section2.bottom_margin = Inches(1.0)
    section2.header.is_linked_to_previous = False
    section2.footer.is_linked_to_previous = False
    
    # Configure Roman page numbers in footer
    footer2 = section2.footer
    f_p2 = footer2.paragraphs[0]
    f_p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    f_p2.paragraph_format.space_after = Pt(0)
    add_footer_page_number(f_p2.add_run())

    # Render remaining front matter pages (Declaration, Abstract, Dedication, Acknowledgements, TOC, Lists)
    for p_idx, page in enumerate(fm_pages[1:]):
        if p_idx > 0:
            doc.add_page_break()
        lines = page.strip().splitlines()
        in_table = False
        table_rows = []

        for line in lines:
            line_str = line.strip()
            if not line_str:
                if in_table:
                    # Flush table
                    render_table(doc, table_rows)
                    table_rows = []
                    in_table = False
                continue

            if line_str.startswith('|') and line_str.endswith('|'):
                in_table = True
                table_rows.append(line_str)
                continue
            elif in_table:
                render_table(doc, table_rows)
                table_rows = []
                in_table = False

            if line_str.startswith('## '):
                heading_text = line_str[3:].strip()
                p = doc.add_paragraph()
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(14)
                p.paragraph_format.space_after = Pt(12)
                p.paragraph_format.keep_with_next = True
                add_formatted_text(p, heading_text.upper(), base_font_size=14, base_bold=True)
            elif line_str.startswith('### '):
                p = doc.add_paragraph()
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.space_before = Pt(10)
                p.paragraph_format.space_after = Pt(6)
                p.paragraph_format.keep_with_next = True
                add_formatted_text(p, line_str[4:].strip(), base_font_size=13, base_bold=True)
            else:
                p = doc.add_paragraph()
                p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                p.paragraph_format.line_spacing = 1.5
                p.paragraph_format.space_after = Pt(6)
                add_formatted_text(p, line_str)

        if in_table and table_rows:
            render_table(doc, table_rows)

    # 3. Section 3: Main Body (Chapters 1 to 5, References) - Arabic numerals
    section3 = doc.add_section(docx.enum.section.WD_SECTION.NEW_PAGE)
    section3.page_width = Inches(8.27)
    section3.page_height = Inches(11.69)
    section3.left_margin = Inches(1.5)
    section3.right_margin = Inches(1.0)
    section3.top_margin = Inches(1.0)
    section3.bottom_margin = Inches(1.0)
    section3.header.is_linked_to_previous = False
    section3.footer.is_linked_to_previous = False

    footer3 = section3.footer
    f_p3 = footer3.paragraphs[0]
    f_p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    f_p3.paragraph_format.space_after = Pt(0)
    add_footer_page_number(f_p3.add_run())

    # Set page number restart to 1
    sectPr = section3._sectPr
    pgNumType = OxmlElement('w:pgNumType')
    pgNumType.set(qn('w:start'), '1')
    sectPr.append(pgNumType)

    # Render Chapters 1 through 5, and References
    chapter_files = [
        'docs/thesis/01_CHAPTER_ONE_INTRODUCTION.md',
        'docs/thesis/02_CHAPTER_TWO_LITERATURE_REVIEW.md',
        'docs/thesis/03_CHAPTER_THREE_METHODOLOGY.md',
        'docs/thesis/04_CHAPTER_FOUR_IMPLEMENTATION_AND_RESULTS.md',
        'docs/thesis/05_CHAPTER_FIVE_CONCLUSION.md',
        'docs/thesis/06_REFERENCES.md'
    ]

    for c_idx, c_file in enumerate(chapter_files):
        if c_idx > 0:
            doc.add_page_break()
        render_chapter(doc, c_file)

    doc.save(OUTPUT_DOCX)
    print(f"SUCCESS: Generated Microsoft Word Thesis at {OUTPUT_DOCX}")

def render_table(doc, raw_lines):
    rows_data = []
    for line in raw_lines:
        cells = [c.strip() for c in line.split('|')[1:-1]]
        if all(re.match(r'^:?-+:?$', c) for c in cells):
            continue # separator line
        rows_data.append(cells)

    if not rows_data:
        return

    num_cols = max(len(r) for r in rows_data)
    table = doc.add_table(rows=len(rows_data), cols=num_cols)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    for r_idx, row in enumerate(rows_data):
        for c_idx in range(num_cols):
            cell_text = row[c_idx] if c_idx < len(row) else ""
            cell = table.cell(r_idx, c_idx)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_margins(cell, top=120, bottom=120, left=140, right=140)

            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.1

            if r_idx == 0:
                set_cell_shading(cell, "0F172A") # Dark navy header
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                add_formatted_text(p, cell_text, base_font_size=10, base_bold=True, color_rgb=(255, 255, 255))
            else:
                if r_idx % 2 == 1:
                    set_cell_shading(cell, "F8FAFC")
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                add_formatted_text(p, cell_text, base_font_size=10)

    p_spacer = doc.add_paragraph()
    p_spacer.paragraph_format.space_after = Pt(6)

def render_chapter(doc, file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.strip().splitlines()
    in_code_block = False
    code_lines = []
    in_table = False
    table_rows = []
    inserted_figures = set()

    for line in lines:
        line_str = line.strip()

        # Handle Code Blocks
        if line_str.startswith('```'):
            if in_code_block:
                # Flush code block
                p = doc.add_paragraph()
                p.paragraph_format.left_indent = Inches(0.4)
                p.paragraph_format.right_indent = Inches(0.4)
                p.paragraph_format.space_before = Pt(4)
                p.paragraph_format.space_after = Pt(6)
                p.paragraph_format.line_spacing = 1.0
                add_formatted_text(p, "\n".join(code_lines), base_font_name="Courier New", base_font_size=9, color_rgb=(15, 23, 42))
                code_lines = []
                in_code_block = False
            else:
                in_code_block = True
                code_lines = []
            continue

        if in_code_block:
            code_lines.append(line)
            continue

        # Handle Tables
        if line_str.startswith('|') and line_str.endswith('|'):
            in_table = True
            table_rows.append(line_str)
            continue
        elif in_table:
            render_table(doc, table_rows)
            table_rows = []
            in_table = False

        if not line_str:
            continue

        # Check for Figure insertion triggers
        fig_match = re.search(r'\b(Figure \d+\.\d+)\b', line_str)
        if fig_match and (line_str.startswith('![Figure') or (line_str.startswith(('**Figure', '*Figure')) and ':' in line_str)):
            fig_id = fig_match.group(1)
            if fig_id in inserted_figures:
                continue

            if fig_id in FIGURE_MAP and os.path.exists(FIGURE_MAP[fig_id]):
                # Insert Image
                p_img = doc.add_paragraph()
                p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p_img.paragraph_format.space_before = Pt(12)
                p_img.paragraph_format.space_after = Pt(4)
                run_img = p_img.add_run()
                run_img.add_picture(FIGURE_MAP[fig_id], width=Inches(5.5))

                # Insert Caption
                m_cap = re.search(r'!\[(.*?)\]', line_str)
                if m_cap:
                    clean_caption = m_cap.group(1).strip()
                else:
                    clean_caption = re.sub(r'[\*\_\[\]\(\)]', '', line_str).replace('![', '').strip()

                p_cap = doc.add_paragraph()
                p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p_cap.paragraph_format.space_after = Pt(12)
                add_formatted_text(p_cap, clean_caption, base_font_size=10, base_bold=True, base_italic=True, color_rgb=(71, 85, 105))
                inserted_figures.add(fig_id)
                continue

        # Headings
        if line_str.startswith('# '):
            heading_text = line_str[2:].strip()
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(16)
            p.paragraph_format.space_after = Pt(8)
            p.paragraph_format.keep_with_next = True
            add_formatted_text(p, heading_text.upper(), base_font_size=14, base_bold=True)
        elif line_str.startswith('## '):
            heading_text = line_str[3:].strip()
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.keep_with_next = True
            add_formatted_text(p, heading_text, base_font_size=13, base_bold=True)
        elif line_str.startswith('### '):
            heading_text = line_str[4:].strip()
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.keep_with_next = True
            add_formatted_text(p, heading_text, base_font_size=12, base_bold=True, base_italic=True)
        elif line_str.startswith('> '):
            # Blockquote
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.5)
            p.paragraph_format.right_indent = Inches(0.5)
            p.paragraph_format.line_spacing = 1.15
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(6)
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            add_formatted_text(p, line_str[2:].strip(), base_font_size=11, base_italic=True, color_rgb=(51, 65, 85))
        elif line_str.startswith(('- ', '* ')):
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.3)
            p.paragraph_format.line_spacing = 1.4
            p.paragraph_format.space_after = Pt(4)
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            run_bullet = p.add_run("•  ")
            run_bullet.bold = True
            add_formatted_text(p, line_str[2:].strip())
        else:
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p.paragraph_format.line_spacing = 1.5
            p.paragraph_format.space_after = Pt(6)
            add_formatted_text(p, line_str)

    if in_table and table_rows:
        render_table(doc, table_rows)

if __name__ == '__main__':
    build_thesis_docx()
