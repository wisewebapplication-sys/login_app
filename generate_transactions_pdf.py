import re
from collections import defaultdict, OrderedDict
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


def parse_transactions(script_path: Path):
    text = script_path.read_text(encoding="utf-8")
    match = re.search(
        r"function getStaticTransactions\(\)\s*\{\s*return\s*\[(.*?)\]\s*;\s*\}",
        text,
        re.DOTALL,
    )
    if not match:
        raise ValueError("No se encontró la función getStaticTransactions en script.js")

    block = match.group(1)
    raw_entries = re.findall(r"\{(.*?)\}", block, re.DOTALL)

    transactions = []
    for raw in raw_entries:
        def extract(pattern, default=None):
            m = re.search(pattern, raw)
            if not m:
                return default
            value = m.group(1)
            if value == "null":
                return None
            return value.strip("'")

        section_label = extract(r"sectionLabel:\s*(null|'[^']*')")
        title = extract(r"title:\s*'([^']*)'")
        date_label = extract(r"dateLabel:\s*'([^']*)'")
        amount = extract(r"amountPrimary:\s*'([^']*)'")
        is_positive = bool(re.search(r"isPositive:\s*true", raw))

        transactions.append(
            {
                "section": section_label,
                "title": title,
                "date": date_label,
                "amount": amount,
                "is_positive": is_positive,
            }
        )

    grouped = OrderedDict()
    current_section = None
    for entry in transactions:
        if entry["section"]:
            current_section = entry["section"]
            grouped[current_section] = []
        if current_section is None:
            # Ignorar entradas previas si no hay sección determinada
            continue
        grouped[current_section].append(
            {
                "title": entry["title"],
                "date": entry["date"],
                "amount": entry["amount"],
                "is_positive": entry["is_positive"],
            }
        )

    return grouped


def register_fonts():
    # Intento usar Inter si está disponible, si no, se cae a Helvetica
    inter_regular = Path("/usr/share/fonts/truetype/inter/Inter-Regular.ttf")
    inter_bold = Path("/usr/share/fonts/truetype/inter/Inter-Bold.ttf")

    if inter_regular.exists() and inter_bold.exists():
        pdfmetrics.registerFont(TTFont("Inter", str(inter_regular)))
        pdfmetrics.registerFont(TTFont("Inter-Bold", str(inter_bold)))
        return "Inter", "Inter-Bold"

    return "Helvetica", "Helvetica-Bold"


def build_pdf(grouped_transactions, output_path: Path):
    font_regular, font_bold = register_fonts()

    page_width, page_height = A4
    margin = 20 * mm
    line_height = 7 * mm
    section_spacing = 6 * mm

    c = canvas.Canvas(str(output_path), pagesize=A4)
    y = page_height - margin

    logo_path = Path("images/wise_logo_white.png")
    logo_width = 28 * mm
    logo_height = 8 * mm

    def draw_header():
        c.setFont(font_bold, 20)
        c.drawString(margin, page_height - margin, "Transacciones")
        if logo_path.exists():
            c.drawImage(
                str(logo_path),
                page_width - margin - logo_width,
                page_height - margin - logo_height + 4,
                width=logo_width,
                height=logo_height,
                preserveAspectRatio=True,
                mask='auto'
            )

    # Encabezado
    draw_header()
    y -= section_spacing * 1.5

    c.setFont(font_regular, 11)
    c.setFillColor(colors.HexColor("#6B7280"))
    c.drawString(margin, y, "Listado completo generado desde la vista móvil")
    c.setFillColor(colors.black)
    y -= section_spacing

    for section, entries in grouped_transactions.items():
        if y < margin + (line_height * (len(entries) + 1)):
            c.showPage()
            draw_header()
            y = page_height - margin
            y -= section_spacing * 1.5

        # Título de sección
        c.setFont(font_bold, 14)
        c.drawString(margin, y, section)
        y -= section_spacing

        c.setFont(font_regular, 11)
        for entry in entries:
            if y < margin + (line_height * 2):
                c.showPage()
                draw_header()
                y = page_height - margin - section_spacing * 1.5
                c.setFont(font_bold, 14)
                c.drawString(margin, y, section + " (cont.)")
                y -= section_spacing
                c.setFont(font_regular, 11)

            amount_color = colors.HexColor("#9FE870") if entry["is_positive"] else colors.black
            c.setFillColor(colors.HexColor("#D1D5DB"))
            c.drawString(margin, y, entry["date"])
            y -= line_height * 0.6

            c.setFillColor(colors.black)
            c.drawString(margin + 5 * mm, y, entry["title"])
            c.setFillColor(amount_color)
            c.drawRightString(
                page_width - margin,
                y,
                entry["amount"]
            )
            c.setFillColor(colors.black)
            y -= line_height

        y -= section_spacing / 2

    c.save()


def main():
    script_path = Path("script.js")
    if not script_path.exists():
        raise FileNotFoundError("No se encontró script.js en el directorio actual.")

    grouped_transactions = parse_transactions(script_path)
    output_path = Path("transactions.pdf")
    build_pdf(grouped_transactions, output_path)
    print(f"✅ PDF generado en {output_path}")


if __name__ == "__main__":
    main()
