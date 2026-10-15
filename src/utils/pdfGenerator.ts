import type { BriefDisciplineConfig, ClientBasicInfo } from '../types/startProject.types'

export async function generateClientDossierPdf(
  config: BriefDisciplineConfig,
  answers: Record<string, string[]>,
  clientInfo: ClientBasicInfo,
  isRTL: boolean
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  const width = 1240
  const height = 1754
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context unavailable')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#C5A059'
  ctx.fillRect(0, 0, width, 14)

  ctx.direction = isRTL ? 'rtl' : 'ltr'
  ctx.textAlign = isRTL ? 'right' : 'left'

  const margin = 70
  const contentWidth = width - margin * 2

  ctx.fillStyle = '#080808'
  ctx.font = 'bold 36px Changa, sans-serif'
  const brandX = isRTL ? width - margin : margin
  ctx.fillText('NOUH AGENCY', brandX, 80)

  ctx.fillStyle = '#6b7280'
  ctx.font = '16px Changa, sans-serif'
  ctx.fillText('Architectures & Technology solutions', brandX, 110)

  ctx.textAlign = isRTL ? 'left' : 'right'
  const dateX = isRTL ? margin : width - margin
  ctx.fillStyle = '#C5A059'
  ctx.font = 'bold 18px Changa, sans-serif'
  ctx.fillText(isRTL ? 'ملف العميل الرسمي' : 'OFFICIAL CLIENT DOSSIER', dateX, 80)

  const currentDate = new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  ctx.fillStyle = '#9ca3af'
  ctx.font = '15px Changa, sans-serif'
  ctx.fillText(currentDate, dateX, 110)

  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(margin, 140)
  ctx.lineTo(width - margin, 140)
  ctx.stroke()

  ctx.fillStyle = '#f9fafb'
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  ctx.fillRect(margin, 165, contentWidth, 110)
  ctx.strokeRect(margin, 165, contentWidth, 110)

  const colW = contentWidth / 4
  const infoItems = [
    { label: isRTL ? 'اسم العميل' : 'CLIENT NAME', value: clientInfo.name || '—' },
    { label: isRTL ? 'رقم الهاتف' : 'PHONE NUMBER', value: clientInfo.phone || '—' },
    { label: isRTL ? 'البريد الإلكتروني' : 'EMAIL', value: clientInfo.email || '—' },
    { label: isRTL ? 'العنوان / الموقع' : 'LOCATION', value: clientInfo.address || '—' },
  ]

  infoItems.forEach((item, index) => {
    const colX = isRTL
      ? width - margin - index * colW - 24
      : margin + index * colW + 24
    ctx.textAlign = isRTL ? 'right' : 'left'

    ctx.fillStyle = '#9ca3af'
    ctx.font = 'bold 13px Changa, sans-serif'
    ctx.fillText(item.label, colX, 205)

    ctx.fillStyle = '#111827'
    ctx.font = 'bold 19px Changa, sans-serif'
    ctx.fillText(item.value, colX, 245)
  })

  let currentY = 320

  ctx.textAlign = isRTL ? 'right' : 'left'
  ctx.fillStyle = '#C5A059'
  ctx.font = 'bold 14px Changa, sans-serif'
  ctx.fillText(isRTL ? 'القسم الرئيسي المعتمد' : 'PRIMARY DISCIPLINE', brandX, currentY)

  currentY += 32
  ctx.fillStyle = '#111827'
  ctx.font = 'bold 24px Changa, sans-serif'
  ctx.fillText(isRTL ? config.labelAr : config.label, brandX, currentY)

  currentY += 45

  ctx.fillStyle = '#f3f4f6'
  ctx.fillRect(margin, currentY, contentWidth, 44)
  ctx.strokeStyle = '#d1d5db'
  ctx.strokeRect(margin, currentY, contentWidth, 44)

  const qColW = 420
  const th1X = isRTL ? width - margin - 20 : margin + 20
  const th2X = isRTL ? width - margin - qColW - 20 : margin + qColW + 20

  ctx.fillStyle = '#374151'
  ctx.font = 'bold 15px Changa, sans-serif'
  ctx.fillText(isRTL ? 'المرحلة / السؤال' : 'QUESTION / STEP', th1X, currentY + 28)
  ctx.fillText(isRTL ? 'الخيارات المعتمدة' : 'SELECTED OPTIONS', th2X, currentY + 28)

  currentY += 44

  const maxQuestionWidth = qColW - 40
  const maxOptionsWidth = contentWidth - qColW - 40

  const filteredQuestions = config.questions.filter((q) => q.mode !== 'basic_info')

  filteredQuestions.forEach((q, idx) => {
    ctx.font = 'bold 15px Changa, sans-serif'
    const qLines = wrapText(ctx, isRTL ? q.titleAr : q.title, maxQuestionWidth)

    const qSelected = (answers[q.id] ?? []).join(' / ') || '—'
    ctx.font = 'bold 16px Changa, sans-serif'
    const optLines = wrapText(ctx, qSelected, maxOptionsWidth)

    const lineCount = Math.max(qLines.length, optLines.length)
    const lineHeight = 26
    const rowH = Math.max(56, 34 + (lineCount - 1) * lineHeight + 22)

    ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f9fafb'
    ctx.fillRect(margin, currentY, contentWidth, rowH)
    ctx.strokeStyle = '#e5e7eb'
    ctx.strokeRect(margin, currentY, contentWidth, rowH)

    ctx.fillStyle = '#4b5563'
    ctx.font = 'bold 15px Changa, sans-serif'
    qLines.forEach((line, lineIdx) => {
      ctx.fillText(line, th1X, currentY + 34 + lineIdx * lineHeight)
    })

    ctx.fillStyle = '#111827'
    ctx.font = 'bold 16px Changa, sans-serif'
    optLines.forEach((line, lineIdx) => {
      ctx.fillText(line, th2X, currentY + 34 + lineIdx * lineHeight)
    })

    currentY += rowH
  })

  if (clientInfo.note.trim()) {
    currentY += 35
    ctx.font = '15px Changa, sans-serif'
    const noteLines = wrapText(ctx, clientInfo.note, contentWidth - 40)
    const noteLineHeight = 24
    const noteBoxH = Math.max(120, 60 + noteLines.length * noteLineHeight + 20)

    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(margin, currentY, contentWidth, noteBoxH)
    ctx.strokeStyle = '#e5e7eb'
    ctx.strokeRect(margin, currentY, contentWidth, noteBoxH)

    ctx.fillStyle = '#C5A059'
    ctx.font = 'bold 14px Changa, sans-serif'
    ctx.fillText(isRTL ? 'ملاحظات العميل الإضافية' : 'ADDITIONAL CLIENT NOTES', th1X, currentY + 35)

    ctx.fillStyle = '#374151'
    ctx.font = '15px Changa, sans-serif'
    noteLines.forEach((line, lineIdx) => {
      ctx.fillText(line, th1X, currentY + 75 + lineIdx * noteLineHeight)
    })
    currentY += noteBoxH
  }

  const footerY = height - 60
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(margin, footerY)
  ctx.lineTo(width - margin, footerY)
  ctx.stroke()

  ctx.fillStyle = '#9ca3af'
  ctx.font = '13px Changa, sans-serif'
  ctx.textAlign = isRTL ? 'right' : 'left'
  ctx.fillText('NOUH AGENCY FORMS — CONFIDENTIAL CLIENT DOSSIER', brandX, footerY + 30)

  ctx.textAlign = isRTL ? 'left' : 'right'
  ctx.fillText(isRTL ? 'نظام استبيان المشاريع الهرمي' : 'HIERARCHICAL BRIEF SYSTEM', dateX, footerY + 30)

  const jpegBlob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b)
        else reject(new Error('Canvas toBlob failed'))
      },
      'image/jpeg',
      0.95
    )
  })

  const jpegBuffer = await jpegBlob.arrayBuffer()
  const jpegBytes = new Uint8Array(jpegBuffer)

  return buildPdfFromJpeg(jpegBytes, width, height)
}

