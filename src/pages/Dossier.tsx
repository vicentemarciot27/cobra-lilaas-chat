"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Search,
  Scale,
  AlertTriangle,
  Building2,
  Home,
  CheckCircle2,
  MessageSquare,
  Brain,
  Download,
  Mail,
  Loader2,
  FileText,
  Phone,
  X,
  Sparkles,
  TrendingUp,
  User,
  Upload,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useData } from "@/contexts/DataContext"
import { toast } from "sonner"
import jsPDF from "jspdf"
import { useNavigate } from "react-router-dom"
import { CsvImporter } from "@/components/CsvImporter"
type InvestigationStepStatus = "pending" | "loading" | "completed" | "warning" | "not_found"

type InvestigationStep = {
  id: string
  label: string
  status: InvestigationStepStatus
  result?: string
  delay: number
}

type InvestigationData = {
  judicialProcesses: Array<{ type: string; court: string; value: number; status: string }>
  protests: Array<{ date: string; value: number; creditor: string }>
  companies: Array<{ name: string; cnpj: string; ownership: number }>
  realEstate: Array<{ address: string; value: number }>
  vehicles: Array<{ brand: string; model: string; year: number; value: number }>
  socialMedia: Array<{ platform: string; post: string; estimatedValue: number }>
  totalWealth: number
  totalDebts: number
  hasConfusaoPatrimonial: boolean
  riskScore: number
}

