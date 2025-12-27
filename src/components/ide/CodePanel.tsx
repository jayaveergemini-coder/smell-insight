import { FileCode, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface CodePanelProps {
  selectedFile: string | null;
  isAnalyzing: boolean;
  analysisStep: string | null;
}

const demoCode: Record<string, string> = {
  'frontend/src/App.tsx': `import React, { useState, useEffect } from 'react';
import { UserService } from './services/UserService';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';

// Long method detected - potential code smell
export function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({});
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await UserService.getAll();
      setUsers(data);
      // Complex conditional logic
      if (data.length > 0 && filters.active) {
        if (filters.role === 'admin') {
          setUsers(data.filter(u => u.isAdmin));
        } else if (filters.role === 'user') {
          setUsers(data.filter(u => !u.isAdmin));
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="app-container">
      <Sidebar users={users} onSelect={setSelectedUser} />
      <Dashboard user={selectedUser} loading={loading} />
    </div>
  );
}`,
  'backend/src/server.py': `from flask import Flask, jsonify, request
from models import User, Project
from routes import api_routes

app = Flask(__name__)

# Large class with multiple responsibilities - code smell
class ProjectManager:
    def __init__(self):
        self.db = DatabaseConnection()
        self.cache = CacheManager()
        self.validator = DataValidator()
        self.logger = Logger()
    
    def create_project(self, data):
        # Duplicate code pattern
        if not self.validator.validate(data):
            self.logger.error("Validation failed")
            return None
        
        project = Project(**data)
        self.db.save(project)
        self.cache.invalidate('projects')
        self.logger.info(f"Created project {project.id}")
        return project
    
    def update_project(self, id, data):
        # Duplicate code pattern
        if not self.validator.validate(data):
            self.logger.error("Validation failed")
            return None
        
        project = self.db.get(Project, id)
        project.update(**data)
        self.db.save(project)
        self.cache.invalidate('projects')
        return project

if __name__ == '__main__':
    app.run(debug=True)`,
  'ml-engine/classifier.py': `import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from feature_extractor import extract_features

class BugClassifier:
    """
    ML model for classifying potential bugs based on code smells
    """
    
    def __init__(self, model_path=None):
        self.scaler = StandardScaler()
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        if model_path:
            self.load_model(model_path)
    
    def extract_smell_features(self, code_metrics):
        """Extract features from code smell analysis"""
        features = [
            code_metrics['loc'],
            code_metrics['cyclomatic_complexity'],
            code_metrics['long_method_count'],
            code_metrics['duplicate_code_pct'],
            code_metrics['large_class_count'],
            code_metrics['deep_nesting_level']
        ]
        return np.array(features).reshape(1, -1)
    
    def predict(self, code_metrics):
        """Predict bug category from code metrics"""
        features = self.extract_smell_features(code_metrics)
        features_scaled = self.scaler.transform(features)
        prediction = self.model.predict(features_scaled)
        confidence = self.model.predict_proba(features_scaled)
        return prediction[0], max(confidence[0])`,
};

const analysisSteps = [
  { id: 'parsing', label: 'Parsing source files...', icon: FileCode },
  { id: 'detecting', label: 'Detecting code smells...', icon: Loader2 },
  { id: 'extracting', label: 'Extracting ML features...', icon: ArrowRight },
  { id: 'complete', label: 'Analysis complete', icon: CheckCircle2 },
];

export function CodePanel({ selectedFile, isAnalyzing, analysisStep }: CodePanelProps) {
  if (isAnalyzing) {
    return (
      <div className="flex-1 bg-panel rounded-lg border border-border overflow-hidden flex flex-col">
        <div className="ide-panel-header">
          <span className="text-sm font-medium">Analysis in Progress</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Running Analysis
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Processing your project files...
              </p>
            </div>

            <div className="space-y-3">
              {analysisSteps.map((step, idx) => {
                const isActive = step.id === analysisStep;
                const isComplete =
                  analysisSteps.findIndex((s) => s.id === analysisStep) > idx;
                const Icon = step.icon;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary/10 border border-primary/20'
                        : isComplete
                        ? 'bg-success/10 border border-success/20'
                        : 'bg-secondary/50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : isComplete
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${isActive ? 'animate-spin' : ''}`}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive
                          ? 'text-primary'
                          : isComplete
                          ? 'text-success'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isComplete && (
                      <CheckCircle2 className="w-4 h-4 text-success ml-auto" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedFile) {
    return (
      <div className="flex-1 bg-panel rounded-lg border border-border overflow-hidden flex flex-col">
        <div className="ide-panel-header">
          <span className="text-sm font-medium">Welcome</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-6">
              <FileCode className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Smell Aware Bug Classification
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Upload your project to analyze code smells and predict potential
              bug categories using machine learning.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {[
                {
                  step: '1',
                  title: 'Upload Project',
                  desc: 'Upload a zip file containing your project',
                },
                {
                  step: '2',
                  title: 'Analyze Smells',
                  desc: 'Detect code smells and extract features',
                },
                {
                  step: '3',
                  title: 'Classify Bugs',
                  desc: 'Get ML-based bug predictions',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-4 bg-secondary/50 rounded-lg border border-border"
                >
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center text-sm font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-medium text-foreground text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const code = demoCode[selectedFile] || '// No preview available for this file';
  const lines = code.split('\n');

  return (
    <div className="flex-1 bg-panel rounded-lg border border-border overflow-hidden flex flex-col">
      <div className="ide-panel-header">
        <span className="text-sm font-medium font-mono">{selectedFile}</span>
        <span className="text-xs text-muted-foreground">Read-only</span>
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin">
        <div className="code-block p-4">
          <table className="w-full">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-primary/5">
                  <td className="pr-4 text-line-number select-none text-right w-12 align-top">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre text-foreground">{line}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
