import { useState } from "react";
import { Upload, FileImage, Zap, Eye, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockResults = [
  { tooth: 14, status: "Cavity", confidence: 94 },
  { tooth: 21, status: "Healthy", confidence: 99 },
  { tooth: 24, status: "Fracture", confidence: 87 },
  { tooth: 36, status: "Healthy", confidence: 98 },
  { tooth: 38, status: "Impacted", confidence: 91 },
  { tooth: 46, status: "Cavity", confidence: 89 },
];

const statusColor: Record<string, string> = {
  Healthy: "bg-success/10 text-success border-success/20",
  Cavity: "bg-destructive/10 text-destructive border-destructive/20",
  Fracture: "bg-warning/10 text-warning border-warning/20",
  Impacted: "bg-info/10 text-info border-info/20",
};

export default function XRayAnalysis() {
  const [uploaded, setUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(false);

  const handleUpload = () => {
    setUploaded(true);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResults(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="soft-panel p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute -top-16 -right-8 h-40 w-40 rounded-full bg-[#e7f4ff] blur-3xl" />
        <div className="absolute -bottom-14 left-10 h-32 w-32 rounded-full bg-[#ffe8f4] blur-3xl" />
        <div className="relative">
          <h1 className="page-title">AI Imaging Lab</h1>
          <p className="page-subtitle">Panoramic diagnostics with anomaly scoring and explainable heatmaps.</p>
        </div>
      </div>

      {!uploaded ? (
        <Card className="border-dashed border-2 border-primary/35 bg-white/70">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#ffeef7] to-[#e9f6ff] border border-border/70 flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold">Upload Panoramic X-Ray</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Drag and drop a panoramic dental X-ray image or click to browse.
              Supported formats: DICOM, PNG, JPEG
            </p>
            <Button className="mt-6" onClick={handleUpload}>
              <FileImage className="mr-2 h-4 w-4" /> Select Image
            </Button>
          </CardContent>
        </Card>
      ) : analyzing ? (
        <Card className="soft-panel">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold">Analyzing X-Ray...</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Running Mask R-CNN tooth detection and ResNet-50 anomaly classification
            </p>
              <div className="mt-6 w-64 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#ffd9ea] to-[#caebff] rounded-full animate-pulse" style={{ width: "60%" }} />
            </div>
          </CardContent>
        </Card>
      ) : results ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => { setUploaded(false); setResults(false); }}>
              <Upload className="mr-2 h-4 w-4" /> New Upload
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
          </div>

          <Tabs defaultValue="results">
            <TabsList>
              <TabsTrigger value="results">Detection Results</TabsTrigger>
              <TabsTrigger value="heatmap">Grad-CAM Heatmap</TabsTrigger>
              <TabsTrigger value="report">Full Report</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-base">X-Ray Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-[16/9] bg-muted rounded-lg flex items-center justify-center border">
                      <div className="text-center text-muted-foreground">
                        <Eye className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Annotated panoramic X-ray</p>
                        <p className="text-xs mt-1">Teeth detected and segmented</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-base">Per-Tooth Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockResults.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center font-display font-bold text-sm">
                            #{r.tooth}
                          </div>
                          <Badge variant="outline" className={statusColor[r.status]}>
                            {r.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{r.confidence}%</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="heatmap" className="mt-4">
              <Card>
                <CardContent className="p-8">
                  <div className="aspect-[16/9] bg-muted rounded-lg flex items-center justify-center border">
                    <div className="text-center text-muted-foreground">
                      <Eye className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Grad-CAM heatmap overlay</p>
                      <p className="text-xs mt-1">Highlighting areas of concern</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="report" className="mt-4">
              <Card>
                <CardContent className="p-6 prose prose-sm max-w-none">
                  <h3 className="font-display">AI Analysis Report</h3>
                  <p className="text-muted-foreground">
                    <strong>Date:</strong> April 11, 2026 &nbsp;|&nbsp; <strong>Model:</strong> Mask R-CNN + ResNet-50
                  </p>
                  <hr />
                  <h4 className="font-display">Summary</h4>
                  <p>6 teeth successfully detected and analyzed. 3 anomalies found across teeth #14, #24, and #38.</p>
                  <h4 className="font-display">Findings</h4>
                  <ul>
                    <li><strong>Tooth #14:</strong> Cavity detected with 94% confidence. Recommend restorative treatment.</li>
                    <li><strong>Tooth #24:</strong> Possible fracture detected (87% confidence). Recommend CBCT for confirmation.</li>
                    <li><strong>Tooth #38:</strong> Impacted wisdom tooth (91% confidence). Surgical evaluation recommended.</li>
                  </ul>
                  <h4 className="font-display">Recommendation</h4>
                  <p>Schedule follow-up for teeth #14 and #24. Refer to oral surgery for tooth #38 evaluation.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}
