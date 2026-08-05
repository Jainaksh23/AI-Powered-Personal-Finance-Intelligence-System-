from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any
import database, models, auth
import io

router = APIRouter(prefix="/api/reports", tags=["Reports & Exports"])

@router.get("/summary")
def get_reports_summary(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    incomes = db.query(models.Income).filter(models.Income.user_id == current_user.id).all()
    expenses = db.query(models.Expense).filter(models.Expense.user_id == current_user.id).all()
    budgets = db.query(models.Budget).filter(models.Budget.user_id == current_user.id).all()

    total_income = sum(i.amount for i in incomes)
    total_expense = sum(e.amount for e in expenses)
    net_savings = total_income - total_expense
    savings_rate = round((net_savings / total_income * 100), 1) if total_income > 0 else 0.0

    # Category breakdown
    cat_summary = {}
    for e in expenses:
        cat_summary[e.category] = cat_summary.get(e.category, 0.0) + e.amount

    category_reports = []
    for cat, amt in cat_summary.items():
        category_reports.append({
            "category": cat,
            "total_spent": round(amt, 2),
            "percentage": round((amt / total_expense * 100), 1) if total_expense > 0 else 0.0
        })

    # Budget summary
    budget_reports = []
    now = datetime.utcnow()
    for b in budgets:
        spent = sum(e.amount for e in expenses if e.category == b.category and e.date and getattr(e.date, 'month', None) == now.month)
        budget_reports.append({
            "category": b.category,
            "monthly_limit": b.monthly_limit,
            "spent": round(spent, 2),
            "status": "Exceeded" if spent > b.monthly_limit else "Within Budget"
        })

    return {
        "user_name": current_user.name,
        "currency": current_user.currency,
        "report_date": datetime.utcnow().strftime("%B %Y"),
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "net_savings": round(net_savings, 2),
        "savings_rate": savings_rate,
        "category_reports": category_reports,
        "budget_reports": budget_reports,
        "transaction_count": len(expenses) + len(incomes)
    }

@router.get("/download-pdf")
def download_pdf_report(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    summary = get_reports_summary(db=db, current_user=current_user)
    curr_str = "INR" if summary['currency'] in ["₹", "INR"] else summary['currency']
    
    # ReportLab binary PDF generation
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()

        story = []

        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=22,
            textColor=colors.HexColor('#06b6d4'),
            spaceAfter=6
        )

        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=18
        )

        story.append(Paragraph("<b>Personal Finance Intelligence Report</b>", title_style))
        story.append(Paragraph(f"Generated for: <b>{summary['user_name']}</b> | Period: <b>{summary['report_date']}</b> | System: PFIS AI Engine", subtitle_style))
        story.append(Spacer(1, 10))

        # KPI Summary Table
        story.append(Paragraph("<b>Key Financial Indicators</b>", styles['Heading2']))
        kpi_data = [
            ["Financial Indicator", "Value"],
            ["Total Monthly Income", f"{curr_str} {summary['total_income']:,.2f}"],
            ["Total Monthly Expenses", f"{curr_str} {summary['total_expense']:,.2f}"],
            ["Net Monthly Surplus / Savings", f"{curr_str} {summary['net_savings']:,.2f}"],
            ["Savings Rate (%)", f"{summary['savings_rate']}%"]
        ]
        kpi_table = Table(kpi_data, colWidths=[240, 240])
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#38bdf8')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ]))
        story.append(kpi_table)
        story.append(Spacer(1, 18))

        # Category Breakdown Table
        story.append(Paragraph("<b>Category Spending Summary</b>", styles['Heading2']))
        cat_data = [["Category", "Total Spent", "Share of Expenses (%)"]]
        for cat in summary['category_reports']:
            cat_data.append([cat['category'], f"{curr_str} {cat['total_spent']:,.2f}", f"{cat['percentage']}%"])

        if len(cat_data) == 1:
            cat_data.append(["No expenses logged", f"{curr_str} 0.00", "0%"])

        cat_table = Table(cat_data, colWidths=[200, 160, 120])
        cat_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(cat_table)
        story.append(Spacer(1, 18))

        # Budget Compliance Table
        story.append(Paragraph("<b>Monthly Budget Compliance</b>", styles['Heading2']))
        b_data = [["Category", "Monthly Limit", "Actual Spend", "Compliance Status"]]
        for b in summary['budget_reports']:
            b_data.append([b['category'], f"{curr_str} {b['monthly_limit']:,.2f}", f"{curr_str} {b['spent']:,.2f}", b['status']])

        if len(b_data) == 1:
            b_data.append(["General", f"{curr_str} 0.00", f"{curr_str} 0.00", "Within Budget"])

        b_table = Table(b_data, colWidths=[150, 110, 110, 110])
        b_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#334155')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (1,0), (2,-1), 'RIGHT'),
            ('ALIGN', (3,0), (3,-1), 'CENTER'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(b_table)

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=financial_report_{datetime.utcnow().strftime('%Y%m%d')}.pdf"}
        )
    except Exception as e:
        print("PDF build fallback notice:", e)
        report_text = f"""
=====================================================
PERSONAL FINANCE INTELLIGENCE SYSTEM - MONTHLY REPORT
=====================================================
Generated for: {summary['user_name']}
Date: {summary['report_date']}

SUMMARY KPI:
- Total Income: {curr_str} {summary['total_income']}
- Total Expense: {curr_str} {summary['total_expense']}
- Net Savings: {curr_str} {summary['net_savings']}
- Savings Rate: {summary['savings_rate']}%

CATEGORY BREAKDOWN:
"""
        for c in summary['category_reports']:
            report_text += f" - {c['category']}: {curr_str} {c['total_spent']} ({c['percentage']}%)\n"

        return Response(
            content=report_text.encode("utf-8"),
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename=financial_report_{datetime.utcnow().strftime('%Y%m%d')}.txt"}
        )
