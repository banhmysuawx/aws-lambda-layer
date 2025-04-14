import json
import sys
import os

# Add the layer's Python directory to the path
sys.path.insert(0, '../lambda_layer_build/python')

# Now try to import the modules from your layer
try:
    import requests
    import boto3
    
    def lambda_handler(event, context=None):
        """Test function to verify Lambda layer dependencies."""
        # Test requests
        response = requests.get('https://httpbin.org/get')
        
        # Test boto3
        s3_client = boto3.client('s3', 
                               aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
                               aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
                               region_name=os.environ.get('AWS_REGION', 'us-east-1'))
        
        # Get list of buckets (will only work with valid credentials)
        # Uncomment to test with actual AWS credentials
        # buckets = s3_client.list_buckets()
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Successfully imported layer dependencies',
                'requests_version': requests.__version__,
                'boto3_version': boto3.__version__
            })
        }
    
    # Execute the handler when run directly
    if __name__ == "__main__":
        result = lambda_handler({})
        print(json.dumps(result, indent=2))
        
except ImportError as e:
    print(f"Error: Failed to import dependencies: {e}")
    sys.exit(1)
