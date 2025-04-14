import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [pythonVersion, setPythonVersion] = useState('3.12');
  const [customVersion, setCustomVersion] = useState('');
  const [isCustomVersion, setIsCustomVersion] = useState(false);
  const [libraries, setLibraries] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const pythonVersions = ['3.8', '3.9', '3.10', '3.11', '3.12', 'Custom'];

  const handleVersionChange = (version: string) => {
    if (version === 'Custom') {
      setIsCustomVersion(true);
      setPythonVersion(customVersion || '3.12');
    } else {
      setIsCustomVersion(false);
      setPythonVersion(version);
      setCustomVersion('');
    }
  };

  const handleCustomVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomVersion(e.target.value);
    if (isCustomVersion) {
      setPythonVersion(e.target.value);
    }
  };

  const generateCode = () => {
    // Use the effective Python version (either selected or custom)
    const effectiveVersion = isCustomVersion ? customVersion : pythonVersion;
    
    const code = `#!/bin/bash
# Lambda Layer Generator for Python ${effectiveVersion}
# Generated on: ${new Date().toLocaleString()}

# Create temporary directory
mkdir -p lambda_layer_build
cd lambda_layer_build

# Check if Python version is installed via pyenv
if ! pyenv versions | grep -q "${effectiveVersion}"; then
  echo "Python ${effectiveVersion} is not installed via pyenv. Installing now..."
  pyenv install ${effectiveVersion} || {
    echo "Failed to install Python ${effectiveVersion}. Please check if this version exists."
    echo "Available versions: $(pyenv install --list | grep -E '^\\s*[0-9]' | grep -v 'dev\\|a\\|b' | tail -5)"
    exit 1
  }
  echo "Python ${effectiveVersion} installed successfully!"
fi

# Set Python version and make sure pyenv shims are properly initialized
eval "$(pyenv init -)"
pyenv local ${effectiveVersion}
PYTHON_PATH=$(pyenv which python)
echo "Using Python: $PYTHON_PATH"

# Create requirements file
cat << EOF > requirements.txt
${libraries}
EOF

# Create and activate virtual environment using full path to python
"$PYTHON_PATH" -m venv create_layer
source create_layer/bin/activate || {
  echo "Failed to activate virtual environment. Trying alternative approach..."
  # Alternative activation method if the standard one fails
  ACTIVATE_PATH="$(pwd)/create_layer/bin/activate"
  source "$ACTIVATE_PATH" || {
    echo "Virtual environment activation failed. Exiting."
    exit 1
  }
}

# Verify we're in the virtual environment
echo "Using Python: $(which python)"

# Install dependencies with explicit paths to avoid command not found
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Create layer structure with error checking
mkdir -p python
if [ -d "create_layer/lib/" ]; then
  # Use find to locate site-packages directory
  SITE_PACKAGES=$(find create_layer/lib -name "site-packages" -type d)
  if [ -n "$SITE_PACKAGES" ]; then
    echo "Found site-packages at: $SITE_PACKAGES"
    cp -r "$SITE_PACKAGES"/* python/ || echo "Warning: Some files may not have copied properly"
  else
    echo "site-packages directory not found. Creating empty layer structure."
  fi
else
  echo "Virtual environment lib directory not found. Creating empty layer structure."
fi

# Create zip file
zip -r python-layer-${effectiveVersion.replace(/\./g, '')}.zip python

# Cleanup - avoid errors if deactivate fails
{ deactivate; } 2>/dev/null || echo "Note: Virtual environment was already deactivated or not properly activated"

cd ..
echo "Lambda layer zip created at: lambda_layer_build/python-layer-${effectiveVersion.replace('.', '')}.zip"`;
    
    setGeneratedCode(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lambda_layer.sh';
    link.click();
  };

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  return (
    <div className="app">
      <div className="app-container">
        <header>
          <h1>AWS Lambda Layer Generator</h1>
          <p className="subtitle">Generate Python Lambda Layers with your required libraries</p>
        </header>
        
        <div className="card">
          <div className="form-section">
            <h2>Configuration</h2>
            
            <div className="form-group">
              <label>Python Version:</label>
              <div className="version-selector">
                <div className="select-container">
                  <select 
                    value={isCustomVersion ? 'Custom' : pythonVersion}
                    onChange={(e) => handleVersionChange(e.target.value)}
                    className="version-select"
                  >
                    {pythonVersions.map(version => (
                      <option key={version} value={version}>{version}</option>
                    ))}
                  </select>
                </div>
                
                {isCustomVersion && (
                  <input
                    type="text"
                    className="custom-version-input"
                    placeholder="e.g., 3.12.1"
                    value={customVersion}
                    onChange={handleCustomVersionChange}
                  />
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label>Python Libraries:</label>
              <textarea
                value={libraries}
                onChange={(e) => setLibraries(e.target.value)}
                placeholder="requests==2.32.3&#10;boto3==1.34.2&#10;pandas==2.2.0&#10;numpy==1.26.3"
                rows={6}
              />
              <p className="hint">One library per line in requirements.txt format</p>
            </div>
            
            <button 
              className="generate-btn"
              onClick={generateCode}
              disabled={!(pythonVersion || (isCustomVersion && customVersion))}
            >
              Generate Script
            </button>
          </div>
        </div>
        
        <div className="card info-card">
          <div className="info-header" onClick={toggleInstructions}>
            <h2>
              <span className="info-icon">ℹ️</span> 
              Usage Instructions
              <span className={`toggle-icon ${showInstructions ? 'open' : ''}`}>▼</span>
            </h2>
          </div>
          
          {showInstructions && (
            <div className="instructions-content">
              <h3>Prerequisites</h3>
              <ul>
                <li><strong>pyenv:</strong> Make sure you have <a href="https://github.com/pyenv/pyenv" target="_blank" rel="noopener noreferrer">pyenv</a> installed to manage Python versions</li>
                <li><strong>bash:</strong> A Unix/Linux terminal or WSL for Windows users</li>
                <li><strong>AWS CLI:</strong> Configured with appropriate permissions to upload to Lambda</li>
              </ul>
              
              <h3>How to Use This Script</h3>
              <ol>
                <li>Select your desired Python version (or enter a custom one)</li>
                <li>List the Python packages you need in your Lambda layer (one per line)</li>
                <li>Click "Generate Script" to create the shell script</li>
                <li>Copy or download the script to your local machine</li>
                <li>Make the script executable: <code>chmod +x lambda_layer.sh</code></li>
                <li>Run the script: <code>./lambda_layer.sh</code></li>
              </ol>
              
              <h3>After Running the Script</h3>
              <ol>
                <li>The script will create a zip file in the <code>lambda_layer_build</code> directory</li>
                <li>Upload this zip file to AWS Lambda as a layer:
                  <pre>{`# Using AWS CLI
aws lambda publish-layer-version \\
  --layer-name my-python-layer \\
  --description "Python libraries for my Lambda function" \\
  --zip-file fileb://lambda_layer_build/python-layer-${pythonVersion.replace('.', '')}.zip \\
  --compatible-runtimes python${pythonVersion}`}</pre>
                </li>
                <li>Attach the layer to your Lambda functions through the AWS Console or CLI</li>
              </ol>
              
              <h3>Security Note</h3>
              <p>Always review the generated script before running it. Verify that it only contains the libraries you intended to include.</p>
            </div>
          )}
        </div>
        
        {generatedCode && (
          <div className="card result-card">
            <h2>Generated Shell Script</h2>
            <div className="code-output">
              <pre>{generatedCode}</pre>
            </div>
            <div className="action-buttons">
              <button 
                className={`action-btn ${copied ? 'copied' : 'copy'}`} 
                onClick={copyToClipboard}
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button 
                className="action-btn download" 
                onClick={downloadCode}
              >
                Download Script
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
