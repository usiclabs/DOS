"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface DataExportProps {
  data: any[]
  filename: string
  type: "pools" | "portfolio" | "analytics"
}

export function DataExport({ data, filename, type }: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const exportToJSON = () => {
    setIsExporting(true)
    try {
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${filename}-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: `${data.length} records exported to JSON`,
      })
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const exportToCSV = () => {
    setIsExporting(true)
    try {
      if (data.length === 0) {
        throw new Error("No data to export")
      }

      const headers = Object.keys(data[0])
      const csvRows = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header]
              return typeof value === "string" && value.includes(",") ? `"${value}"` : value
            })
            .join(","),
        ),
      ]

      const csvString = csvRows.join("\n")
      const blob = new Blob([csvString], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${filename}-${Date.now()}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: `${data.length} records exported to CSV`,
      })
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>Choose a format to export {data.length} records</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button onClick={exportToJSON} disabled={isExporting} className="w-full justify-start">
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileJson className="h-4 w-4 mr-2" />}
            Export as JSON
          </Button>
          <Button
            onClick={exportToCSV}
            disabled={isExporting}
            className="w-full justify-start bg-transparent"
            variant="outline"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 mr-2" />
            )}
            Export as CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
