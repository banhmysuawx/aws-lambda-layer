# AWS Lambda Layer Generator

A modern React + TypeScript web application built with Vite for easily generating AWS Lambda Layers for Python dependencies.

![AWS Lambda Layer Generator](https://img.shields.io/badge/AWS-Lambda%20Layers-orange)
![Python](https://img.shields.io/badge/Python-3.8%20|%203.9%20|%203.10%20|%203.11%20|%203.12-blue)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6)

## Overview

AWS Lambda Layers are a powerful feature that allows you to extract and package dependencies separately from your function code. This application simplifies the process of creating Python Lambda Layers by generating shell scripts that:

1. Set up the correct Python environment using pyenv
2. Install your specified libraries
3. Package everything in the AWS Lambda Layer format
4. Create a ready-to-upload zip file

## Features

- **Python Version Selection**: Choose from common Python runtimes (3.8 to 3.12) or specify a custom version
- **Dependency Management**: Easily specify Python packages in requirements.txt format
- **Script Generation**: Creates a robust shell script with error handling and clear instructions
- **Convenience Tools**: One-click copying or downloading of generated scripts
- **Detailed Instructions**: Built-in guide for using the generated scripts and deploying layers

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Modern browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/aws-lambda-layer.git
   cd aws-lambda-layer/aws-lambda-layer-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:5173`

## Using the Application

### 1. Configure Your Lambda Layer

- **Select Python Version**: Choose from the dropdown or select "Custom" for a specific version
- **Specify Libraries**: Enter your required Python packages (one per line) in `requirements.txt` format:

  ```
  requests==2.32.3
  boto3==1.37.33
  pandas==2.2.0
  numpy==1.26.3
  ```

### 2. Generate Your Script

- Click the "Generate Script" button to create a shell script
- Review the generated script in the output section
- Either copy to clipboard or download the script file directly

### 3. Running the Generated Script

Prerequisites for running the script:

- [pyenv](https://github.com/pyenv/pyenv) installed on your system
- Bash shell environment (Linux, macOS, or WSL for Windows)
- AWS CLI configured with appropriate permissions (for deployment)

Steps:

1. Save the script as `lambda_layer.sh`
2. Make it executable:

   ```bash
   chmod +x lambda_layer.sh
   ```

3. Run the script:

   ```bash
   ./lambda_layer.sh
   ```

4. The script will:
   - Check for and install the specified Python version via pyenv
   - Create a virtual environment with that Python version
   - Install all specified dependencies
   - Package everything in the correct Lambda Layer structure
   - Create a zip file ready for AWS deployment

### 4. Deploying Your Lambda Layer

Once the script has run successfully, you'll have a zip file in the `lambda_layer_build` directory.

Deploy using AWS CLI:

```bash
aws lambda publish-layer-version \
  --layer-name my-python-layer \
  --description "Python libraries for my Lambda function" \
  --zip-file fileb://lambda_layer_build/python-layer-312.zip \
  --compatible-runtimes python3.12
```

Or upload through the AWS Management Console:

1. Go to AWS Lambda in the AWS Console
2. Navigate to "Layers" in the left sidebar
3. Click "Create layer"
4. Upload the zip file and set compatible runtimes

## Security Considerations

- **Review Generated Scripts**: Always verify the contents of generated scripts before execution
- **AWS Credentials**: Avoid hardcoding AWS credentials; use environment variables or IAM roles
- **Dependency Versions**: Pin dependencies to specific versions for reproducibility
- **Script Execution**: Only run scripts from trusted sources on your system

## Troubleshooting

### Common Issues

1. **Python Version Not Available**:
   - The script will show available versions if your requested version doesn't exist in pyenv
   - Try a different minor or patch version

2. **Virtual Environment Activation Failure**:
   - The script includes fallback activation methods
   - Check pyenv installation if persistent issues occur

3. **Package Installation Errors**:
   - Verify package names and versions in your requirements list
   - Some packages may have system dependencies that need to be installed separately

4. **Deployment Size Limitations**:
   - AWS Lambda Layers have a size limit (250 MB expanded)
   - Large dependencies like numpy+pandas may approach this limit

## Development

Built with:

- React 19.0.0
- TypeScript 5.7.2
- Vite 6.2.0

To build for production:

```bash
npm run build
```

## License

[MIT License](LICENSE)
