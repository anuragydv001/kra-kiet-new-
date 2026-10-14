import os
import io
import docx
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
from django.conf import settings

def set_cell_text(cell, text, bold=False, align=WD_ALIGN_PARAGRAPH.LEFT, size_pt=10):
    """ Helper to set text and Times New Roman font in a docx table cell. """
    cell.text = ''
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(size_pt)
    run.bold = bold
    return run

def generate_kra7_docx(data):
    """
    Populates the exact official KRA 7 Curriculum Feedback (Faculty).docx template
    with submitted report data.
    """
    # Locate original template
    possible_paths = [
        os.path.join(settings.BASE_DIR, 'kra-refrences', 'reports', 'KRA 7 Curriculum Feedback (Faculty).docx'),
        os.path.join(settings.BASE_DIR, 'kra-refrences', 'reports', 'KRA 7 Curriculum Feedback (Faculty) .docx'),
        r"D:\KIET-KRA--main\kra-refrences\reports\KRA 7 Curriculum Feedback (Faculty).docx"
    ]
    tpl_path = None
    for p in possible_paths:
        if os.path.exists(p):
            tpl_path = p
            break

    if not tpl_path:
        raise FileNotFoundError("Official KRA 7 DOCX template not found in kra-refrences/reports/")

    doc = docx.Document(tpl_path)

    # 1. Populate Table 0: Details of Faculty Member
    # Row 0 is header "Details of Faculty Member"
    t0 = doc.tables[0]
    faculty_name = data.get('facultyName', '')
    designation = data.get('designation', '')
    name_and_desig = f"{faculty_name}, {designation}" if designation and faculty_name else (faculty_name or designation or "Faculty Member")
    set_cell_text(t0.cell(1, 1), name_and_desig, size_pt=10.5)

    email = data.get('email', '')
    set_cell_text(t0.cell(2, 1), email, size_pt=10.5)

    mobile = data.get('mobileNumber', '')
    set_cell_text(t0.cell(3, 1), mobile, size_pt=10.5)

    acad_year = data.get('academicYear', '2026-2027')
    semester = data.get('semester', '')
    acad_sem = f"{acad_year} / {semester}" if semester else acad_year
    set_cell_text(t0.cell(4, 1), acad_sem, size_pt=10.5)

    department = data.get('department', '')
    set_cell_text(t0.cell(5, 1), department, size_pt=10.5)

    subject = data.get('subject', '')
    set_cell_text(t0.cell(6, 1), subject, size_pt=10.5)

    # 2. Populate Table 1: Feedback Survey Form (Questions 1 to 10)
    # Row 0: Header "Feedback Survey Form for Faculty member"
    # Row 1: Columns [S No., Tick Any Grading from 1 to 5, Poor (1), Satisfactory (2), Good (3), Very Good (4), Excellent (5 )]
    # Rows 2 to 11: Questions 1 to 10
    t1 = doc.tables[1]
    col_map = {1: 2, 2: 3, 3: 4, 4: 5, 5: 6}
    ratings = data.get('ratings', {})

    for q_idx in range(1, 11):
        row_idx = q_idx + 1 # Question 1 is row 2
        rating_val = None
        # Handle string or int keys
        if q_idx in ratings:
            rating_val = ratings[q_idx]
        elif str(q_idx) in ratings:
            rating_val = ratings[str(q_idx)]

        if rating_val and int(rating_val) in col_map:
            target_col = col_map[int(rating_val)]
            set_cell_text(t1.cell(row_idx, target_col), '✔', bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=12)

    # 3. Populate Table 2: Overall Satisfaction scale 1 to 10
    # Row 0: Question header
    # Row 1: Columns 0 to 9 for scores 1 to 10
    t2 = doc.tables[2]
    sat_score = data.get('overallSatisfaction')
    if sat_score is not None:
        try:
            sat_num = int(sat_score)
            for c_idx in range(10):
                num_val = c_idx + 1
                if num_val == sat_num:
                    set_cell_text(t2.cell(1, c_idx), f'✔ {num_val}', bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=11)
                    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="D5E3FC"/>')
                    t2.cell(1, c_idx)._tc.get_or_add_tcPr().append(shd)
                else:
                    set_cell_text(t2.cell(1, c_idx), str(num_val), bold=False, align=WD_ALIGN_PARAGRAPH.CENTER, size_pt=10)
        except (ValueError, TypeError):
            pass

    # 4. Populate Table 3: Suggestions if Any
    # Row 0: "Suggestions if Any:"
    # Row 1: Text box
    t3 = doc.tables[3]
    suggestions = data.get('suggestions', '')
    if suggestions:
        set_cell_text(t3.cell(1, 0), suggestions, size_pt=10.5)

    # 5. Faculty Signature verification
    sig_name = data.get('signatureName') or faculty_name
    sig_date = data.get('signatureDate', '')
    # Add signatory name under the signature paragraph if found
    for p in doc.paragraphs:
        if 'Signature of Faculty Member' in p.text:
            if sig_name:
                p_extra = doc.add_paragraph()
                p_extra.alignment = WD_ALIGN_PARAGRAPH.RIGHT
                r_name = p_extra.add_run(f"\n{sig_name}\nDate: {sig_date}\n[ Digitally Verified via KIET Portal ]")
                r_name.font.name = 'Times New Roman'
                r_name.font.size = Pt(10)
                r_name.font.italic = True
            break

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer
