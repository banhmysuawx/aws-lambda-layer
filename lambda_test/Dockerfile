FROM public.ecr.aws/lambda/python:3.12

# Copy function code
COPY test_function.py ${LAMBDA_TASK_ROOT}

# Copy the layer content to the Lambda layer directory
COPY python/ /opt/python/

# Set PYTHONPATH to include the layer
ENV PYTHONPATH=/opt/python

# Set the CMD to your handler
CMD [ "test_function.lambda_handler" ]