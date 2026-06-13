"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Download, ChevronRight, ChevronLeft, Check, AlertTriangle, FileSpreadsheet } from "lucide-react";

export interface ColumnMapping {
  source: string;
  target: string;
}

export interface ImportWizardProps {
  title: string;
  description: string;
  requiredFields: string[];
  optionalFields: { key: string; label: string }[];
  templateHeaders: string;
  templateRow: string;
  onImport: (rows: Record<string, string>[], options: { mergeDuplicates: boolean; defaultStatus?: string }) => Promise<{
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
    status?: string;
    message?: string;
  }>;
  onClose: () => void;
}

export default function BulkImportWizard({
  title,
  description,
  requiredFields,
  optionalFields,
  templateHeaders,
  templateRow,
  onImport,
  onClose,
}: ImportWizardProps) {
  const [step, setStep] = useState(1);
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [mergeDuplicates, setMergeDuplicates] = useState(true);
  const [defaultStatus, setDefaultStatus] = useState("new_lead");
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; updated: number; skipped: number; errors: string[] } | null>(null);

  const allTargetFields = [
    ...requiredFields.map((k) => ({ key: k, label: k, required: true })),
    ...optionalFields.map((f) => ({ key: f.key, label: f.label, required: false })),
  ];

  const parseCsv = useCallback((text: string) => {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) return null;
    const h = lines[0].split(",").map((c) => c.trim().toLowerCase().replace(/\s+/g, "_"));
    const r: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      h.forEach((col, idx) => { if (values[idx] !== undefined) row[col] = values[idx]; });
      r.push(row);
    }
    return { headers: h, rows: r };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRawText(text);
      const parsed = parseCsv(text);
      if (parsed) {
        setHeaders(parsed.headers);
        setRows(parsed.rows.slice(0, 1000));
        const autoMap: Record<string, string> = {};
        parsed.headers.forEach((h) => {
          const match = allTargetFields.find((f) => f.key.toLowerCase() === h || f.label.toLowerCase() === h);
          if (match) autoMap[h] = match.key;
        });
        setMapping(autoMap);
        setStep(2);
      } else {
        toast.error("Invalid CSV format");
      }
    };
    reader.readAsText(file);
  };

  const handlePasteUpload = () => {
    if (!rawText.trim()) { toast.error("Paste CSV content first"); return; }
    const parsed = parseCsv(rawText);
    if (parsed) {
      setHeaders(parsed.headers);
      setRows(parsed.rows.slice(0, 1000));
      const autoMap: Record<string, string> = {};
      parsed.headers.forEach((h) => {
        const match = allTargetFields.find((f) => f.key.toLowerCase() === h || f.label.toLowerCase() === h);
        if (match) autoMap[h] = match.key;
      });
      setMapping(autoMap);
      setStep(2);
    } else {
      toast.error("Invalid CSV format");
    }
  };

  const mappedRows = rows.map((row) => {
    const out: Record<string, string> = {};
    Object.entries(mapping).forEach(([source, target]) => {
      if (target && row[source] !== undefined) out[target] = row[source];
    });
    return out;
  }).filter((r) => requiredFields.some((f) => r[f]?.trim()));

  const missingRequired = requiredFields.filter((f) => !mappedRows.some((r) => r[f]?.trim()));

  const downloadTemplate = () => {
    const blob = new Blob([templateHeaders + "\n" + templateRow], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${title.toLowerCase().replace(/\s+/g, "_")}_template.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const runImport = async () => {
    setIsImporting(true);
    try {
      const res = await onImport(mappedRows, { mergeDuplicates, defaultStatus });
      if (res.status === "queued") {
        toast.success(res.message || "Import queued for background processing");
        setResult({ created: res.created || 0, updated: res.updated || 0, skipped: res.skipped || 0, errors: res.errors || [] });
      } else {
        setResult({ created: res.created, updated: res.updated, skipped: res.skipped, errors: res.errors });
        toast.success(`Import complete: ${res.created} created, ${res.updated} updated, ${res.skipped} skipped`);
      }
      setStep(4);
    } catch (error) {
      toast.error("Import failed");
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const stepLabels = ["", "Upload", "Map & Preview", "Options", "Results"];

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title} Import Wizard</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`flex items-center gap-1 ${s <= step ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`h-6 w-6 rounded-full text-xs flex items-center justify-center border ${s === step ? "bg-primary text-primary-foreground border-primary" : s < step ? "bg-primary/20 border-primary" : "bg-muted border-input"}`}>
                  {s < step ? <Check className="h-3 w-3" /> : s}
                </div>
                {s < 4 && <div className={`h-px w-6 ${s < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-3">
              <FileSpreadsheet className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">Upload a CSV file or paste CSV content below</p>
              <Input type="file" accept=".csv" onChange={handleFileUpload} className="w-full max-w-sm mx-auto" />
              {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
            </div>
            <div className="space-y-2">
              <Label>Or paste CSV content</Label>
              <textarea
                className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                placeholder={templateHeaders + "\n" + templateRow}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePasteUpload} disabled={!rawText.trim()}>
                  <Upload className="h-4 w-4 mr-1" />Use Pasted Data
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-1" />Download Template
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">Map columns and preview data ({mappedRows.length} valid rows)</p>
            {missingRequired.length > 0 && (
              <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-2 rounded">
                <AlertTriangle className="h-4 w-4" />
                No mapped values for required fields: {missingRequired.join(", ")}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {allTargetFields.map((field) => (
                <div key={field.key} className="flex items-center gap-2">
                  <Label className={`text-xs w-32 ${field.required ? "font-semibold" : ""}`}>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <select
                    className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs"
                    value={Object.entries(mapping).find(([, v]) => v === field.key)?.[0] || ""}
                    onChange={(e) => {
                      const source = e.target.value;
                      setMapping((prev) => {
                        const next = { ...prev };
                        Object.keys(next).forEach((k) => { if (next[k] === field.key) delete next[k]; });
                        if (source) next[source] = field.key;
                        return next;
                      });
                    }}
                  >
                    <option value="">— Unmapped —</option>
                    {headers.map((h) => (<option key={h} value={h}>{h}</option>))}
                  </select>
                </div>
              ))}
            </div>
            {mappedRows.length > 0 && (
              <div className="border rounded-md overflow-auto max-h-48">
                <table className="w-full text-xs">
                  <thead className="bg-muted"><tr>{allTargetFields.map((f) => (<th key={f.key} className="px-2 py-1 text-left">{f.label}</th>))}</tr></thead>
                  <tbody>{mappedRows.slice(0, 5).map((r, i) => (<tr key={i} className="border-t">{allTargetFields.map((f) => (<td key={f.key} className="px-2 py-1 truncate max-w-[120px]">{r[f.key] || "—"}</td>))}</tr>))}</tbody>
                </table>
                {mappedRows.length > 5 && <p className="text-xs text-muted-foreground p-2">...and {mappedRows.length - 5} more rows</p>}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
              <Button size="sm" onClick={() => setStep(3)} disabled={missingRequired.length > 0}><ChevronRight className="h-4 w-4 mr-1" />Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">Import Options</p>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={mergeDuplicates} onChange={(e) => setMergeDuplicates(e.target.checked)} className="h-4 w-4" />
              <Label className="text-sm font-normal">Merge duplicates (update existing records by email/phone)</Label>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Default Status</Label>
              <select value={defaultStatus} onChange={(e) => setDefaultStatus(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="new_lead">New Lead</option>
                <option value="prospect">Prospect</option>
                <option value="active_client">Active Client</option>
                <option value="former_client">Former Client</option>
              </select>
            </div>
            <div className="bg-muted p-3 rounded-md text-sm space-y-1">
              <p><strong>Ready to import:</strong> {mappedRows.length} rows</p>
              <p className="text-muted-foreground">Duplicates will be {mergeDuplicates ? "merged" : "skipped"}.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep(2)}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
              <Button size="sm" onClick={runImport} disabled={isImporting || mappedRows.length === 0}>
                {isImporting ? "Importing..." : <>Import <ChevronRight className="h-4 w-4 ml-1" /></>}
              </Button>
            </div>
          </div>
        )}

        {step === 4 && result && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-emerald-50 p-4 rounded-lg text-center"><p className="text-2xl font-bold text-emerald-600">{result.created}</p><p className="text-xs text-emerald-700">Created</p></div>
              <div className="bg-blue-50 p-4 rounded-lg text-center"><p className="text-2xl font-bold text-blue-600">{result.updated}</p><p className="text-xs text-blue-700">Updated</p></div>
              <div className="bg-amber-50 p-4 rounded-lg text-center"><p className="text-2xl font-bold text-amber-600">{result.skipped}</p><p className="text-xs text-amber-700">Skipped</p></div>
            </div>
            {result.errors.length > 0 && (
              <div className="border rounded-md p-3 max-h-40 overflow-auto">
                <p className="text-sm font-medium mb-2">Errors ({result.errors.length})</p>
                <ul className="space-y-1">{result.errors.slice(0, 20).map((err, i) => (<li key={i} className="text-xs text-red-600">{err}</li>))}</ul>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setStep(1); setResult(null); setRawText(""); setFileName(""); }}>Import More</Button>
              <Button onClick={onClose}>Done</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
