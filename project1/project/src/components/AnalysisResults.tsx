import { DatasetAnalysis } from '../utils/dataAnalysis';
import { Download } from 'lucide-react';

interface AnalysisResultsProps {
  analysis: DatasetAnalysis;
  onDownloadReport: () => void;
}

export default function AnalysisResults({ analysis, onDownloadReport }: AnalysisResultsProps) {
  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Analysis Results</h2>
          <button
            onClick={onDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Data Types Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Numerical</div>
                <div className="text-2xl font-bold text-blue-900">{analysis.numericalColumns.length}</div>
                <div className="text-xs text-blue-600 mt-1">
                  {analysis.numericalColumns.slice(0, 3).join(', ')}
                  {analysis.numericalColumns.length > 3 && '...'}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Categorical</div>
                <div className="text-2xl font-bold text-green-900">{analysis.categoricalColumns.length}</div>
                <div className="text-xs text-green-600 mt-1">
                  {analysis.categoricalColumns.slice(0, 3).join(', ')}
                  {analysis.categoricalColumns.length > 3 && '...'}
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Binary</div>
                <div className="text-2xl font-bold text-orange-900">{analysis.binaryColumns.length}</div>
                <div className="text-xs text-orange-600 mt-1">
                  {analysis.binaryColumns.slice(0, 3).join(', ')}
                  {analysis.binaryColumns.length > 3 && '...'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Missing Values</h3>
            {Object.keys(analysis.missingValuesSummary).length === 0 ? (
              <div className="bg-green-50 p-4 rounded-lg text-green-700">
                No missing values detected in the dataset
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Missing Count</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(analysis.missingValuesSummary).map(([column, count]) => {
                      const percentage = ((count / analysis.rowCount) * 100).toFixed(2);
                      return (
                        <tr key={column} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{column}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{count}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{percentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Column Details</h3>
            <div className="space-y-4">
              {analysis.columns.map((col) => (
                <div key={col.name} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{col.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      col.dataType === 'numerical' ? 'bg-blue-100 text-blue-700' :
                      col.dataType === 'categorical' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {col.dataType}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Unique:</span>
                      <span className="ml-2 font-medium text-gray-900">{col.uniqueCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Missing:</span>
                      <span className="ml-2 font-medium text-gray-900">{col.nullCount}</span>
                    </div>
                    {col.dataType === 'numerical' && (
                      <>
                        <div>
                          <span className="text-gray-600">Mean:</span>
                          <span className="ml-2 font-medium text-gray-900">{col.mean?.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Std:</span>
                          <span className="ml-2 font-medium text-gray-900">{col.std?.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Min:</span>
                          <span className="ml-2 font-medium text-gray-900">{col.min?.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Max:</span>
                          <span className="ml-2 font-medium text-gray-900">{col.max?.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  {col.uniqueValues && col.uniqueValues.length > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Sample values:</span>
                      <span className="ml-2 text-gray-900">{col.uniqueValues.slice(0, 5).join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">ML Readiness Assessment</h3>
            <div className="space-y-2">
              {analysis.rowCount < 100 ? (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-800">
                  Warning: Dataset may be too small for reliable ML models ({analysis.rowCount} rows)
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-green-800">
                  Dataset size is adequate for machine learning ({analysis.rowCount} rows)
                </div>
              )}
              {Object.keys(analysis.missingValuesSummary).length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-800">
                  Note: Missing values detected. Consider data cleaning or imputation strategies.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
