"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useData } from "@/contexts/DataContext"
import { toast } from "sonner"
import jsPDF from "jspdf"

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
  const { debtors, installments } = useData()

  const [isInvestigating, setIsInvestigating] = useState(false)
  const [investigationComplete, setInvestigationComplete] = useState(false)
  const [showInvestigationModal, setShowInvestigationModal] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [investigationData, setInvestigationData] = useState<InvestigationData | null>(null)

  const debtor = debtors.find((d) => d.id === debtorId)
  const debtorInstallments = installments.filter((i) => i.debtor_id === debtorId)
  const overdueInstallments = debtorInstallments.filter((i) => i.status === "overdue")
  const totalOwed = overdueInstallments.reduce((sum, i) => sum + i.value, 0)

  const initialSteps: InvestigationStep[] = [
    { id: "basic", label: "Validação de dados cadastrais", status: "pending", delay: 600 },
    { id: "judicial", label: "Processos judiciais (Tribunais)", status: "pending", delay: 900 },
    { id: "protests", label: "Protestos em cartório", status: "pending", delay: 800 },
    { id: "debts", label: "Dívidas ativas (Receita Federal)", status: "pending", delay: 700 },
    { id: "companies", label: "Quadro societário (Tratum)", status: "pending", delay: 1000 },
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
    let yPos = 20

    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("DOSSIE LEGAL - LILAAS COBRA AI", pageWidth / 2, yPos, { align: "center" })
    yPos += 10

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, pageWidth / 2, yPos, { align: "center" })
    yPos += 5
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text("Powered by Tratum - Analise Reputacional e Credito", pageWidth / 2, yPos, { align: "center" })
    doc.setTextColor(0, 0, 0)
    yPos += 15

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("1. FUNDAMENTO LEGAL", 15, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Codigo de Processo Civil, Art. 784, X - Titulo executivo extrajudicial", 15, yPos)
    yPos += 6
    doc.text("Lei 8.078/90 (CDC) - Cobranca de divida condominial", 15, yPos)
    yPos += 12

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("2. DADOS DO DEVEDOR", 15, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Nome: ${debtor.name}`, 15, yPos)
    yPos += 6
    doc.text(`CPF: ${debtor.cpf}`, 15, yPos)
    yPos += 6
    doc.text(`Apartamento: ${debtor.apartment}`, 15, yPos)
    yPos += 6
    doc.text(`Telefone: ${debtor.phone || "Nao informado"}`, 15, yPos)
    yPos += 6
    doc.text(`Email: ${debtor.email || "Nao informado"}`, 15, yPos)
    yPos += 12

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("3. DADOS FINANCEIROS", 15, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Valor em Aberto: R$ ${totalOwed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 15, yPos)
    yPos += 6
    doc.text(`Parcelas em Atraso: ${overdueInstallments.length}`, 15, yPos)
    yPos += 12

    if (investigationData) {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("4. PROCESSOS JUDICIAIS (TRATUM)", 15, yPos)
      yPos += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      investigationData.judicialProcesses.forEach((process) => {
        doc.text(`- ${process.type} | ${process.court}`, 20, yPos)
        yPos += 5
        doc.text(`  Valor: R$ ${process.value.toLocaleString("pt-BR")} | Status: ${process.status}`, 20, yPos)
        yPos += 5
      })
      yPos += 5

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("5. PROTESTOS E RESTRICOES", 15, yPos)
      yPos += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      investigationData.protests.forEach((protest) => {
        doc.text(
          `- Data: ${new Date(protest.date).toLocaleDateString("pt-BR")} | R$ ${protest.value.toLocaleString("pt-BR")}`,
          20,
          yPos,
        )
        yPos += 5
        doc.text(`  Credor: ${protest.creditor}`, 20, yPos)
        yPos += 5
      })
      yPos += 5

      if (yPos > 240) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("6. INVESTIGACAO PATRIMONIAL", 15, yPos)
      yPos += 8

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("6.1 Quadro Societario (Tratum):", 15, yPos)
      yPos += 6

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      investigationData.companies.forEach((company) => {
        doc.text(`- ${company.name} (${company.cnpj}) - ${company.ownership}% de participacao`, 20, yPos)
        yPos += 5
      })
      yPos += 5

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("6.2 Imoveis (Cartorio):", 15, yPos)
      yPos += 6

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      investigationData.realEstate.forEach((property) => {
        doc.text(`- ${property.address}`, 20, yPos)
        yPos += 5
        doc.text(`  Valor estimado: R$ ${property.value.toLocaleString("pt-BR")}`, 20, yPos)
        yPos += 5
      })
      yPos += 5

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("6.3 Veiculos (DETRAN):", 15, yPos)
      yPos += 6

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      investigationData.vehicles.forEach((vehicle) => {
        doc.text(`- ${vehicle.brand} ${vehicle.model} (${vehicle.year})`, 20, yPos)
        yPos += 5
        doc.text(`  Valor FIPE: R$ ${vehicle.value.toLocaleString("pt-BR")}`, 20, yPos)
        yPos += 5
      })
      yPos += 10

      if (investigationData.hasConfusaoPatrimonial) {
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(255, 0, 0)
        doc.text("ALERTA: CONFUSAO PATRIMONIAL DETECTADA", 15, yPos)
        yPos += 6
        doc.setTextColor(0, 0, 0)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.text("Detectada mistura de patrimonios pessoal e empresarial.", 15, yPos)
        yPos += 5
        doc.text("Recomenda-se desconsideracao da personalidade juridica.", 15, yPos)
        yPos += 10
      }

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("7. ANALISE DE RISCO (TRATUM)", 15, yPos)
      yPos += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Score de Risco: ${investigationData.riskScore}/100`, 15, yPos)
      yPos += 6
      doc.text(`Total de Dividas Identificadas: R$ ${investigationData.totalDebts.toLocaleString("pt-BR")}`, 15, yPos)
      yPos += 6
      doc.text(`Patrimonio Estimado Total: R$ ${investigationData.totalWealth.toLocaleString("pt-BR")}`, 15, yPos)
      yPos += 6
      doc.setFont("helvetica", "bold")
      doc.text(
        `Capacidade de Pagamento: ${((investigationData.totalWealth / investigationData.totalDebts) * 100).toFixed(0)}%`,
        15,
        yPos,
      )
      yPos += 10
    }

    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.text("Documento gerado pelo CollectAI com dados da Tratum", pageWidth / 2, 280, { align: "center" })

    const fileName = `dossier_${debtor.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)

    setIsGeneratingPdf(false)
    toast.success("Dossiê gerado! Verifique seus downloads.")
  }

  const getStepIcon = (status: InvestigationStep["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
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
      paid: { variant: "default", label: "Pago" },
      renegotiated: { variant: "default", label: "Renegociado" },
      overdue: { variant: "destructive", label: "Em Atraso" },
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
                      Análise completa via Tratum • Processos, Bens e Empresas
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-3">
                    <img src="/tratum.png" alt="Tratum" width={32} height={32} />
                  <div>
                    <div className="font-semibold">Powered by Tratum</div>
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
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valor em Atraso</p>
                <p className="text-3xl font-bold text-destructive">
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
                <Button onClick={() => toast.info("Chat feature coming soon!")}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Iniciar Conversa
                </Button>
                <Button variant="outline" onClick={() => toast.info("Knowledge base coming soon!")}>
                  <Brain className="w-4 h-4 mr-2" />
                  Base de Conhecimento
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Parcelas</CardTitle>
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
                          <TableCell>{new Date(installment.due_date).toLocaleDateString("pt-BR")}</TableCell>
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
            {/* Tratum Integration Badge */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <img src="/tratum.png" alt="Tratum" width={32} height={32} />
                </div>
                <div>
                  <div className="font-semibold text-sm">Powered by Tratum</div>
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
                    <div className="text-xl font-bold text-red-600">{investigationData.judicialProcesses.length}</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Protestos</div>
                    <div className="text-xl font-bold text-yellow-600">{investigationData.protests.length}</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Score Risco</div>
                    <div className="text-xl font-bold text-orange-600">{investigationData.riskScore}/100</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Empresas</div>
                    <div className="text-xl font-bold text-blue-600">{investigationData.companies.length}</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Imóveis</div>
                    <div className="text-xl font-bold text-green-600">{investigationData.realEstate.length}</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">Veículos</div>
                    <div className="text-xl font-bold text-purple-600">{investigationData.vehicles.length}</div>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                    <div className="text-xs text-muted-foreground mb-1">Dívidas Identificadas</div>
                    <div className="text-lg font-bold text-red-600">
                      R$ {investigationData.totalDebts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                  </Card>
                  <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <div className="text-xs text-muted-foreground mb-1">Patrimônio Estimado</div>
                    <div className="text-lg font-bold text-green-600">
                      R$ {investigationData.totalWealth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </div>
                  </Card>
                </div>

                <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-semibold mb-2">Capacidade de Pagamento</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {((investigationData.totalWealth / investigationData.totalDebts) * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Patrimônio rastreável e penhorável (CPC Art. 835)
                  </div>
                </Card>

                {investigationData.hasConfusaoPatrimonial && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <div className="font-semibold text-amber-800 dark:text-amber-400">
                        Alerta: Confusão Patrimonial
                      </div>
                    </div>
                    <div className="text-sm text-amber-900 dark:text-amber-300">
                      Detectada mistura de patrimônios pessoal e empresarial. Recomenda-se análise jurídica para
                      desconsideração da personalidade jurídica.
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Dados atualizados via Tratum</span>
                  </div>
                  <div className="text-[10px] opacity-70 mt-1">{new Date().toLocaleString("pt-BR")}</div>
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
              <div className="text-sm text-muted-foreground">Gerando documento com dados da investigação Tratum</div>
            </div>
            <Progress value={66} className="h-2" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
