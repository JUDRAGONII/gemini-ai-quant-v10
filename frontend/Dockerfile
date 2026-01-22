FROM node:18-alpine

WORKDIR /app

# 安裝依賴
COPY package.json package-lock.json* ./
RUN npm install

# 複製程式碼
COPY . .

# 啟動應用
CMD ["npm", "run", "dev"]