function buildPdfFromJpeg(jpegBytes: Uint8Array, imgW: number, imgH: number): Blob {
  const encoder = new TextEncoder()
  const ptW = 595.28
  const ptH = 841.89

  const chunks: (Uint8Array | string)[] = []
  const offsets: number[] = [0]
  let currentOffset = 0

  function addChunk(strOrBytes: string | Uint8Array) {
    if (typeof strOrBytes === 'string') {
      const bytes = encoder.encode(strOrBytes)
      chunks.push(bytes)
      currentOffset += bytes.length
    } else {
      chunks.push(strOrBytes)
      currentOffset += strOrBytes.length
    }
  }

  addChunk('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')

  offsets.push(currentOffset)
  addChunk('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')

  offsets.push(currentOffset)
  addChunk('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')

  offsets.push(currentOffset)
  addChunk(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptW} ${ptH}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  )

  offsets.push(currentOffset)
  const imgHeader = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  addChunk(imgHeader)
  addChunk(jpegBytes)
  addChunk('\nendstream\nendobj\n')

  const contentStream = `q\n${ptW} 0 0 ${ptH} 0 0 cm\n/Im1 Do\nQ\n`
  offsets.push(currentOffset)
  addChunk(`5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`)

  const xrefOffset = currentOffset
  let xref = `xref\n0 6\n0000000000 65535 f \n`
  for (let i = 1; i <= 5; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n'
  }
  xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  addChunk(xref)

  return new Blob(chunks as BlobPart[], { type: 'application/pdf' })
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split('\n')
  const lines: string[] = []

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim()
    if (!trimmed) {
      continue
    }

    const words = trimmed.split(/\s+/)
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }

    if (currentLine) {
      lines.push(currentLine)
    }
  }

  return lines.length > 0 ? lines : [text]
}
