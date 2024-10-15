FROM python:3.10-alpine

WORKDIR /app

COPY . /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 3000

ENV FLASK_RUN_HOST=0.0.0.0

CMD ["python", "app.py"]
