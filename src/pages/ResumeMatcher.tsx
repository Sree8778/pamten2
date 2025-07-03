
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Search, Upload, Sparkles, CheckCircle, AlertTriangle, Target } from 'lucide-react';

const ResumeMatcher = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysisResult({
        matchScore: 78,
        strengths: [
          'Strong technical skills match (JavaScript, React, Python)',
          'Relevant experience in software development',
          'Educational background aligns with requirements'
        ],
        improvements: [
          'Add experience with cloud platforms (AWS, Azure)',
          'Include more specific project examples',
          'Highlight leadership and team collaboration skills'
        ],
        keywords: {
          matched: ['JavaScript', 'React', 'Python', 'Git', 'Agile'],
          missing: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Testing']
        }
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            AI Resume Matcher
          </h1>
          <p className="text-gray-600 text-lg">Analyze how well your resume matches job requirements</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Job Description Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="text-blue-500" size={20} />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label>Paste the job description you're applying for</Label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here..."
                rows={12}
                className="mt-2"
              />
            </CardContent>
          </Card>

          {/* Resume Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="text-green-500" size={20} />
                Your Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label>Paste your resume content or upload a file</Label>
              <Textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your resume content here..."
                rows={12}
                className="mt-2"
              />
              <Button variant="outline" className="mt-3">
                <Upload size={16} className="mr-2" />
                Upload PDF/Word
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Analyze Button */}
        <div className="text-center mb-8">
          <Button 
            onClick={handleAnalyze}
            disabled={!jobDescription || !resume || isAnalyzing}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="mr-2 animate-spin" size={20} />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="mr-2" size={20} />
                Analyze Match
              </>
            )}
          </Button>
        </div>

        {/* Loading State */}
        {isAnalyzing && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <Sparkles className="mx-auto text-purple-500" size={48} />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI is analyzing your match...</h3>
                <Progress value={65} className="w-full max-w-md mx-auto" />
                <p className="text-gray-600 text-sm mt-2">Processing keywords, skills, and requirements</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysisResult && !isAnalyzing && (
          <div className="space-y-6">
            {/* Match Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="text-purple-500" size={20} />
                  Overall Match Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-6xl font-bold text-purple-600 mb-2">
                    {analysisResult.matchScore}%
                  </div>
                  <Progress value={analysisResult.matchScore} className="w-full max-w-md mx-auto mb-4" />
                  <p className="text-gray-600">
                    {analysisResult.matchScore >= 80 ? 'Excellent match!' : 
                     analysisResult.matchScore >= 60 ? 'Good match with room for improvement' : 
                     'Needs significant improvement'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={20} />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysisResult.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="text-green-500 mt-0.5" size={16} />
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Improvements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle size={20} />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysisResult.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="text-orange-500 mt-0.5" size={16} />
                        <span className="text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Keywords Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Keywords Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3">Matched Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keywords.matched.map((keyword, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 mb-3">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keywords.missing.map((keyword, index) => (
                        <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Optimize Resume
              </Button>
              <Button variant="outline">
                Download Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeMatcher;
