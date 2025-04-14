# AWS Lambda Layer Generator - User Guide

This guide provides step-by-step instructions for using the AWS Lambda Layer Generator application to create Python dependency layers for AWS Lambda functions.

## Quick Start

1. **Access the application** in your browser at <http://localhost:5173> (when running locally)
2. **Select a Python version** from the dropdown (3.8, 3.9, 3.10, 3.11, 3.12) or choose "Custom" for specific versions
3. **Enter your Python libraries** in requirements.txt format (one per line)
4. **Click "Generate Script"** to create your shell script
5. **Copy or download** the generated script
6. **Run the script** on your local machine to create the Lambda Layer zip file

## Detailed Instructions

### Step 1: Configuring Your Lambda Layer

![Configuration Section](https://placeholder-for-screenshot.png)

- **Python Version Selection**:
  - Choose from standard Python versions (3.8 - 3.12)
  - For specific patch versions (e.g., 3.10.4), select "Custom" and enter the version number
  - The script will use pyenv to ensure the correct Python version is used

- **Library Specification**:
  - Enter each Python package in requirements.txt format:

    ```
    requests==2.32.3
    boto3==1.37.33
    numpy==1.26.3
    pandas==2.2.0
    ```

  - Always specify exact versions with `==` for better reproducibility
  - Common packages for AWS Lambda functions:
    - `boto3`: AWS SDK for Python
    - `requests`: HTTP library
    - `pandas` and `numpy`: Data processing
    - `pillow`: Image processing
    - `psycopg2-binary`: PostgreSQL connector

### Step 2: Generating the Script

- Click the "Generate Script" button
- Review the generated code
- The script includes:
  - Python version validation with pyenv
  - Automatic installation of the Python version if needed
  - Virtual environment creation
  - Package installation
  - Proper Lambda Layer structure creation
  - Zip file generation

### Step 3: Using the Generated Script

1. **Download the script**:
   - Click "Download Script" to save as `lambda_layer.sh`
   - Or copy to clipboard and save manually

2. **Prepare your environment**:
   - Ensure [pyenv](https://github.com/pyenv/pyenv) is installed
   - For macOS:

     ```bash
     brew install pyenv
     echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
     echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
     echo 'eval "$(pyenv init -)"' >> ~/.zshrc
     source ~/.zshrc
     ```

   - For Linux:

     ```bash
     curl https://pyenv.run | bash
     echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
     echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
     echo 'eval "$(pyenv init -)"' >> ~/.bashrc
     source ~/.bashrc
     ```

3. **Execute the script**:

   ```bash
   chmod +x lambda_layer.sh
   ./lambda_layer.sh
   ```

4. **Monitor the output**:
   - The script provides detailed logs of each step
   - If errors occur, the script includes helpful diagnostics

### Step 4: Deploying Your Lambda Layer

1. **Using AWS CLI**:

   ```bash
   aws lambda publish-layer-version \
     --layer-name my-python-layer \
     --description "Python dependencies for my Lambda functions" \
     --zip-file fileb://lambda_layer_build/python-layer-312.zip \
     --compatible-runtimes python3.12
   ```

2. **Using AWS Console**:
   - Navigate to Lambda > Layers > Create layer
   - Provide a name and description
   - Upload the zip file from `lambda_layer_build/python-layer-*.zip`
   - Select compatible runtimes (match the Python version used)
   - Click "Create"

3. **Attaching to Lambda Functions**:
   - When creating/editing a Lambda function, scroll to "Layers"
   - Click "Add a layer"
   - Select your custom layer and version
   - Save the function

## Advanced Usage

### Custom Python Versions

For specific patch versions or prereleases:

1. Select "Custom" in the dropdown
2. Enter the exact version (e.g., "3.9.7", "3.11.0b2")
3. The script will attempt to install this specific version via pyenv

### Layer Size Optimization

Lambda Layers have a 250MB expanded size limit:

- Only include necessary dependencies
- Consider splitting large dependencies across multiple layers
- Remove unnecessary files with a command like:

  ```bash
  # Add this to your script before creating the zip
  find python -name "__pycache__" -type d -exec rm -rf {} +
  find python -name "*.pyc" -delete
  find python -name "*.pyo" -delete
  find python -name "tests" -type d -exec rm -rf {} +
  ```

### Troubleshooting Common Issues

1. **pyenv not found**:
   - Ensure pyenv is installed and properly initialized in your shell
   - Check PATH environment variable includes pyenv

2. **Python version installation fails**:
   - Some Python versions require additional system dependencies
   - On Ubuntu/Debian: `sudo apt-get install -y make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev xz-utils tk-dev libffi-dev liblzma-dev python3-openssl git`
   - On macOS: `brew install openssl readline sqlite3 xz zlib tcl-tk`

3. **Package installation errors**:
   - Some packages require compilation and system dependencies
   - For numpy/pandas, consider using pre-compiled versions: `pip install --only-binary=:all: numpy pandas`

## Security Considerations

- Always review the script before execution
- Never include sensitive information in your Lambda Layers
- Keep your layers updated to address security vulnerabilities
- Use the principle of least privilege when setting up IAM permissions for layer deployment

## Resources

- [AWS Lambda Layers Documentation](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html)
- [pyenv Installation Guide](https://github.com/pyenv/pyenv#installation)
- [AWS CLI Configuration Guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)
