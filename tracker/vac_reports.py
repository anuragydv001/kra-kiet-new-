import io
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_shading(cell, color_hex="F2F4F8"):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_borders(cell, top="000000", bottom="000000", left="000000", right="000000"):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for b_name, b_val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        if b_val:
            border = OxmlElement(f'w:{b_name}')
            border.set(qn('w:val'), 'single')
            border.set(qn('w:sz'), '4')
            border.set(qn('w:space'), '0')
            border.set(qn('w:color'), b_val)
            tcBorders.append(border)
    tcPr.append(tcBorders)

SUPPORTING_DOCS_LIST = [
    "Approval/permission for conducting the course",
    "Course proposal/concept note",
    "Course syllabus/content",
    "Academic calendar/activity schedule",
    "Course timetable",
    "Resource person/faculty details",
    "Expert profile/CV, wherever applicable",
    "Attendance records",
    "Registration/enrolment records",
    "Assessment records",
    "Result/score sheet",
    "Student feedback",
    "Sample certificates",
    "Photographs with date and caption",
    "Geo-tagged photographs, wherever applicable",
    "Course completion report",
    "List of students who completed the course",
    "Any other relevant supporting document"
]

def generate_vac_docx(data):
    doc = Document()
    
    # Page setup - Margins 0.75 inches
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.7)
        section.bottom_margin = Inches(0.7)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Header Paragraph
    header_p = doc.add_paragraph()
    header_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_inst = header_p.add_run("KIET UNIVERSITY\n")
    run_inst.font.name = "Arial"
    run_inst.font.size = Pt(15)
    run_inst.font.bold = True
    run_inst.font.color.rgb = RGBColor(0, 35, 111)

    run_sub = header_p.add_run("DELHI-NCR, INDIA\n(Under Section 3 of the UGC Act, 1956)\n")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(8.5)
    run_sub.font.color.rgb = RGBColor(80, 80, 80)

    # Document Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(8)
    p_title.paragraph_format.space_after = Pt(2)
    run_t1 = p_title.add_run("REPORT ON VALUE ADDED COURSES, ADD-ON COURSES AND MOOCs\n")
    run_t1.font.name = "Arial"
    run_t1.font.size = Pt(11.5)
    run_t1.font.bold = True
    run_t1.font.underline = True

    run_t2 = p_title.add_run("KIET Deemed to be University, Ghaziabad")
    run_t2.font.name = "Arial"
    run_t2.font.size = Pt(10.5)
    run_t2.font.bold = True

    # Section A Table: Department Details
    table_a = doc.add_table(rows=4, cols=2)
    table_a.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_a.autofit = False

    labels_a = [
        ("Name of the Department", data.get('department', '')),
        ("Academic Session / Year/ Semester", f"{data.get('academicSession', '')} {data.get('semester', '')}".strip()),
        ("Faculty Coordinator(s)", data.get('facultyCoordinator', '')),
        ("Head of the Department", data.get('hodName', ''))
    ]

    for idx, (label, val) in enumerate(labels_a):
        row = table_a.rows[idx]
        cell_l = row.cells[0]
        cell_r = row.cells[1]
        cell_l.width = Inches(2.5)
        cell_r.width = Inches(4.5)
        
        cell_l.paragraphs[0].text = label
        cell_l.paragraphs[0].runs[0].font.bold = True
        cell_l.paragraphs[0].runs[0].font.size = Pt(9.5)
        
        cell_r.paragraphs[0].text = val or "—"
        cell_r.paragraphs[0].runs[0].font.size = Pt(9.5)
        
        set_cell_margins(cell_l, top=70, bottom=70, left=100, right=100)
        set_cell_margins(cell_r, top=70, bottom=70, left=100, right=100)
        set_cell_borders(cell_l)
        set_cell_borders(cell_r)

    # Section B: Introduction & Objectives
    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    intro_table = doc.add_table(rows=2, cols=1)
    intro_table.alignment = WD_TABLE_ALIGNMENT.CENTER

    cell_intro = intro_table.rows[0].cells[0]
    cell_intro.width = Inches(7.0)
    p_in = cell_intro.paragraphs[0]
    p_in.paragraph_format.space_after = Pt(4)
    r_in_head = p_in.add_run("Introduction - ")
    r_in_head.font.bold = True
    r_in_head.font.size = Pt(9)
    r_in_body = p_in.add_run("KIET Deemed to be University is committed to providing students with opportunities for holistic development and enhancing their employability, professional competencies, interdisciplinary knowledge and lifelong learning skills.\n\nIn addition to the prescribed curriculum, the University offers Value Added Courses (VACs), Add-on Courses and Massive Open Online Courses (MOOCs) to provide students with exposure to emerging technologies, industry practices, professional skills, interdisciplinary learning and global learning resources.\n● These courses are designed to complement the regular curriculum and contribute to the development of graduate attributes, employability skills and overall student development")
    r_in_body.font.size = Pt(8.5)

    cell_obj = intro_table.rows[1].cells[0]
    cell_obj.width = Inches(7.0)
    p_obj = cell_obj.paragraphs[0]
    r_obj_head = p_obj.add_run("Objectives of Value Added Courses - ")
    r_obj_head.font.bold = True
    r_obj_head.font.size = Pt(9)
    r_obj_body = p_obj.add_run("The major objectives of the Value Added Courses are:\n1. To supplement the knowledge acquired through the regular curriculum.\n2. To provide exposure to emerging technologies and industry practices.\n3. To develop employability and professional skills.\n4. To promote interdisciplinary and experiential learning.")
    r_obj_body.font.size = Pt(8.5)

    set_cell_margins(cell_intro, 70, 70, 100, 100)
    set_cell_margins(cell_obj, 70, 70, 100, 100)
    set_cell_borders(cell_intro)
    set_cell_borders(cell_obj)

    # Section C: Detail of Value Added Courses
    p_c_title = doc.add_paragraph()
    p_c_title.paragraph_format.space_before = Pt(8)
    p_c_title.paragraph_format.space_after = Pt(2)
    r_c = p_c_title.add_run("Detail of Value Added Courses")
    r_c.font.bold = True
    r_c.font.size = Pt(10)

    courses = data.get('courses', [])
    num_course_rows = max(len(courses), 1) + 1
    table_c = doc.add_table(rows=num_course_rows, cols=7)
    table_c.alignment = WD_TABLE_ALIGNMENT.CENTER

    headers_c = ["S. No.", "Course Name", "Duration\n(Hours)", "Mode\nOffline/\nOnline/\nHybrid", "Resource\nPerson/\nAgency", "No. of\nStudents\nEnrolled", "No. of\nStudents\nCompleted"]
    widths_c = [Inches(0.55), Inches(1.8), Inches(0.75), Inches(0.85), Inches(1.3), Inches(0.85), Inches(0.85)]

    for col_idx, h_text in enumerate(headers_c):
        cell = table_c.rows[0].cells[col_idx]
        cell.width = widths_c[col_idx]
        cell.paragraphs[0].text = h_text
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        cell.paragraphs[0].runs[0].font.bold = True
        cell.paragraphs[0].runs[0].font.size = Pt(8.5)
        set_cell_margins(cell, 60, 60, 60, 60)
        set_cell_shading(cell, "F2F4F8")
        set_cell_borders(cell)

    if courses:
        for idx, c in enumerate(courses):
            row = table_c.rows[idx + 1]
            row_data = [
                str(idx + 1),
                c.get('courseName', ''),
                str(c.get('durationHours', '')),
                c.get('mode', 'Offline'),
                c.get('resourcePerson', ''),
                str(c.get('enrolled', '')),
                str(c.get('completed', ''))
            ]
            for col_idx, val in enumerate(row_data):
                cell = row.cells[col_idx]
                cell.width = widths_c[col_idx]
                cell.paragraphs[0].text = val
                cell.paragraphs[0].runs[0].font.size = Pt(8.5)
                if col_idx in [0, 2, 3, 5, 6]:
                    cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
                set_cell_margins(cell, 50, 50, 50, 50)
                set_cell_borders(cell)
    else:
        row = table_c.rows[1]
        for col_idx, val in enumerate(["1", "", "", "", "", "", ""]):
            cell = row.cells[col_idx]
            cell.width = widths_c[col_idx]
            cell.paragraphs[0].text = val
            set_cell_margins(cell, 50, 50, 50, 50)
            set_cell_borders(cell)

    # Section D: Course Content/Syllabus
    p_d_title = doc.add_paragraph()
    p_d_title.paragraph_format.space_before = Pt(8)
    p_d_title.paragraph_format.space_after = Pt(2)
    r_d = p_d_title.add_run("Course Content/Syllabus")
    r_d.font.bold = True
    r_d.font.size = Pt(10)

    syllabus = data.get('syllabus', [])
    num_syl_rows = max(len(syllabus), 4) + 1
    table_d = doc.add_table(rows=num_syl_rows, cols=3)
    table_d.alignment = WD_TABLE_ALIGNMENT.CENTER

    headers_d = ["Module", "Topic", "No. of Hours"]
    widths_d = [Inches(1.0), Inches(4.7), Inches(1.3)]

    for col_idx, h_text in enumerate(headers_d):
        cell = table_d.rows[0].cells[col_idx]
        cell.width = widths_d[col_idx]
        cell.paragraphs[0].text = h_text
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        cell.paragraphs[0].runs[0].font.bold = True
        cell.paragraphs[0].runs[0].font.size = Pt(8.5)
        set_cell_margins(cell, 50, 50, 60, 60)
        set_cell_shading(cell, "F2F4F8")
        set_cell_borders(cell)

    for i in range(num_syl_rows - 1):
        row = table_d.rows[i + 1]
        if i < len(syllabus):
            item = syllabus[i]
            mod_val = str(item.get('module', i + 1))
            topic_val = str(item.get('topic', ''))
            hours_val = str(item.get('hours', ''))
        else:
            mod_val = str(i + 1)
            topic_val = ""
            hours_val = ""

        row.cells[0].paragraphs[0].text = mod_val
        row.cells[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        row.cells[1].paragraphs[0].text = topic_val
        row.cells[2].paragraphs[0].text = hours_val
        row.cells[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

        for col_idx in range(3):
            cell = row.cells[col_idx]
            cell.width = widths_d[col_idx]
            if cell.paragraphs[0].runs:
                cell.paragraphs[0].runs[0].font.size = Pt(8.5)
            set_cell_margins(cell, 45, 45, 50, 50)
            set_cell_borders(cell)

    # PAGE BREAK -> PAGE 2
    doc.add_page_break()

    # Section E: Learning Outcomes
    p_e = doc.add_paragraph()
    p_e.paragraph_format.space_before = Pt(4)
    p_e.paragraph_format.space_after = Pt(2)
    r_e = p_e.add_run("Learning Outcomes: - After successful completion of the course, students will be able to:")
    r_e.font.bold = True
    r_e.font.size = Pt(9.5)

    learning_outcomes = data.get('learningOutcomes', [])
    if learning_outcomes:
        for idx, lo in enumerate(learning_outcomes):
            if str(lo).strip():
                p_lo = doc.add_paragraph(style='List Bullet')
                p_lo.paragraph_format.space_after = Pt(2)
                r_lo = p_lo.add_run(str(lo).strip())
                r_lo.font.size = Pt(9)
    else:
        p_blank = doc.add_paragraph()
        p_blank.add_run("•  ___________________________________________________________________\n•  ___________________________________________________________________").font.size = Pt(9)

    # Section F: Assessment and Certification Table
    p_f = doc.add_paragraph()
    p_f.paragraph_format.space_before = Pt(6)
    p_f.paragraph_format.space_after = Pt(2)
    r_f = p_f.add_run("Assessment and Certification")
    r_f.font.bold = True
    r_f.font.size = Pt(9.5)

    table_f = doc.add_table(rows=6, cols=2)
    table_f.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_f.rows[0].cells[0].paragraphs[0].text = "Particular"
    table_f.rows[0].cells[1].paragraphs[0].text = "Details"
    table_f.rows[0].cells[0].paragraphs[0].runs[0].font.bold = True
    table_f.rows[0].cells[1].paragraphs[0].runs[0].font.bold = True
    set_cell_shading(table_f.rows[0].cells[0], "F2F4F8")
    set_cell_shading(table_f.rows[0].cells[1], "F2F4F8")
    set_cell_borders(table_f.rows[0].cells[0])
    set_cell_borders(table_f.rows[0].cells[1])

    assess = data.get('assessment', {})
    rows_f = [
        ("Assessment Method", assess.get('method', '')),
        ("Minimum Attendance Requirement", assess.get('minAttendance', '')),
        ("Passing/Completion Criteria", assess.get('passingCriteria', '')),
        ("Certificate Issuing Authority", assess.get('issuingAuthority', '')),
        ("Number of Certificates Issued", str(assess.get('certificatesIssued', '')))
    ]

    for idx, (p_label, p_val) in enumerate(rows_f):
        row = table_f.rows[idx + 1]
        c0 = row.cells[0]
        c1 = row.cells[1]
        c0.width = Inches(3.0)
        c1.width = Inches(4.0)
        c0.paragraphs[0].text = p_label
        c0.paragraphs[0].runs[0].font.size = Pt(8.5)
        c1.paragraphs[0].text = p_val or "—"
        c1.paragraphs[0].runs[0].font.size = Pt(8.5)
        set_cell_margins(c0, 45, 45, 60, 60)
        set_cell_margins(c1, 45, 45, 60, 60)
        set_cell_borders(c0)
        set_cell_borders(c1)

    # Section G: OUTCOME AND IMPACT
    p_g = doc.add_paragraph()
    p_g.paragraph_format.space_before = Pt(8)
    p_g.paragraph_format.space_after = Pt(1)
    r_g1 = p_g.add_run("OUTCOME AND IMPACT\n")
    r_g1.font.bold = True
    r_g1.font.size = Pt(10)
    r_g2 = p_g.add_run("Suggested Impact Indicators")
    r_g2.font.bold = True
    r_g2.font.size = Pt(9)

    impact_dict = data.get('outcomeAndImpact', {})
    impact_items = [
        ("Improvement in technical/professional skills", impact_dict.get('technicalSkills', '')),
        ("Improvement in employability skills", impact_dict.get('employability', '')),
        ("Industry certification obtained", impact_dict.get('industryCert', '')),
        ("Successful completion/certification rate", impact_dict.get('completionRate', '')),
        ("Internship opportunities", impact_dict.get('internships', '')),
        ("Placement support/outcomes", impact_dict.get('placementSupport', '')),
        ("Student projects developed", impact_dict.get('studentProjects', '')),
        ("Participation in competitions/hackathons", impact_dict.get('hackathons', ''))
    ]

    for label, desc in impact_items:
        p_imp = doc.add_paragraph(style='List Bullet')
        p_imp.paragraph_format.space_after = Pt(1.5)
        r_lbl = p_imp.add_run(f"{label}")
        r_lbl.font.size = Pt(8.5)
        if desc and str(desc).strip():
            r_desc = p_imp.add_run(f": {str(desc).strip()}")
            r_desc.font.size = Pt(8.5)
            r_desc.font.bold = True

    # Section H: Student Feedback Summary
    fb = data.get('feedback', {})
    score_val = fb.get('score', '')
    p_h = doc.add_paragraph()
    p_h.paragraph_format.space_before = Pt(6)
    p_h.paragraph_format.space_after = Pt(2)
    r_h1 = p_h.add_run("Student Feedback Summary: - Overall Feedback Score: ")
    r_h1.font.bold = True
    r_h1.font.size = Pt(9.5)
    r_h2 = p_h.add_run(f"{score_val or '____'} / 5\n\n")
    r_h2.font.bold = True
    r_h2.font.size = Pt(9.5)
    r_h3 = p_h.add_run("Major Suggestions Received:")
    r_h3.font.bold = True
    r_h3.font.size = Pt(9)

    suggs = fb.get('suggestions', [])
    for idx in range(3):
        val = suggs[idx] if idx < len(suggs) else ""
        p_sug = doc.add_paragraph()
        p_sug.paragraph_format.space_after = Pt(1.5)
        r_s = p_sug.add_run(f"{idx + 1}. {val if val else '________________________________________________________________________'}")
        r_s.font.size = Pt(8.5)

    # Section I: Prepared By and Approved By
    p_sig_space = doc.add_paragraph()
    p_sig_space.paragraph_format.space_before = Pt(6)
    
    table_i = doc.add_table(rows=1, cols=2)
    table_i.alignment = WD_TABLE_ALIGNMENT.CENTER
    prep = data.get('preparedBy', {})
    appr = data.get('approvedBy', {})

    c_prep = table_i.rows[0].cells[0]
    c_appr = table_i.rows[0].cells[1]
    c_prep.width = Inches(3.5)
    c_appr.width = Inches(3.5)

    p_p = c_prep.paragraphs[0]
    p_p.add_run("Prepared By:\n").font.bold = True
    p_p.add_run(f"Name: {prep.get('name', '______________________________')}\n")
    p_p.add_run(f"Designation: {prep.get('designation', '________________________')}\n")
    p_p.add_run(f"Signature: {prep.get('signature', '___________________________')}\n")
    p_p.add_run(f"Date: {prep.get('date', '_______________________________')}")
    for r in p_p.runs:
        r.font.size = Pt(8.5)

    p_a = c_appr.paragraphs[0]
    p_a.add_run("Approved By:\n").font.bold = True
    p_a.add_run(f"Name: {appr.get('name', '______________________________')}\n")
    p_a.add_run(f"Designation: {appr.get('designation', '________________________')}\n")
    p_a.add_run(f"Signature: {appr.get('signature', '___________________________')}\n")
    p_a.add_run(f"Date: {appr.get('date', '_______________________________')}")
    for r in p_a.runs:
        r.font.size = Pt(8.5)

    set_cell_margins(c_prep, 60, 60, 80, 80)
    set_cell_margins(c_appr, 60, 60, 80, 80)
    set_cell_borders(c_prep)
    set_cell_borders(c_appr)

    # PAGE BREAK -> PAGE 3
    doc.add_page_break()

    # Section J: Supporting Documents List
    p_j_head = doc.add_paragraph()
    p_j_head.paragraph_format.space_before = Pt(10)
    p_j_head.paragraph_format.space_after = Pt(6)
    r_j1 = p_j_head.add_run("List of Supporting Documents: - ")
    r_j1.font.bold = True
    r_j1.font.size = Pt(10)
    r_j2 = p_j_head.add_run("The following documents shall be maintained for each VAC/Add-on Course:")
    r_j2.font.bold = True
    r_j2.font.size = Pt(9.5)

    supp_docs = data.get('supportingDocuments', [])
    attached_map = {d.get('title'): d for d in supp_docs if isinstance(d, dict)}

    for s_doc in SUPPORTING_DOCS_LIST:
        p_doc = doc.add_paragraph(style='List Bullet')
        p_doc.paragraph_format.space_after = Pt(3)
        r_doc = p_doc.add_run(s_doc)
        r_doc.font.size = Pt(9)
        
        info = attached_map.get(s_doc)
        if info and info.get('attached'):
            r_att = p_doc.add_run(f"  [Attached: {info.get('fileName', 'File')}]")
            r_att.font.size = Pt(8.5)
            r_att.font.bold = True
            r_att.font.color.rgb = RGBColor(0, 100, 0)

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf
