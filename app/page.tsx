'use client'

/**
 * BishForgeAI - AI Prediction Validation Platform
 *
 * Orchestrates validation agents to assess reasoning, causality, and safety
 * of AI model predictions through comprehensive multi-dimensional analysis.
 */

import { useState } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Filter
} from 'lucide-react'

// Agent ID
const MANAGER_AGENT_ID = '698597247551cb7920ffe8ba'

// TypeScript Interfaces
interface CausalityAssessment {
  summary: string
  risk_level: string
  critical_issues: string[]
}

interface CommonSenseValidation {
  summary: string
  severity: string
  critical_issues: string[]
}

interface GeneralizationRisks {
  summary: string
  risk_severity: string
  critical_issues: string[]
}

interface SafetyReview {
  summary: string
  risk_level: string
  critical_issues: string[]
}

interface AnalysisResult {
  problem_understanding: string
  causality_assessment: CausalityAssessment
  common_sense_validation: CommonSenseValidation
  generalization_risks: GeneralizationRisks
  safety_review: SafetyReview
  cross_cutting_concerns: string[]
  overall_risk_assessment: string
  deployment_readiness: string
  executive_summary: string
  recommended_improvements: string[]
  required_guardrails: string[]
  human_oversight_requirements: string[]
}

interface AnalysisHistoryEntry {
  id: string
  timestamp: string
  predictionContext: string
  taskType: string
  result: AnalysisResult
  overallRisk: string
  deploymentReadiness: string
}

