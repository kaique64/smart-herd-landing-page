# Use an official Python runtime as a parent image
FROM python:3.10-slim-buster

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production
ENV FLASK_RUN_HOST=0.0.0.0

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Gunicorn
RUN pip install gunicorn

# Copy the current directory contents into the container at /app
COPY . .

# Run as a non-root user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:3000", "app:app"]