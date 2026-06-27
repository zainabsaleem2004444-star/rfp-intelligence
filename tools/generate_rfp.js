const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerShade = { fill: "1F3864", type: ShadingType.CLEAR };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: headerShade,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20 })]
    })]
  });
}

function bodyCell(text, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, bold: opts.bold || false })]
    })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22 })]
  });
}

function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22 })]
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 160 },
    children: [new TextRun({ text, size: 22, bold: opts.bold || false, italics: opts.italics || false })]
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1F3864" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "1F3864" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [new TextRun({ text: "RFP #2026-CTY-0417  |  CONFIDENTIAL — FOR PROPOSAL PURPOSES ONLY", size: 16, color: "888888" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Page ", size: 16 }), new TextRun({ children: [PageNumber.CURRENT], size: 16 })]
        })]
      })
    },
    children: [
      // TITLE PAGE
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "REQUEST FOR PROPOSAL", bold: true, size: 48, color: "1F3864" })] }),
      new Paragraph({ spacing: { after: 400 }, children: [new TextRun({ text: "Citywide Digital Permitting & Licensing System", size: 30, color: "444444" })] }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 6240],
        rows: [
          new TableRow({ children: [bodyCell("RFP Number", 3120, {bold:true}), bodyCell("2026-CTY-0417", 6240)] }),
          new TableRow({ children: [bodyCell("Issuing Agency", 3120, {bold:true}), bodyCell("Department of Information Technology, City of Rosedale", 6240)] }),
          new TableRow({ children: [bodyCell("Issue Date", 3120, {bold:true}), bodyCell("June 15, 2026", 6240)] }),
          new TableRow({ children: [bodyCell("Proposal Due Date", 3120, {bold:true}), bodyCell("August 10, 2026, 5:00 PM Local Time", 6240)] }),
          new TableRow({ children: [bodyCell("Anticipated Contract Term", 3120, {bold:true}), bodyCell("3 years, with two 1-year renewal options", 6240)] }),
          new TableRow({ children: [bodyCell("Estimated Budget", 3120, {bold:true}), bodyCell("$850,000 - $1,200,000 (total contract value)", 6240)] }),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 1
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Introduction & Background")] }),
      para("The City of Rosedale (\u201Cthe City\u201D) is seeking proposals from qualified vendors to design, develop, implement, and maintain a cloud-based Digital Permitting & Licensing System (\u201Cthe System\u201D) to replace its legacy, paper-based permitting workflow across the Building, Planning, Fire, and Health departments."),
      para("The City currently processes approximately 14,000 permit applications per year across 6 departments and 11 permit types. The current process relies on in-person submissions, manual routing, and disconnected spreadsheets, resulting in an average permit turnaround time of 23 business days."),
      para("The City's goal is to reduce average turnaround time by 50% within the first year of go-live, while improving transparency for applicants and internal staff."),

      // SECTION 2
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Scope of Work / Deliverables")] }),
      para("Proposers must address each of the following deliverables in their technical proposal. Deliverables D1-D4 are mandatory; D5-D6 are optional value-add items."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("D1. Online Applicant Portal")] }),
      bullet("Public-facing web portal allowing citizens and contractors to submit permit applications online"),
      bullet("Document upload capability (PDF, JPG, PNG) up to 25MB per file"),
      bullet("Real-time application status tracking"),
      bullet("Mobile-responsive design (must function on iOS Safari and Android Chrome)"),
      bullet("WCAG 2.1 AA accessibility compliance"),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("D2. Internal Workflow & Review Engine")] }),
      bullet("Configurable, rules-based routing engine to direct applications to the correct reviewing department(s)"),
      bullet("Parallel and sequential review workflows (e.g., Fire and Building review concurrently; Health reviews only after Building approval)"),
      bullet("Automated SLA tracking and escalation alerts when a review exceeds department-defined time limits"),
      bullet("Role-based access control for at least 5 user role types (Applicant, Reviewer, Supervisor, Inspector, Admin)"),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("D3. Payment Processing Integration")] }),
      bullet("PCI-DSS compliant payment gateway integration for permit fees"),
      bullet("Support for credit card, ACH, and e-check payments"),
      bullet("Automated fee calculation based on permit type, project valuation, and square footage"),
      bullet("Refund processing workflow"),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("D4. Reporting & Analytics Dashboard")] }),
      bullet("Real-time dashboard for department heads showing permit volume, turnaround time, and bottlenecks"),
      bullet("Exportable reports (CSV, PDF) for monthly City Council reporting"),
      bullet("Historical data migration from existing legacy system (approx. 9 years of records, ~110,000 historical permits)"),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("D5. Mobile Inspector App (Optional)")] }),
      bullet("Native or hybrid mobile app for field inspectors to log inspection results offline and sync when connectivity is restored"),
      bullet("GPS tagging of inspection location"),
      bullet("Photo attachment to inspection records"),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("D6. GIS / Parcel Mapping Integration (Optional)")] }),
      bullet("Integration with the City's existing ArcGIS parcel database to auto-populate property information on application submission"),

      // SECTION 3
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Technical Requirements")] }),
      numbered("System must be cloud-hosted (SaaS or City-approved private cloud); on-premise solutions will not be considered."),
      numbered("System must provide 99.5% uptime SLA, measured monthly, excluding scheduled maintenance windows."),
      numbered("System must support Single Sign-On (SSO) via SAML 2.0 integration with the City's existing Azure AD environment."),
      numbered("All data must be encrypted at rest (AES-256) and in transit (TLS 1.2+)."),
      numbered("Vendor must provide a documented disaster recovery plan with a Recovery Time Objective (RTO) of 4 hours or less and Recovery Point Objective (RPO) of 1 hour or less."),
      numbered("System must provide a documented, versioned REST or GraphQL API for future integrations."),
      numbered("Vendor must conduct a third-party penetration test prior to go-live and annually thereafter, at vendor's expense."),
      numbered("System must be hosted on infrastructure located within the continental United States; data residency outside the U.S. is not permitted."),

      // SECTION 4
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Legal & Contractual Requirements")] }),
      numbered("Vendor must carry Commercial General Liability insurance of at least $2,000,000 per occurrence and Cyber Liability insurance of at least $5,000,000 per occurrence."),
      numbered("Vendor must agree to the City's standard indemnification clause (Attachment C) without modification."),
      numbered("Vendor must comply with the City's Data Privacy and Breach Notification Ordinance (Municipal Code \u00A7 14-220), including notification of any data breach within 24 hours of discovery."),
      numbered("Vendor must be willing to execute a Data Processing Agreement (DPA) consistent with applicable state privacy law."),
      numbered("Vendor must disclose any subcontractors who will have access to City data, and subcontractors are subject to the same security and insurance requirements."),
      numbered("Standard City payment terms are Net 45; vendor must accept these terms (no early-payment discounts will be considered as a scoring factor)."),
      numbered("Contract is subject to City Council approval and annual appropriation of funds (non-appropriation clause applies)."),
      numbered("Vendor must certify compliance with the City's Equal Employment Opportunity and Living Wage Ordinance for any locally-performed labor."),

      // SECTION 5
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Financial / Accounting Requirements")] }),
      numbered("Proposal must include a detailed, itemized cost breakdown: one-time implementation costs, recurring annual subscription/license/hosting costs, and any optional module costs (D5, D6) priced separately."),
      numbered("Vendor must provide pricing firm for the full initial 3-year term; price escalation in renewal years capped at 3% annually or CPI, whichever is lower."),
      numbered("Vendor must be registered and in good standing in the State, and able to provide a current W-9 and Certificate of Insurance within 5 business days of award."),
      numbered("Vendor must disclose annual revenue and provide 2 most recent audited financial statements or equivalent, demonstrating financial stability to support a multi-year public sector contract."),
      numbered("No payment will be made prior to acceptance testing sign-off for each deliverable milestone."),

      // SECTION 6
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Implementation Timeline")] }),
      para("Proposers must submit a project timeline. The City's target milestones are:"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4680, 4680],
        rows: [
          new TableRow({ children: [headerCell("Milestone", 4680), headerCell("Target Date", 4680)] }),
          new TableRow({ children: [bodyCell("Contract Award", 4680), bodyCell("September 2026", 4680)] }),
          new TableRow({ children: [bodyCell("Discovery & Requirements Sign-off", 4680), bodyCell("October 2026", 4680)] }),
          new TableRow({ children: [bodyCell("System Configuration & Build", 4680), bodyCell("November 2026 \u2013 February 2027", 4680)] }),
          new TableRow({ children: [bodyCell("Data Migration & UAT", 4680), bodyCell("March 2027", 4680)] }),
          new TableRow({ children: [bodyCell("Go-Live (all departments)", 4680), bodyCell("April 2027", 4680)] }),
          new TableRow({ children: [bodyCell("Post-Launch Support Period Begins", 4680), bodyCell("April 2027", 4680)] }),
        ]
      }),

      // SECTION 7
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Evaluation Criteria")] }),
      para("Proposals will be scored by an evaluation committee on a 100-point scale as follows:"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [5360, 2000, 2000],
        rows: [
          new TableRow({ children: [headerCell("Criterion", 5360), headerCell("Weight", 2000), headerCell("Max Points", 2000)] }),
          new TableRow({ children: [bodyCell("Technical Approach & Functional Fit (D1-D4)", 5360), bodyCell("35%", 2000), bodyCell("35", 2000)] }),
          new TableRow({ children: [bodyCell("Vendor Qualifications & Past Performance (3+ similar government engagements)", 5360), bodyCell("20%", 2000), bodyCell("20", 2000)] }),
          new TableRow({ children: [bodyCell("Cost / Total Cost of Ownership", 5360), bodyCell("20%", 2000), bodyCell("20", 2000)] }),
          new TableRow({ children: [bodyCell("Implementation Timeline & Project Plan Feasibility", 5360), bodyCell("10%", 2000), bodyCell("10", 2000)] }),
          new TableRow({ children: [bodyCell("Security, Data Privacy & Compliance Posture", 5360), bodyCell("10%", 2000), bodyCell("10", 2000)] }),
          new TableRow({ children: [bodyCell("Optional Value-Adds (D5, D6)", 5360), bodyCell("5%", 2000), bodyCell("5", 2000)] }),
        ]
      }),
      para("Proposals scoring below 60 total points, or below 50% on the Technical Approach criterion, will be disqualified from further consideration regardless of total score.", { after: 120, italics: true }),
      para("Note: Vendors with no prior government/public-sector contract experience are strongly discouraged from applying; lack of such experience will result in a score of 0 on the Vendor Qualifications criterion.", { italics: true }),

      // SECTION 8
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. Submission Requirements")] }),
      numbered("Proposals must be submitted electronically via the City's eProcurement portal by the deadline stated on the cover page. Late submissions will not be accepted under any circumstances."),
      numbered("Proposal must not exceed 40 pages (excluding resumes and financial statements)."),
      numbered("Proposal must include signed Attachment A (Vendor Certification), Attachment B (References \u2013 minimum 3 public-sector references), and Attachment C (Indemnification Acknowledgment)."),
      numbered("Questions regarding this RFP must be submitted in writing by July 11, 2026; answers will be published as an addendum to all registered vendors by July 18, 2026."),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("9. Reserved Rights")] }),
      para("The City reserves the right to reject any or all proposals, waive informalities, negotiate with one or more vendors, or cancel this RFP at any time without liability to the City."),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/claude/rfp-project/Dummy_RFP_2026-CTY-0417.docx", buffer);
  console.log("done");
});
