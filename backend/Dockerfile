FROM python:3.10-slim

WORKDIR /app

# 安裝基礎依賴
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 安裝 Python 套件
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製程式碼
COPY . .

# 設定環境變數
ENV PYTHONUNBUFFERED=1

# 啟動命令 (預設啟動 Prefect Agent 或主程式)
CMD ["python", "flows.py"]
