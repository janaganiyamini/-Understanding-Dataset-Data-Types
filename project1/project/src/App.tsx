import { useState } from 'react';
import { Database } from 'lucide-react';
import FileUpload from './components/FileUpload';
import DatasetPreview from './components/DatasetPreview';
import AnalysisResults from './components/AnalysisResults';
import { parseCSV, DatasetRow } from './utils/csvParser';
import { analyzeDataset, DatasetAnalysis, generateReport } from './utils/dataAnalysis';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [filename, setFilename] = useState<string>('');
  const [data, setData] = useState<DatasetRow[]>([]);
  const [analysis, setAnalysis] = useState<DatasetAnalysis | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setFilename(file.name);

    try {
      const text = await file.text();
      const parsedData = parseCSV(text);
      const dataAnalysis = analyzeDataset(parsedData);

      setData(parsedData);
      setAnalysis(dataAnalysis);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please make sure it is a valid CSV file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysis || data.length === 0) return;

    const report = generateReport(filename, data, analysis);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace('.csv', '')}_analysis_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setData([]);
    setAnalysis(null);
    setFilename('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Database className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Dataset Analyzer</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your CSV dataset to get comprehensive analysis including data types,
            statistical summaries, missing values, and ML readiness assessment.
          </p>
        </header>

        {data.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            <div className="mt-8 text-center text-sm text-gray-500">
              <p className="mb-2">Try analyzing popular datasets:</p>
              <p>Titanic Dataset, Students Performance Dataset, or any CSV file</p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Upload New Dataset
              </button>
            </div>

            <DatasetPreview data={data} filename={filename} />

            {analysis && (
              <AnalysisResults
                analysis={analysis}
                onDownloadReport={handleDownloadReport}
              />
            )}
          </div>
        )}

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>Built for AI & ML Internship - Task 1: Understanding Dataset & Data Types</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