// Utility Functions
const getSeverityColor = (level: string): string => {
  const normalized = level.toLowerCase()
  if (normalized === 'low') return 'bg-green-500/20 text-green-400 border-green-500/30'
  if (normalized === 'medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  if (normalized === 'high') return 'bg-red-500/20 text-red-400 border-red-500/30'
  return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

const getSeverityIcon = (level: string) => {
  const normalized = level.toLowerCase()
  if (normalized === 'low') return <CheckCircle className="w-4 h-4" />
  if (normalized === 'medium') return <AlertTriangle className="w-4 h-4" />
  if (normalized === 'high') return <XCircle className="w-4 h-4" />
  return <AlertTriangle className="w-4 h-4" />
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const saveToHistory = (entry: AnalysisHistoryEntry) => {
  try {
    const history = getHistory()
    history.unshift(entry)
    // Keep only last 50 entries
    const trimmed = history.slice(0, 50)
    localStorage.setItem('bishforge_history', JSON.stringify(trimmed))
  } catch (error) {
    console.error('Failed to save to history:', error)
  }
}

const getHistory = (): AnalysisHistoryEntry[] => {
  try {
    const stored = localStorage.getItem('bishforge_history')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load history:', error)
    return []
  }
}

const deleteFromHistory = (id: string) => {
  try {
    const history = getHistory()
    const filtered = history.filter(entry => entry.id !== id)
    localStorage.setItem('bishforge_history', JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to delete from history:', error)
  }
}

// Components
const SeverityBadge = ({ level }: { level: string }) => (
  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${getSeverityColor(level)}`}>
    {getSeverityIcon(level)}
    <span className="capitalize">{level} Risk</span>
  </div>
)

const DeploymentBadge = ({ status }: { status: string }) => {
  const isReady = status.toLowerCase().includes('ready')
  const colorClass = isReady
    ? 'bg-green-500/20 text-green-400 border-green-500/30'
    : 'bg-red-500/20 text-red-400 border-red-500/30'

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${colorClass}`}>
      {isReady ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      <span>{status}</span>
    </div>
  )
}

interface CollapsibleCardProps {
  title: string
  severity?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

const CollapsibleCard = ({ title, severity, defaultOpen = false, children }: CollapsibleCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className="bg-[#262d47] border-gray-700">
      <CardHeader
        className="cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            <CardTitle className="text-lg text-white">{title}</CardTitle>
          </div>
          {severity && <SeverityBadge level={severity} />}
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  )
}

const ResultsPanel = ({ result }: { result: AnalysisResult }) => {
  return (
    <div className="space-y-4">
      {/* Problem Understanding */}
      <CollapsibleCard title="Problem Understanding" defaultOpen>
        <p className="text-gray-300 text-sm leading-relaxed">
          {result.problem_understanding}
        </p>
      </CollapsibleCard>

      {/* Causality Assessment */}
      <CollapsibleCard
        title="Causality Assessment"
        severity={result.causality_assessment.risk_level}
      >
        <div className="space-y-3">
          <p className="text-gray-300 text-sm leading-relaxed">
            {result.causality_assessment.summary}
          </p>
          {result.causality_assessment.critical_issues.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Critical Issues:</h4>
              <ul className="list-disc list-inside space-y-1">
                {result.causality_assessment.critical_issues.map((issue, idx) => (
                  <li key={idx} className="text-gray-300 text-sm">{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleCard>

      {/* Common-Sense Validation */}
      <CollapsibleCard
        title="Common-Sense Validation"
        severity={result.common_sense_validation.severity}
      >
        <div className="space-y-3">
          <p className="text-gray-300 text-sm leading-relaxed">
            {result.common_sense_validation.summary}
          </p>
          {result.common_sense_validation.critical_issues.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Critical Issues:</h4>
              <ul className="list-disc list-inside space-y-1">
                {result.common_sense_validation.critical_issues.map((issue, idx) => (
                  <li key={idx} className="text-gray-300 text-sm">{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleCard>

      {/* Generalization Risks */}
      <CollapsibleCard
        title="Generalization Risks"
        severity={result.generalization_risks.risk_severity}
      >
        <div className="space-y-3">
          <p className="text-gray-300 text-sm leading-relaxed">
            {result.generalization_risks.summary}
          </p>
          {result.generalization_risks.critical_issues.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Critical Issues:</h4>
              <ul className="list-disc list-inside space-y-1">
                {result.generalization_risks.critical_issues.map((issue, idx) => (
                  <li key={idx} className="text-gray-300 text-sm">{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleCard>

      {/* Safety Review */}
      <CollapsibleCard
        title="Safety Review"
        severity={result.safety_review.risk_level}
      >
        <div className="space-y-3">
          <p className="text-gray-300 text-sm leading-relaxed">
            {result.safety_review.summary}
          </p>
          {result.safety_review.critical_issues.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Critical Issues:</h4>
              <ul className="list-disc list-inside space-y-1">
                {result.safety_review.critical_issues.map((issue, idx) => (
                  <li key={idx} className="text-gray-300 text-sm">{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleCard>

      {/* Cross-Cutting Concerns */}
      {result.cross_cutting_concerns.length > 0 && (
        <CollapsibleCard title="Cross-Cutting Concerns">
          <ul className="list-disc list-inside space-y-1">
            {result.cross_cutting_concerns.map((concern, idx) => (
              <li key={idx} className="text-gray-300 text-sm">{concern}</li>
            ))}
          </ul>
        </CollapsibleCard>
      )}

      {/* Executive Summary */}
      <Card className="bg-[#4f8cff]/10 border-[#4f8cff]/30">
        <CardHeader>
          <CardTitle className="text-lg text-white">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-gray-300 text-sm leading-relaxed">
              {result.executive_summary}
            </p>
            <div className="flex gap-3 pt-2">
              <SeverityBadge level={result.overall_risk_assessment} />
              <DeploymentBadge status={result.deployment_readiness} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvements Panel */}
      {result.recommended_improvements.length > 0 && (
        <CollapsibleCard title="Recommended Improvements" defaultOpen>
          <ul className="list-decimal list-inside space-y-2">
            {result.recommended_improvements.map((improvement, idx) => (
              <li key={idx} className="text-gray-300 text-sm">{improvement}</li>
            ))}
          </ul>
        </CollapsibleCard>
      )}

      {/* Required Guardrails */}
      {result.required_guardrails.length > 0 && (
        <CollapsibleCard title="Required Guardrails">
          <ul className="list-disc list-inside space-y-1">
            {result.required_guardrails.map((guardrail, idx) => (
              <li key={idx} className="text-gray-300 text-sm">{guardrail}</li>
            ))}
          </ul>
        </CollapsibleCard>
      )}

      {/* Human Oversight Requirements */}
      {result.human_oversight_requirements.length > 0 && (
        <CollapsibleCard title="Human Oversight Requirements">
          <ul className="list-disc list-inside space-y-1">
            {result.human_oversight_requirements.map((requirement, idx) => (
              <li key={idx} className="text-gray-300 text-sm">{requirement}</li>
            ))}
          </ul>
        </CollapsibleCard>
      )}
    </div>
  )
}

const AnalysisDashboard = () => {
  const [formData, setFormData] = useState({
    predictionContext: '',
    inputFeatures: '',
    taskType: 'Classification'
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!formData.predictionContext.trim()) {
      setError('Please provide prediction context')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    // Construct message for the Manager agent
    const message = `Analyze this AI prediction:

Prediction Context:
${formData.predictionContext}

${formData.inputFeatures ? `Input Features:\n${formData.inputFeatures}\n\n` : ''}Task Type: ${formData.taskType}

Please provide a comprehensive validation report assessing causality, common-sense plausibility, generalization risks, and safety concerns.`

    const response = await callAIAgent(message, MANAGER_AGENT_ID)

    if (response.success && response.response.status === 'success') {
      const analysisResult = response.response.result as AnalysisResult
      setResult(analysisResult)

      // Save to history
      const historyEntry: AnalysisHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        predictionContext: formData.predictionContext,
        taskType: formData.taskType,
        result: analysisResult,
        overallRisk: analysisResult.overall_risk_assessment,
        deploymentReadiness: analysisResult.deployment_readiness
      }
      saveToHistory(historyEntry)
    } else {
      setError(response.error || 'Analysis failed. Please try again.')
    }

    setLoading(false)
  }

  const handleExportJSON = () => {
    if (!result) return

    const exportData = {
      timestamp: new Date().toISOString(),
      input: formData,
      analysis: result
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bishforge-analysis-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleNewAnalysis = () => {
    setFormData({
      predictionContext: '',
      inputFeatures: '',
      taskType: 'Classification'
    })
    setResult(null)
    setError(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <div className="space-y-6">
        <Card className="bg-[#262d47] border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">Input Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prediction Context */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prediction Context <span className="text-red-400">*</span>
              </label>
              <Textarea
                placeholder="Describe the model output, scenario, and prediction details..."
                className="bg-[#1a1f36] border-gray-600 text-white font-mono text-sm min-h-[120px]"
                value={formData.predictionContext}
                onChange={(e) => setFormData(prev => ({ ...prev, predictionContext: e.target.value }))}
                disabled={loading}
              />
            </div>

            {/* Input Features */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Input Features <span className="text-gray-500">(optional)</span>
              </label>
              <Textarea
                placeholder="List relevant variables, features, or data points..."
                className="bg-[#1a1f36] border-gray-600 text-white font-mono text-sm min-h-[120px]"
                value={formData.inputFeatures}
                onChange={(e) => setFormData(prev => ({ ...prev, inputFeatures: e.target.value }))}
                disabled={loading}
              />
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Task Type
              </label>
              <select
                className="w-full bg-[#1a1f36] border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                value={formData.taskType}
                onChange={(e) => setFormData(prev => ({ ...prev, taskType: e.target.value }))}
                disabled={loading}
              >
                <option value="Classification">Classification</option>
                <option value="Regression">Regression</option>
                <option value="Ranking">Ranking</option>
                <option value="Decision Support">Decision Support</option>
              </select>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex-1 bg-[#4f8cff] hover:bg-[#4080ef] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Prediction'
                )}
              </Button>
              {result && (
                <Button
                  onClick={handleNewAnalysis}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  New Analysis
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Panel */}
      <div className="space-y-4">
        {loading && (
          <Card className="bg-[#262d47] border-gray-700">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-[#4f8cff] animate-spin" />
                <p className="text-gray-400 text-sm">Running validation analysis...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {result && !loading && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Validation Report</h2>
              <Button
                onClick={handleExportJSON}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
            <ResultsPanel result={result} />
          </>
        )}

        {!result && !loading && (
          <Card className="bg-[#262d47] border-gray-700">
            <CardContent className="py-12">
              <div className="text-center space-y-2">
                <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto" />
                <p className="text-gray-400 text-sm">No analysis results yet</p>
                <p className="text-gray-500 text-xs">Enter prediction context and click Analyze</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

const AnalysisHistory = () => {
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterRisk, setFilterRisk] = useState<string>('all')
  const [filterTask, setFilterTask] = useState<string>('all')

  // Load history on mount
  useState(() => {
    setHistory(getHistory())
  })

  const refreshHistory = () => {
    setHistory(getHistory())
  }

  const handleDelete = (id: string) => {
    deleteFromHistory(id)
    refreshHistory()
  }

  const filteredHistory = history.filter(entry => {
    const riskMatch = filterRisk === 'all' || entry.overallRisk.toLowerCase() === filterRisk.toLowerCase()
    const taskMatch = filterTask === 'all' || entry.taskType === filterTask
    return riskMatch && taskMatch
  })

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <Card className="bg-[#262d47] border-gray-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Risk Level</label>
                <select
                  className="w-full bg-[#1a1f36] border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                >
                  <option value="all">All Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Task Type</label>
                <select
                  className="w-full bg-[#1a1f36] border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
                  value={filterTask}
                  onChange={(e) => setFilterTask(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="Classification">Classification</option>
                  <option value="Regression">Regression</option>
                  <option value="Ranking">Ranking</option>
                  <option value="Decision Support">Decision Support</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      {filteredHistory.length === 0 ? (
        <Card className="bg-[#262d47] border-gray-700">
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <Clock className="w-12 h-12 text-gray-600 mx-auto" />
              <p className="text-gray-400 text-sm">No analysis history</p>
              <p className="text-gray-500 text-xs">Your completed analyses will appear here</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((entry) => (
            <Card key={entry.id} className="bg-[#262d47] border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {expandedId === entry.id ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTimestamp(entry.timestamp)}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                        {entry.taskType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2 ml-8">
                      {entry.predictionContext}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SeverityBadge level={entry.overallRisk} />
                    <Button
                      onClick={() => handleDelete(entry.id)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedId === entry.id && (
                <CardContent className="pt-0">
                  <div className="ml-8 border-l-2 border-gray-700 pl-4">
                    <ResultsPanel result={entry.result} />
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Main Application
export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard')

  return (
    <div className="min-h-screen bg-[#1a1f36]">
      {/* Header */}
      <header className="bg-[#262d47] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4f8cff] rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">BishForgeAI</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-[#1a1f36] rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-[#4f8cff] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'history'
                      ? 'bg-[#4f8cff] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  History
                </button>
              </div>
              <div className="w-10 h-10 bg-[#4f8cff] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' ? <AnalysisDashboard /> : <AnalysisHistory />}
      </main>
    </div>
  )
}
