import { useRef, useState } from 'react'
import { useApp } from '../hooks/useAppState'
import './DataManage.css'

export function DataManage() {
  const { exportData, importData } = useApp()
  const inputRef = useRef<HTMLInputElement>(null)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null,
  )

  const showFeedback = (type: 'ok' | 'err', text: string) => {
    setFeedback({ type, text })
    window.setTimeout(() => setFeedback(null), 3200)
  }

  const handleExport = () => {
    exportData()
    showFeedback('ok', '备份已下载')
  }

  const handleImportClick = () => {
    inputRef.current?.click()
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!window.confirm('导入将覆盖当前所有数据，是否继续？')) return

    try {
      await importData(file)
      showFeedback('ok', '数据导入成功')
    } catch (err) {
      showFeedback('err', err instanceof Error ? err.message : '导入失败')
    }
  }

  return (
    <div className="data-manage">
      <div className="data-manage-actions">
        <button type="button" className="data-manage-btn" onClick={handleExport}>
          导出
        </button>
        <button type="button" className="data-manage-btn" onClick={handleImportClick}>
          导入
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="data-manage-input"
          onChange={handleImport}
        />
      </div>
      {feedback && (
        <p className={`data-manage-feedback data-manage-feedback--${feedback.type}`}>
          {feedback.text}
        </p>
      )}
    </div>
  )
}