export default function Dossier({ debtorId = "1" }: { debtorId?: string }) {
  const router = useNavigate()
  const { debtors, installments, addInstallment } = useData()

  const [isInvestigating, setIsInvestigating] = useState(false)
  const [investigationComplete, setInvestigationComplete] = useState(false)
  const [showInvestigationModal, setShowInvestigationModal] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [investigationData, setInvestigationData] = useState<InvestigationData | null>(null)

  const debtor = debtors.find((d) => d.id === debtorId)
  const debtorInstallments = installments.filter((i) => i.debtor_id === debtorId)
  const overdueInstallments = debtorInstallments.filter((i) => i.status === "overdue")
  const totalOwed = overdueInstallments.reduce((sum, i) => sum + i.value, 0)

  const handleImportInstallments = async (data: Record<string, unknown>[]) => {
    if (!debtor) return;
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const row of data) {
        try {
          // Validar campos obrigatórios
          const dueDateStr = String(row.due_date || '').trim();
          const valueStr = String(row.value || '').trim();
          const statusStr = String(row.status || '').trim().toLowerCase();
          
          // Verificar se os campos obrigatórios existem
          if (!dueDateStr || !valueStr || !statusStr) {
            errorCount++;
            continue;
          }
          
          // Converter data para formato ISO
          let dueDate: Date;
          try {
            // Tentar detectar formato de data
            if (dueDateStr.includes('/')) {
              // Formato BR: DD/MM/YYYY
              const [day, month, year] = dueDateStr.split('/').map(Number);
              dueDate = new Date(year, month - 1, day);
            } else if (dueDateStr.includes('-')) {
              // Formato ISO: YYYY-MM-DD
              dueDate = new Date(dueDateStr);
            } else {
              throw new Error('Formato de data inválido');
            }
            
            if (isNaN(dueDate.getTime())) {
              throw new Error('Data inválida');
            }
          } catch (err) {
            errorCount++;
            continue;
          }
          
          // Converter valor para número
          const value = parseFloat(valueStr.replace(/[^\d.,]/g, '').replace(',', '.'));
          if (isNaN(value) || value <= 0) {
            errorCount++;
            continue;
          }
          
          // Validar status
          const validStatus = ['paid', 'overdue', 'renegotiated', 'future'];
          const status = validStatus.find(s => statusStr.includes(s)) || 'overdue';
          
          // Processar data de pagamento (opcional)
          let paymentDate: string | null = null;
          if (row.payment_date) {
            const paymentDateStr = String(row.payment_date).trim();
            if (paymentDateStr) {
              try {
                let paymentDateObj: Date;
                if (paymentDateStr.includes('/')) {
                  const [day, month, year] = paymentDateStr.split('/').map(Number);
                  paymentDateObj = new Date(year, month - 1, day);
                } else if (paymentDateStr.includes('-')) {
                  paymentDateObj = new Date(paymentDateStr);
                } else {
                  throw new Error('Formato de data inválido');
                }
                
                if (!isNaN(paymentDateObj.getTime())) {
                  paymentDate = paymentDateObj.toISOString();
                }
              } catch (err) {
                // Ignorar data de pagamento inválida
              }
            }
          }
          
          // Criar nova parcela
          await addInstallment({
            debtor_id: debtorId,
            due_date: dueDate.toISOString(),
            value,
            status: status as 'paid' | 'renegotiated' | 'overdue' | 'future',
            payment_date: paymentDate,
          });
          
          successCount++;
        } catch (err) {
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} parcela(s) importada(s) com sucesso!`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} parcela(s) com erro(s) de importação.`);
      }
    } catch (error) {
      toast.error('Erro ao importar parcelas do CSV');
    }
  };

  const initialSteps: InvestigationStep[] = [
    { id: "basic", label: "Validação de dados cadastrais", status: "pending", delay: 600 },
    { id: "judicial", label: "Processos judiciais (Tribunais)", status: "pending", delay: 900 },
    { id: "protests", label: "Protestos em cartório", status: "pending", delay: 800 },
    { id: "debts", label: "Dívidas ativas (Receita Federal)", status: "pending", delay: 700 },
    { id: "companies", label: "Quadro societário (Jusfy)", status: "pending", delay: 1000 },
    { id: "assets", label: "Patrimônio (Imóveis e Veículos)", status: "pending", delay: 900 },
    { id: "social", label: "Monitoramento de mídias sociais", status: "pending", delay: 800 },
  ]

  const [investigationSteps, setInvestigationSteps] = useState<InvestigationStep[]>(initialSteps)

  const runInvestigation = async () => {
    if (!debtor) return

    setIsInvestigating(true)
    setInvestigationComplete(false)

    setInvestigationSteps((prev) => prev.map((step) => ({ ...step, status: "pending" as const })))

    for (let i = 0; i < investigationSteps.length; i++) {
      const step = investigationSteps[i]

      setInvestigationSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "loading" as const } : s)))

      await new Promise((resolve) => setTimeout(resolve, step.delay))

      let status: InvestigationStepStatus = "completed"
      let result = ""

      switch (step.id) {
        case "basic":
          result = "✓ Validado"
          break
        case "judicial":
          status = "warning"
          result = "⚠️ 3 processos ativos"
          break
        case "protests":
          status = "warning"
          result = "⚠️ 2 protestos (R$ 15.000)"
          break
        case "debts":
          result = "✓ Sem pendências federais"
          break
        case "companies":
          status = "warning"
          result = "⚠️ 2 empresas (confusão patrimonial)"
          break
        case "assets":
          result = "✓ 2 imóveis, 2 veículos"
          break
        case "social":
          result = "✓ 3 evidências de alto padrão"
          break
      }

      setInvestigationSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status, result } : s)))
    }

    setInvestigationData({
      judicialProcesses: [
        { type: "Execução Fiscal", court: "Justiça Federal - 1ª Vara", value: 8500, status: "Em andamento" },
        {
          type: "Ação de Cobrança",
          court: "Justiça Estadual - 3ª Vara Cível",
          value: 12000,
          status: "Citação pendente",
        },
        { type: "Ação Trabalhista", court: "TRT - 2ª Região", value: 25000, status: "Audiência marcada" },
      ],
      protests: [
        { date: "2024-08-15", value: 8500, creditor: "Banco XYZ S.A." },
        { date: "2024-09-22", value: 6500, creditor: "Financeira ABC Ltda" },
      ],
      companies: [
        { name: "Alpha Serviços Ltda", cnpj: "12.345.678/0001-90", ownership: 65 },
        { name: "Beta Comércio ME", cnpj: "98.765.432/0001-10", ownership: 100 },
      ],
      realEstate: [
        { address: "Rua das Flores, 123 - Centro, São Paulo/SP", value: 650000 },
        { address: "Av. Atlântica, 456 - Copacabana, Rio de Janeiro/RJ", value: 890000 },
      ],
      vehicles: [
        { brand: "BMW", model: "X5 M Sport", year: 2022, value: 480000 },
        { brand: "Porsche", model: "Cayenne Turbo", year: 2021, value: 720000 },
      ],
      socialMedia: [
        { platform: "Instagram", post: "Resort Maldivas - 7 dias em água villa", estimatedValue: 65000 },
        { platform: "Instagram", post: "Rolex Daytona Ouro Branco", estimatedValue: 180000 },
        { platform: "Instagram", post: "Jantar D.O.M. (3 Estrelas Michelin)", estimatedValue: 4500 },
      ],
      totalWealth: 2989500,
      totalDebts: 60500,
      hasConfusaoPatrimonial: true,
      riskScore: 78,
    })

    setIsInvestigating(false)
    setInvestigationComplete(true)
    toast.success("Investigação concluída!")
  }

  const generatePDF = async () => {
    if (!debtor) return

    setIsGeneratingPdf(true)

    await new Promise((resolve) => setTimeout(resolve, 2500))

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPos = 0

    // Helper function to add header on each page
    const addHeader = () => {
      // Header background
      doc.setFillColor(94, 27, 104) // Purple color
      doc.rect(0, 0, pageWidth, 35, 'F')
      
      // Logo placeholder (you would need to convert SVG to base64 or use image)
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("lilaas.ai", 15, 20)
      
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Cobra AI - Inteligência em Cobrança", 15, 27)
      
      // Document info on the right
      doc.setFontSize(8)
      doc.setTextColor(255, 255, 255)
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`, pageWidth - 15, 15, { align: "right" })
      doc.text("Documento Confidencial", pageWidth - 15, 20, { align: "right" })
              doc.text("Powered by Jusfy", pageWidth - 15, 25, { align: "right" })
      
      // Reset text color
      doc.setTextColor(0, 0, 0)
      
      return 45 // Return starting Y position after header
    }

    // Helper function to add footer
    const addFooter = (pageNum: number) => {
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.setFont("helvetica", "italic")
      
      // Line separator
      doc.setDrawColor(200, 200, 200)
      doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20)
      
      // Footer text
      doc.text(`Lilaas Cobra AI - Dossiê Legal e Investigação Patrimonial`, pageWidth / 2, pageHeight - 15, { align: "center" })
      doc.text(`Este documento contém informações confidenciais e é protegido por sigilo profissional`, pageWidth / 2, pageHeight - 11, { align: "center" })
      doc.text(`Página ${pageNum}`, pageWidth - 15, pageHeight - 15, { align: "right" })
      
      doc.setTextColor(0, 0, 0)
    }

    // Helper function to check if new page is needed
    const checkNewPage = (spaceNeeded: number, currentPage: number) => {
      if (yPos + spaceNeeded > pageHeight - 30) {
        addFooter(currentPage)
        doc.addPage()
        currentPage++
        yPos = addHeader()
      }
      return currentPage
    }

    let currentPage = 1
    yPos = addHeader()
    yPos += 5

    // Title Box
    doc.setFillColor(240, 240, 255)
    doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, 'F')
    doc.setDrawColor(94, 27, 104)
    doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, 'S')
    
    yPos += 8
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(94, 27, 104)
    doc.text("DOSSIÊ LEGAL - INVESTIGAÇÃO PATRIMONIAL", pageWidth / 2, yPos, { align: "center" })
    yPos += 7
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Referente ao devedor: ${debtor.name.toUpperCase()}`, pageWidth / 2, yPos, { align: "center" })
    doc.setTextColor(0, 0, 0)
    yPos += 15

    // Section 1: Legal Foundation
    currentPage = checkNewPage(40, currentPage)
    
    doc.setFillColor(94, 27, 104)
    doc.rect(15, yPos, 5, 8, 'F')
    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(94, 27, 104)
    doc.text("I. FUNDAMENTO LEGAL E NORMATIVO", 22, yPos + 6)
    doc.setTextColor(0, 0, 0)
    yPos += 12

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const legalTexts = [
      "Código de Processo Civil (Lei 13.105/2015), Art. 784, X - Título executivo extrajudicial",
      "Lei 8.078/90 (Código de Defesa do Consumidor) - Proteção ao crédito e cobrança",
      "Lei 4.591/64 - Condomínios em edificações e rateio de despesas",
      "Código Civil (Lei 10.406/2002), Art. 1.336, I - Obrigação do condômino",
      "Lei 13.097/2015 - Responsabilidade civil e segurança jurídica nas transações"
    ]
    
    legalTexts.forEach(text => {
      currentPage = checkNewPage(6, currentPage)
      doc.text(text, 20, yPos, { maxWidth: pageWidth - 35 })
      yPos += 6
    })
    yPos += 8

    // Section 2: Debtor Data
    currentPage = checkNewPage(60, currentPage)
    
    doc.setFillColor(94, 27, 104)
    doc.rect(15, yPos, 5, 8, 'F')
    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(94, 27, 104)
    doc.text("II. QUALIFICAÇÃO DO DEVEDOR", 22, yPos + 6)
    doc.setTextColor(0, 0, 0)
    yPos += 14

    // Debtor info box
    doc.setFillColor(250, 250, 250)
    doc.setDrawColor(200, 200, 200)
    doc.roundedRect(15, yPos, pageWidth - 30, 45, 2, 2, 'FD')
    
    yPos += 8
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Nome Completo:", 20, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(debtor.name, 55, yPos)
    yPos += 7
    
    doc.setFont("helvetica", "bold")
    doc.text("CPF:", 20, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(debtor.cpf, 55, yPos)
    yPos += 7
    
    doc.setFont("helvetica", "bold")
    doc.text("Unidade:", 20, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(debtor.apartment, 55, yPos)
    yPos += 7
    
    doc.setFont("helvetica", "bold")
    doc.text("Telefone:", 20, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(debtor.phone || "Não informado", 55, yPos)
    yPos += 7
    
    doc.setFont("helvetica", "bold")
    doc.text("E-mail:", 20, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(debtor.email || "Não informado", 55, yPos)
    yPos += 7
    
    doc.setFont("helvetica", "bold")
    doc.text("Perfil:", 20, yPos)
    doc.setFont("helvetica", "normal")
    const profileText = debtor.profile === "good_payer" ? "Bom Pagador" : debtor.profile === "bad_payer" ? "Mau Pagador" : "Novo Cliente"
    doc.text(profileText, 55, yPos)
    yPos += 15

    // Section 3: Financial Data
    currentPage = checkNewPage(50, currentPage)
    
    doc.setFillColor(94, 27, 104)
    doc.rect(15, yPos, 5, 8, 'F')
    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(94, 27, 104)
    doc.text("III. RESUMO FINANCEIRO DA DÍVIDA", 22, yPos + 6)
    doc.setTextColor(0, 0, 0)
    yPos += 14

    // Financial summary box with highlight
    doc.setFillColor(255, 240, 240)
    doc.setDrawColor(220, 53, 69)
    doc.setLineWidth(0.5)
    doc.roundedRect(15, yPos, pageWidth - 30, 25, 2, 2, 'FD')
    
    yPos += 8
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Valor Total em Atraso:", 20, yPos)
    doc.setFontSize(16)
    doc.setTextColor(220, 53, 69)
    doc.text(`R$ ${totalOwed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, pageWidth - 20, yPos, { align: "right" })
    doc.setTextColor(0, 0, 0)
    yPos += 9
    
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Parcelas em Atraso:", 20, yPos)
    doc.setFontSize(14)
    doc.text(`${overdueInstallments.length} parcela(s)`, pageWidth - 20, yPos, { align: "right" })
    doc.setLineWidth(0.2)
    yPos += 15

    if (investigationData) {
      // Section 4: Judicial Processes
      currentPage = checkNewPage(50, currentPage)
      
      doc.setFillColor(94, 27, 104)
      doc.rect(15, yPos, 5, 8, 'F')
      doc.setFontSize(13)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(94, 27, 104)
      doc.text("IV. PROCESSOS JUDICIAIS IDENTIFICADOS", 22, yPos + 6)
      doc.setTextColor(0, 0, 0)
      yPos += 12
      
      doc.setFontSize(9)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(100, 100, 100)
      doc.text("Fonte: Jusfy - Consulta aos Tribunais de Justiça", 20, yPos)
      doc.setTextColor(0, 0, 0)
      yPos += 10

      investigationData.judicialProcesses.forEach((process, index) => {
        currentPage = checkNewPage(30, currentPage)
        
        // Process box
        doc.setFillColor(255, 250, 245)
        doc.setDrawColor(255, 140, 0)
        doc.setLineWidth(0.3)
        doc.roundedRect(15, yPos, pageWidth - 30, 22, 2, 2, 'FD')
        
        yPos += 6
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text(`${index + 1}. ${process.type}`, 20, yPos)
        yPos += 6
        
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.text(`Tribunal/Vara: ${process.court}`, 23, yPos)
        yPos += 5
        
        doc.text(`Valor da Causa: R$ ${process.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 23, yPos)
        doc.text(`Status: ${process.status}`, pageWidth - 20, yPos, { align: "right" })
        yPos += 8
      })
      yPos += 5

      // Section 5: Protests and Restrictions
      currentPage = checkNewPage(50, currentPage)
      
      doc.setFillColor(94, 27, 104)
      doc.rect(15, yPos, 5, 8, 'F')
      doc.setFontSize(13)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(94, 27, 104)
      doc.text("V. PROTESTOS E RESTRIÇÕES CREDITÍCIAS", 22, yPos + 6)
      doc.setTextColor(0, 0, 0)
      yPos += 12
      
      doc.setFontSize(9)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(100, 100, 100)
      doc.text("Fonte: Jusfy - Consulta aos Cartórios de Protesto", 20, yPos)
      doc.setTextColor(0, 0, 0)
      yPos += 10

      investigationData.protests.forEach((protest, index) => {
        currentPage = checkNewPage(25, currentPage)
        
        doc.setFillColor(255, 245, 245)
        doc.setDrawColor(220, 53, 69)
        doc.setLineWidth(0.3)
        doc.roundedRect(15, yPos, pageWidth - 30, 18, 2, 2, 'FD')
        
        yPos += 6
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text(`Protesto ${index + 1}`, 20, yPos)
        doc.setFont("helvetica", "normal")
        doc.text(`Data: ${new Date(protest.date).toLocaleDateString("pt-BR")}`, pageWidth - 20, yPos, { align: "right" })
        yPos += 6
        
        doc.setFontSize(9)
        doc.text(`Credor: ${protest.creditor}`, 23, yPos)
        yPos += 5
        
        doc.setFont("helvetica", "bold")
        doc.text(`Valor: R$ ${protest.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 23, yPos)
        yPos += 9
      })
      yPos += 5

      // Section 6: Asset Investigation
      currentPage = checkNewPage(50, currentPage)
      
      doc.setFillColor(94, 27, 104)
      doc.rect(15, yPos, 5, 8, 'F')
      doc.setFontSize(13)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(94, 27, 104)
      doc.text("VI. INVESTIGAÇÃO PATRIMONIAL", 22, yPos + 6)
      doc.setTextColor(0, 0, 0)
      yPos += 12
      
      doc.setFontSize(9)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(100, 100, 100)
      doc.text("Fonte: Jusfy - Consulta integrada aos órgãos públicos e privados", 20, yPos)
      doc.setTextColor(0, 0, 0)
      yPos += 12

      // 6.1 Corporate Structure
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(94, 27, 104)
      doc.text("6.1. Quadro Societário (Receita Federal)", 20, yPos)
      doc.setTextColor(0, 0, 0)
      yPos += 8

      investigationData.companies.forEach((company, index) => {
        currentPage = checkNewPage(25, currentPage)
        
        doc.setFillColor(245, 250, 255)
        doc.setDrawColor(70, 130, 180)
        doc.setLineWidth(0.3)
        doc.roundedRect(20, yPos, pageWidth - 40, 18, 2, 2, 'FD')
        
        yPos += 6
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text(`${index + 1}. ${company.name}`, 25, yPos)
        yPos += 5
        
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.text(`CNPJ: ${company.cnpj}`, 28, yPos)
        doc.setFont("helvetica", "bold")
        doc.text(`Participação: ${company.ownership}%`, pageWidth - 25, yPos, { align: "right" })
        yPos += 9
      })
      yPos += 8

      // 6.2 Real Estate
      currentPage = checkNewPage(50, currentPage)
      
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(94, 27, 104)
      doc.text("6.2. Bens Imóveis (Cartórios de Registro)", 20, yPos)
      doc.setTextColor(0, 0, 0)
      yPos += 8

      investigationData.realEstate.forEach((property, index) => {
        currentPage = checkNewPage(28, currentPage)
        
        doc.setFillColor(245, 255, 245)
        doc.setDrawColor(34, 139, 34)
        doc.setLineWidth(0.3)
        doc.roundedRect(20, yPos, pageWidth - 40, 20, 2, 2, 'FD')
        
        yPos += 6
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text(`Imóvel ${index + 1}`, 25, yPos)
        yPos += 5
        
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.text(`Endereço: ${property.address}`, 28, yPos, { maxWidth: pageWidth - 60 })
        yPos += 5
        
        doc.setFont("helvetica", "bold")
        doc.text(`Valor Estimado: R$ ${property.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 28, yPos)
        yPos += 10
      })
      yPos += 8

      // 6.3 Vehicles
      currentPage = checkNewPage(50, currentPage)
      
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(94, 27, 104)
      doc.text("6.3. Veículos (DETRAN)", 20, yPos)
      doc.setTextColor(0, 0, 0)
      yPos += 8

      investigationData.vehicles.forEach((vehicle, index) => {
        currentPage = checkNewPage(25, currentPage)
        
        doc.setFillColor(255, 250, 240)
        doc.setDrawColor(255, 165, 0)
        doc.setLineWidth(0.3)
        doc.roundedRect(20, yPos, pageWidth - 40, 18, 2, 2, 'FD')
        
        yPos += 6
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text(`Veículo ${index + 1}: ${vehicle.brand} ${vehicle.model}`, 25, yPos)
        yPos += 5
        
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.text(`Ano: ${vehicle.year}`, 28, yPos)
        doc.setFont("helvetica", "bold")
        doc.text(`Valor FIPE: R$ ${vehicle.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, pageWidth - 25, yPos, { align: "right" })
        yPos += 9
      })
      yPos += 10

      // Alert for Asset Mixing
      if (investigationData.hasConfusaoPatrimonial) {
        currentPage = checkNewPage(40, currentPage)
        
        // Alert box
        doc.setFillColor(255, 240, 240)
        doc.setDrawColor(220, 53, 69)
        doc.setLineWidth(0.8)
        doc.roundedRect(15, yPos, pageWidth - 30, 35, 2, 2, 'FD')
        
        yPos += 8
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(220, 53, 69)
        doc.text("ALERTA JURÍDICO: CONFUSÃO PATRIMONIAL DETECTADA", 20, yPos)
        doc.setTextColor(0, 0, 0)
        yPos += 8
        
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("Identificada mistura de patrimônios pessoal e empresarial, caracterizando", 23, yPos)
        yPos += 5
        doc.text("possível desvio de finalidade das pessoas jurídicas relacionadas.", 23, yPos)
        yPos += 1
        
        doc.setFont("helvetica", "normal")
        yPos += 5
        doc.text("Considerar pedido de desconsideração da personalidade jurídica (Art. 50 do", 23, yPos)
        yPos += 5
        doc.text("Código Civil) para responsabilização patrimonial do devedor.", 23, yPos)
        yPos += 15
      }

      // Section 7: Risk Analysis
      currentPage = checkNewPage(80, currentPage)
      
      doc.setFillColor(94, 27, 104)
      doc.rect(15, yPos, 5, 8, 'F')
      doc.setFontSize(13)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(94, 27, 104)
      doc.text("VII. ANÁLISE DE RISCO E CAPACIDADE DE PAGAMENTO", 22, yPos + 6)
      doc.setTextColor(0, 0, 0)
      yPos += 12
      
      doc.setFontSize(9)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(100, 100, 100)
      doc.text("Fonte: Jusfy - Score proprietário baseado em algoritmo de aprendizado de máquina", 20, yPos)
      doc.setTextColor(0, 0, 0)
      yPos += 12

      // Risk Score Box
      doc.setFillColor(255, 250, 245)
      doc.setDrawColor(255, 140, 0)
      doc.setLineWidth(0.5)
      doc.roundedRect(20, yPos, (pageWidth - 50) / 3, 25, 2, 2, 'FD')
      
      yPos += 7
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text("Score de Risco", 25, yPos)
      yPos += 6
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(255, 140, 0)
      doc.text(`${investigationData.riskScore}`, 25, yPos)
      doc.setFontSize(10)
      doc.text("/100", 40, yPos)
      doc.setTextColor(0, 0, 0)
      yPos -= 13

      // Total Debts Box
      const boxWidth = (pageWidth - 50) / 3
      doc.setFillColor(255, 245, 245)
      doc.setDrawColor(220, 53, 69)
      doc.setLineWidth(0.5)
      doc.roundedRect(25 + boxWidth, yPos, boxWidth, 25, 2, 2, 'FD')
      
      yPos += 7
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text("Dívidas Identificadas", 30 + boxWidth, yPos)
      yPos += 6
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(220, 53, 69)
      doc.text(`R$ ${investigationData.totalDebts.toLocaleString("pt-BR")}`, 30 + boxWidth, yPos)
      doc.setTextColor(0, 0, 0)
      yPos -= 13

      // Total Wealth Box
      doc.setFillColor(245, 255, 245)
      doc.setDrawColor(34, 139, 34)
      doc.setLineWidth(0.5)
      doc.roundedRect(30 + 2 * boxWidth, yPos, boxWidth, 25, 2, 2, 'FD')
      
      yPos += 7
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text("Patrimônio Rastreado", 35 + 2 * boxWidth, yPos)
      yPos += 6
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(34, 139, 34)
      doc.text(`R$ ${investigationData.totalWealth.toLocaleString("pt-BR")}`, 35 + 2 * boxWidth, yPos)
      doc.setTextColor(0, 0, 0)
      yPos += 20

      // Payment Capacity
      const capacityPercentage = ((investigationData.totalWealth / investigationData.totalDebts) * 100).toFixed(0)
      doc.setFillColor(240, 248, 255)
      doc.setDrawColor(70, 130, 180)
      doc.setLineWidth(0.5)
      doc.roundedRect(20, yPos, pageWidth - 40, 25, 2, 2, 'FD')
      
      yPos += 8
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.text("Capacidade de Pagamento (Patrimônio/Dívidas):", 25, yPos)
      yPos += 7
      doc.setFontSize(20)
      doc.setTextColor(70, 130, 180)
      doc.text(`${capacityPercentage}%`, pageWidth / 2, yPos, { align: "center" })
      doc.setTextColor(0, 0, 0)
      yPos += 8
      
      doc.setFontSize(8)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(100, 100, 100)
      doc.text("Patrimônio rastreável e potencialmente penhorável conforme CPC Art. 835", 25, yPos)
      doc.setTextColor(0, 0, 0)
      yPos += 15

      // Conclusion section
      currentPage = checkNewPage(40, currentPage)
      
      doc.setFillColor(94, 27, 104)
      doc.rect(15, yPos, 5, 8, 'F')
      doc.setFontSize(13)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(94, 27, 104)
      doc.text("VIII. CONCLUSÃO E RECOMENDAÇÕES", 22, yPos + 6)
      doc.setTextColor(0, 0, 0)
      yPos += 14

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const conclusionText = [
        "Com base na investigação realizada através da plataforma Jusfy e nas informações",
        "consolidadas neste dossiê, conclui-se que:",
        "",
        "1. O devedor possui capacidade patrimonial comprovada para honrar a dívida em questão;",
        "2. Foram identificados bens móveis e imóveis passíveis de penhora conforme legislação vigente;",
        "3. Existem processos judiciais e protestos que caracterizam inadimplência reiterada;",
        "4. Recomenda-se prosseguimento com as medidas judiciais cabíveis para recuperação do crédito.",
        "",
        "Este documento serve como instrumento de apoio à tomada de decisão quanto ao",
        "prosseguimento de ações de cobrança judicial ou extrajudicial."
      ]

      conclusionText.forEach(line => {
        currentPage = checkNewPage(6, currentPage)
        doc.text(line, 20, yPos, { maxWidth: pageWidth - 40 })
        yPos += 5
      })
    }

    // Add final footer
    addFooter(currentPage)

    const fileName = `Dossie_Legal_${debtor.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)

    setIsGeneratingPdf(false)
    toast.success("Dossiê legal gerado com sucesso!")
  }

  const getStepIcon = (status: InvestigationStep["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "not_found":
        return <X className="w-4 h-4 text-muted-foreground" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      paid: { variant: "outline", label: "Pago" },
      renegotiated: { variant: "default", label: "Renegociado" },
      overdue: { variant: "default", label: "Em Atraso" },
      future: { variant: "secondary", label: "Futuro" },
    }
    return variants[status] || variants.overdue
  }

  if (!debtor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Devedor não encontrado</p>
          <Button className="mt-4" onClick={() => router("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">{debtor.name}</h1>
                <p className="text-muted-foreground mt-1">
                  {debtor.apartment} • {debtor.cpf}
                </p>
              </div>
            </div>
            <Badge
              variant={
                debtor.profile === "good_payer"
                  ? "default"
                  : debtor.profile === "bad_payer"
                    ? "destructive"
                    : "secondary"
              }
              className="text-sm px-3 py-1"
            >
              {debtor.profile === "good_payer"
                ? "Bom Pagador"
                : debtor.profile === "bad_payer"
                  ? "Mau Pagador"
                  : "Novo"}
            </Badge>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2 shadow-lg border-2 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      Investigação Patrimonial
                      <Sparkles className="w-5 h-5 text-primary" />
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Análise completa via Jusfy • Processos, Bens e Empresas
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-3">
                    <img src="/jusfy.png" alt="Jusfy" width={32} height={32} />
                  <div>
                    <div className="font-semibold">Powered by Jusfy</div>
                    <div className="text-xs text-muted-foreground">Análise reputacional e crédito</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-background">
                  ✓ Conectado
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Scale className="w-4 h-4 text-muted-foreground" />
                  <span>Processos Judiciais</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>Quadro Societário</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  <span>Imóveis e Veículos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  <span>Protestos e Dívidas</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full text-base font-semibold"
                onClick={() => {
                  setShowInvestigationModal(true)
                  setTimeout(() => runInvestigation(), 500)
                }}
                disabled={isInvestigating}
              >
                {isInvestigating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Investigando...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Iniciar Investigação Completa
                  </>
                )}
              </Button>

              {investigationComplete && investigationData && (
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Última investigação:</span>
                    <span className="font-medium">{new Date().toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-lg font-bold text-destructive">
                        {investigationData.judicialProcesses.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Processos</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-lg font-bold text-primary">{investigationData.companies.length}</div>
                      <div className="text-xs text-muted-foreground">Empresas</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="text-lg font-bold">{investigationData.riskScore}</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={generatePDF}
                    disabled={isGeneratingPdf}
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Dossiê Completo
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="space-y-4 mt-4">
              {/* Profile Picture */}
              <div className="flex justify-center pb-2">
                {debtor.name === "Matheus Santoro" ? (
                  <Avatar className="w-24 h-24 ring-2 ring-primary/20">
                    <AvatarImage src="/matheus.jpeg" alt="Matheus Santoro" />
                    <AvatarFallback className="text-2xl font-semibold">MS</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="w-24 h-24 ring-2 ring-muted">
                    <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary/20 to-primary/5">
                      {debtor.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valor em Atraso</p>
                <p className="text-3xl font-bold text-primary">
                  R$ {totalOwed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Parcelas em atraso</span>
                  <span className="font-semibold">{overdueInstallments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total de parcelas</span>
                  <span className="font-semibold">{debtorInstallments.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{debtor.phone || "Não informado"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{debtor.email || "Não informado"}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button 
                  className="flex-1 min-w-[180px]" 
                  onClick={() => router(`/chat/${debtor.id}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Iniciar Conversa
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 min-w-[180px]" 
                  onClick={() => router("/knowledge")}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Base de Conhecimento
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Histórico de Parcelas</CardTitle>
            <CsvImporter
              fields={[
                { label: 'Data de Vencimento', value: 'due_date', required: true },
                { label: 'Valor', value: 'value', required: true },
                { label: 'Status', value: 'status', required: true },
                { label: 'Data de Pagamento', value: 'payment_date', required: false },
              ]}
              onImport={handleImportInstallments}
              variant="outline"
              size="sm"
              className="h-9"
            >
              <Upload className="h-4 w-4" />
              Importar CSV
            </CsvImporter>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debtorInstallments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        Nenhuma parcela encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    debtorInstallments.map((installment) => {
                      const statusInfo = getStatusBadge(installment.status)
                      return (
                        <TableRow key={installment.id}>
                          <TableCell>{new Date(new Date(installment.due_date).setDate(new Date(installment.due_date).getDate() + 1)).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}</TableCell>
                          <TableCell className="font-medium">
                            R$ {installment.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Investigation Modal */}
      <Dialog open={showInvestigationModal} onOpenChange={setShowInvestigationModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Search className="w-5 h-5" />
              Investigação Patrimonial: {debtor.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Jusfy Integration Badge */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <img src="/jusfy.png" alt="Jusfy" width={32} height={32} />
                </div>
                <div>
                  <div className="font-semibold text-sm">Powered by Jusfy</div>
                  <div className="text-xs text-muted-foreground">Análise reputacional e crédito</div>
                </div>
              </div>
              <Badge variant="outline" className="bg-background">
                ✓ Conectado
              </Badge>
            </div>

            {/* Investigation Steps */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase">Etapas da Investigação</h3>

              {investigationSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStepIcon(step.status)}
                    <span className={`font-medium ${step.status === "loading" ? "text-primary" : ""}`}>
                      {step.label}
                    </span>
                  </div>
                  {step.result && <span className="text-sm text-muted-foreground">{step.result}</span>}
                </div>
              ))}
            </div>

            {/* Results Summary */}
            {investigationComplete && investigationData && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">Resultados da Investigação</h3>

                <div className="grid grid-cols-3 gap-3">
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Processos Judiciais</div>
                    <div className="text-xl font-bold text-rose-600">{investigationData.judicialProcesses.length}</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Protestos</div>
                    <div className="text-xl font-bold text-orange-600">{investigationData.protests.length}</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Score Risco</div>
                    <div className="text-xl font-bold text-yellow-600">{investigationData.riskScore}/100</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Empresas</div>
                    <div className="text-xl font-bold text-violet-600">{investigationData.companies.length}</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Imóveis</div>
                    <div className="text-xl font-bold text-emerald-600">{investigationData.realEstate.length}</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Veículos</div>
                    <div className="text-xl font-bold text-blue-600">{investigationData.vehicles.length}</div>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-4 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800">
                    <div className="text-xs text-muted-foreground mb-1">Dívidas Identificadas</div>
                    <div className="text-lg font-bold text-rose-600">
                      R$ {investigationData.totalDebts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                  </Card>
                  <Card className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                    <div className="text-xs text-muted-foreground mb-1">Patrimônio Estimado</div>
                    <div className="text-lg font-bold text-emerald-600">
                      R$ {investigationData.totalWealth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                  </Card>
                </div>

                <Card className="p-4 bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800">
                  <div className="text-sm font-semibold mb-2">Capacidade de Pagamento</div>
                  <div className="text-2xl font-bold text-violet-600">
                    {((investigationData.totalWealth / investigationData.totalDebts) * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Patrimônio rastreável e penhorável (CPC Art. 835)
                  </div>
                </Card>

                {investigationData.hasConfusaoPatrimonial && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div className="font-semibold text-yellow-800 dark:text-yellow-400">
                        Alerta: Confusão Patrimonial
                      </div>
                    </div>
                    <div className="text-sm text-yellow-900 dark:text-yellow-300">
                      Detectada mistura de patrimônios pessoal e empresarial. Recomenda-se análise jurídica para
                      desconsideração da personalidade jurídica.
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Dados atualizados via Jusfy</span>
                  </div>
                  <div className="text-[10px] opacity-70 mt-1">{new Date().toLocaleString("pt-BR") }</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowInvestigationModal(false)} className="flex-1">
                Fechar
              </Button>
              <Button
                onClick={() => {
                  setShowInvestigationModal(false)
                  generatePDF()
                }}
                disabled={!investigationComplete || isGeneratingPdf}
                className="flex-1"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Gerar Dossiê Completo
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Generation Modal */}
      <Dialog open={isGeneratingPdf} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Gerando Dossiê Legal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
            <div className="text-center space-y-2">
              <div className="font-medium">Compilando informações...</div>
              <div className="text-sm text-muted-foreground">Gerando documento com dados da investigação Jusfy</div>
            </div>
            <Progress value={66} className="h-2" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
