

# AI 投資分析儀 V10.0 完整規格書

## 私有化部署之人工智慧投資分析系統

---

**文件編號**：SPEC-V10.0-001
**版本**：3.0.0（整合版）
**密級**：內部參考
**建立日期**：2026年2月1日
**文件狀態**：正式發布
**適用對象**：系統架構師、資料工程師、後端開發人員、維運工程師、終端用戶

---

## 版本控制紀錄

| 版本 | 日期 | 修訂人 | 修訂內容 | 核准人 |
|------|------|--------|----------|--------|
| 1.0.0 | 2025-12-01 | 系統架構師 | 初始版本，奠定系統基礎架構 | 專案經理 |
| 2.0.0 | 2026-01-15 | 系統架構師 | 整合宏觀數據擴充方案 | 技術總監 |
| 3.0.0 | 2026-02-01 | 系統架構師 | 融入NAS私有化部署規格與雙用戶需求 | 專案經理 |

---

## 第一章：系統總覽

### 1.1 文件目的與範疇

本規格書旨在完整描述 AI 投資分析儀 V10.0 系統的技術規格、功能需求、部署架構與營運規範。本文件整合了系統生命週期文檔、宏觀數據擴充方案、以及全面強化分析的核心內容，為開發團隊、維運團隊與終端用戶提供全面的參考依據。

本系統定位為私有化部署的人工智慧投資分析平台，專為有限數量的專業投資人設計，提供從數據收集、處理、分析到 AI 投資建議生成的完整解決方案。系統採用容器化架構部署於用戶自有 NAS 設備，確保數據的私密性與安全性，同時透過 AI 技術賦予用戶更精準的投資決策能力。

本規格書的適用場景涵蓋：專業投資人的個人投資分析、资产管理机构的研究辅助工具、投資教育訓練的實務平台。本系統不構成任何形式的投资建議或理财规划服務，系統輸出的分析結果與 AI 建議僅供參考，用戶應自行判斷並承擔投資風險。

### 1.2 系統願景與目標

AI 投資分析儀 V10.0 的核心願景是「讓每一位投資人都能擁有機構級的投資分析能力」。為實現這一願景，系統設定了以下具體目標。

在數據霸權維度，系統致力于建立完整、權威、及時的金融投資數據資產。透過整合全球主要市場的行情數據、宏觀經濟數據、籌碼與機構數據、以及另類數據來源，系統將為用戶提供業界最全面的數據覆蓋。特別是宏觀經濟數據的強化，將使系統能夠從全球視角分析經濟趨勢與市場脈動。

在智能分析維度，系統透過演化策略優化的遺傳演算法、深度學習驅動的自然語言處理、以及多因子量化模型，為用戶提供全方位的智能分析能力。AI 引擎能夠處理海量數據、識別隱藏模式、生成可解釋的投資建議，讓複雜的投資分析變得簡單直觀。

在隱私保護維度，系統採用私有化部署架構，所有數據儲存於用戶自有設備，不經過任何第三方伺服器。用戶的投資組合、交易紀錄、分析偏好等敏感資訊將獲得最高等級的保護，滿足專業投資人對數據安全與隱私的高度要求。

### 1.3 系統範疇界定

本系統的功能範疇涵蓋以下核心領域。

在市場行情分析領域，系統提供台股、美股、期貨等主要市場的行情數據查詢、技術指標計算、與趨勢分析功能。涵蓋的數據範圍包括：上市股票 980 檔、上櫃股票 820 檔、ETF 240 檔、美股核心標的 2,707 檔、以及主要期貨合約。

在宏觀經濟分析領域，系統提供美國、台灣、中國、日本、歐元區等主要經濟體的宏觀經濟指標追蹤與分析功能。涵蓋的指標類別包括：利率與貨幣政策、通貨膨脹、就業與勞動市場、經濟成長、消費者與企業信心、國際貿易與資本流動等，預估總指標數量超過 130 項。

在籌碼與機構分析領域，系統提供融資融券、三大法人、大額交易人、選擇權部位等籌碼數據的分析功能，以及 13F 機構持倉的追蹤與比較功能。

在 AI 投資建議領域，系統透過演化策略優化的基因組與深度學習模型，生成個股與整體市場的投資評分與建議報告。AI 分析引擎能夠結合基本面、技術面、籌碼面與宏觀面因素，提供多維度的投資評估。

本系統的功能範疇不涵蓋以下領域：即時交易下單功能、帳務管理與結算功能、客戶服務與諮詢功能、以及任何形式的投資資產管理或全權代理投資服務。

### 1.4 目標用戶與使用情境

本系統設計供兩人使用，目標用戶為具有投資經驗的專業人士。根據使用情境與需求特徵，系統識別出以下主要用戶類型。

第一類為主動投資型用戶，這類用戶積極管理投資組合，頻繁進行交易決策，對數據的即時性與分析深度有較高要求。他們通常使用系統的行情查詢、技術分析、籌碼分析等功能，並依據 AI 建議進行投資判斷。

第二類為研究型用戶，這類用戶更關注長期投資機會與基本面分析，對宏觀經濟研究與產業趨勢有深入興趣。他們通常使用系統的宏觀數據追蹤、估值分析、機構持倉比較等功能，作為投資研究的輔助工具。

無論是哪類用戶，系統都提供以下核心價值：全面的數據覆蓋、專業的分析工具、可解釋的 AI 建議、以及完善的數據安全保障。系統設計強調易用性與專業性的平衡，讓用戶能夠快速上手，同時提供足夠的深度滿足進階需求。

---

## 第二章：硬體環境規格

### 2.1 NAS 設備規格

本系統部署於 QNAP TS-h973AX-32G NAS 設備之上。該設備為 QNAP 旗下针对专业用户与小型企业设计的高性能 NAS 产品，搭载强大的硬件规格，能够支撑 Docker 容器化部署与 AI 分析运算的需求。

在处理器规格方面，TS-h973AX-32G 采用 AMD Ryzen V1500B 四核心处理器，运行频率为 2.2GHz，具备 4 核心 8 线程的运算能力。AMD Zen 架构提供了优异的单核性能与多核并行处理能力，足以应对 Docker 容器运行、数据处理脚本执行、以及轻量级 AI 推理运算的需求。与 Intel 同级处理器相比，AMD Ryzen V1500B 在功耗效率与成本效益方面具有明显优势。

在内存规格方面，设备原生配置 32GB DDR4 ECC 内存，支持 ECC（Error-Correcting Code）错误修正功能，可检测并修复内存数据损坏，提升系统稳定性与数据完整性。对于 Docker 容器运行、数据库操作、以及数据处理而言，32GB 内存提供了充足的运算空间。系统保留 8GB 内存供 NAS 基础运行，其余 24GB 分配给容器化应用与数据处理使用。

在网络规格方面，设备配置 2.5GbE 与 10GbE 双速网络接口，支持 2.5Gbps 与 10Gbps 两种传输速率。双网络接口支持链路聚合（Link Aggregation），可实现更高的聚合带宽，满足大量数据同步与高频访问的需求。此外，设备还配置 1 个 USB 3.2 Gen 2 接口与 1 个 USB 3.2 Gen 1 接口，用于外接存储设备或网络适配器。

在扩展槽位方面，TS-h973AX-32G 提供 9 个硬盘槽位，其中 4 个为 2.5 英寸 SSD 专用槽位，5 个为 3.5/2.5 英寸共用槽位。设备采用无螺丝快拆设计，方便硬盘安装与更换。此外，设备还提供 1 个 M.2 2280 PCIe Gen3 x4 插槽，可安装 NVMe SSD 进一步提升存储性能。

### 2.2 存儲架構配置

基於設備的硬體规格與系統需求，本系統採用分層存儲架構，將不同類型的數據配置於最適合的存儲介質上，以平衡效能、成本與可靠性。

第一層為 NVMe SSD 高速存儲層，配置 Intel P4510（SSDPE2KX020T801）×2 顆，採用 RAID 1 mirror 配置，提供約 2TB 的可用容量。Intel P4510 為企業級 NVMe SSD，採用 3D NAND 技術，支援 PCIe 3.1 x4 介面，順序讀取速度最高可達 3,200 MB/s，順序寫入速度最高可達 2,000 MB/s，隨機讀取 IOPS 高達 650,000，隨機寫入 IOPS 高達 45,000。此層用於部署 Docker 容器與系統資料庫，確保 API 回應速度與資料庫查詢效能。採用 RAID 1 配置確保單顆硬碟故障時數據不丟失，提供企業級的資料保護。

第二層為 SATA SSD 熱數據存儲層，配置 WD Red SA500（WDS100T1R0A）×2 顆，採用 RAID 1 mirror 配置，提供約 1TB 的可用容量。WD Red SA500 為專為 NAS 設計的 SATA SSD，採用 3D NAND 技術，支援 SATA III 6Gbps 介面，順序讀取速度最高可達 560 MB/s，順序寫入速度最高可達 530 MB/s，總寫入量（TBW）可達 600TB。此層用於存放近期熱門數據，包括最近 3 年的行情數據、近期宏觀指標、以及高頻存取的 AI 計算中間結果。RAID 1 配置提供資料保護。

第三層為 HDD 大容量冷數據存儲層，配置 Seagate IronWolf Pro（24TB）×2 顆，採用 RAID 1 mirror 配置，提供約 24TB 的可用容量。Seagate IronWolf Pro 為企業級 NAS 硬碟，採用 CMR（Conventional Magnetic Recording）傳統磁紀錄技術，轉速為 7,200 RPM，緩存為 256MB，年工作負載限制（Workload Rate Limit）為 300TB，平均故障間隔時間（MTBF）為 1,200,000 小時，五年有限保固免費附贈 Rescue 資料救援服務。此層用於存放歷史冷數據，包括 3 年以上的歷史行情數據、歸檔的宏觀指標、以及備份資料。RAID 1 配置提供資料保護與備援。

在存儲容量規劃方面，系統的存儲需求分配如下：Docker 容器與系統程式碼約 50GB、PostgreSQL 資料庫（熱數據層）約 200GB、Redis 快取（熱數據層）約 50GB、近期行情數據（熱數據層）約 300GB、歷史行情數據（冷數據層）約 8TB、宏觀數據歸檔（冷數據層）約 500GB、備份資料（冷數據層）約 10TB、AI 計算資源與向量索引（熱數據層）約 150GB。總容量需求約 19.3TB，預留 20% 安全邊界後，24TB 的可用容量足夠支撐系統未來 3-5 年的數據增長。

### 2.3 硬體可靠性設計

本系統的硬體配置充分考慮可靠性設計，確保系統的長期穩定運行。

在硬碟冗餘方面，所有存儲層均採用 RAID 1 mirror 配置，可容忍單顆硬碟故障而不造成數據丟失或服務中斷。當硬碟發生故障時，NAS 系統會發出告警，提醒用戶更換故障硬碟。更換硬碟後，RAID 陣列會自動進行重建，將數據從存活硬碟複製至新硬碟。

在熱插拔支援方面，所有硬碟槽位均支援熱插拔，意味著可以在系統運行中更換故障硬碟，無需關機中斷服務。這對於需要 24 小時運行的投資分析系統而言非常重要。

在記憶體保護方面，32GB DDR4 ECC 記憶體支援錯誤修正功能，可檢測並修復單一位元錯誤（Single-bit Error），並檢測雙一位元錯誤（Double-bit Error）。ECC 記憶體特別適合長時間運行的伺服器環境，可提升系統穩定性與數據完整性。

在網路冗餘方面，設備的雙網路接口支援網路 Failover 與 Link Aggregation 功能。當主網路連線故障時，系統會自動切換至備援連線，確保網路服務不中斷。 Link Aggregation 可將兩個 2.5GbE 接口聚合為 5Gbps 的理論頻寬，提升大流量傳輸的效能。

### 2.4 硬體效能預估

基於上述硬體配置，系統的整體效能預估如下。

在存儲效能方面，NVMe SSD 層（RAID 1）提供約 1,600 MB/s 順序讀取、1,000 MB/s 順序寫入的實際效能，隨機 IOPS 可達 200,000 以上。這意味著資料庫查詢與 API 回應將獲得接近記憶體的速度。SATA SSD 層（RAID 1）提供約 500 MB/s 順序讀取、450 MB/s 順序寫入的實際效能，對於近期數據的存取足夠快速。HDD 層（RAID 1）提供約 200 MB/s 順序讀取、180 MB/s 順序寫入的實際效能，適合批量讀取歷史數據。

在網路效能方面，單一 2.5GbE 接口提供約 2.5 Gbit/s 的理論頻寬，實際可用頻寬約 280 MB/s。雙接口 Link Aggregation 提供約 5 Gbit/s 的理論頻寬，實際可用頻寬約 550 MB/s。對於兩位用戶同時使用的場景，網路頻寬不會成為瓶頸。

在運算效能方面，AMD Ryzen V1500B 四核心處理器提供約 15,000 的 PassMark 基準分數，支援 8 執行緒同時運算。對於 Docker 容器運行、數據處理腳本執行、以及輕量級 AI 推理運算而言，這樣的運算效能足夠支撐系統的日常運行需求。

---

## 第三章：軟體架構規格

### 3.1 系統架構總覽

AI 投資分析儀 V10.0 採用現代化的微服務架構設計，所有服務元件以 Docker 容器形式部署於 NAS 設備之上。整體架構分為五個層次：資料層、服務層、API 層、應用層與展示層，各層次之間透過標準化的介面進行通信，實現高內聚、低耦合的設計目標。

在容器編排方面，系統採用 Docker Compose 進行容器編排管理。對於兩位用戶的使用規模，Docker Compose 提供了足夠的编排能力與管理便利性，同時保持了架構的簡潔性。與 Kubernetes 等重量級編排工具相比，Docker Compose 更適合資源受限的 NAS 部署環境，且學習曲線較為平緩。

在服務發現方面，系統內部服務透過 Docker Compose 定義的網路（app-network）進行通信，服務名稱即為 DNS 名稱，實現自動的服務發現功能。外部 API 請求透過 Nginx 反向代理分發至後端服務，Nginx 同時承擔負載均衡、SSL 終止、與靜態資源服務的功能。

在配置管理方面，所有環境變數與設定集中於 Docker Compose 配置文件（docker-compose.yml）與環境變數文件（.env）中管理。敏感資訊（如 API 金鑰、資料庫密碼）透過環境變數注入，避免硬編碼於程式碼中。設定檔版本化管理，確保部署的可重現性。

### 3.2 容器服務組態

系統由以下核心 Docker 容器服務組成，各服務設計為可獨立擴展與維護。

在 API 服務方面，Flask REST API 容器提供系統的核心 API 功能，包括行情數據查詢、宏觀指標獲取、AI 建議生成等。容器基於 Python 3.11-slim 映像檔構建，配置 2 個 CPU 核心與 2GB 記憶體限制。服務監聽 5000 端口，透過 Nginx 反向代理對外提供服務。健康檢查配置為每 30 秒檢測一次 /health 端點，連續失敗 3 次則自動重啟容器。

在資料庫服務方面，PostgreSQL 容器作為系統的主要關聯式資料庫，儲存行情數據、宏觀指標、用戶設定等結構化數據。容器基於 postgres:15 映像檔構建，配置 4 個 CPU 核心與 8GB 記憶體限制。數據儲存於 NVMe SSD 層的 Volume 中，確保高效能的數據存取。PostgreSQL 配置採用優化的記憶體管理與查詢優化器設定，支援全文檢索（pg_trgm）與向量相似度搜尋（pgvector）擴展。

在快取服務方面，Redis 容器作為系統的分散式快取與會話儲存。容器基於 redis:7-alpine 映像檔構建，配置 1 個 CPU 核心與 1GB 記憶體限制。Redis 採用 AOF（Append-Only File）持久化模式，確保快取數據在重啟後可恢復。配置 maxmemory 為 800MB，並採用 allkeys-lru 淘汰策略，當記憶體不足時優先移除最少存取的鍵值。

在向量資料庫服務方面，Milvus 容器提供 AI 語義搜尋所需的向量資料庫功能。容器基於 milvusdb/milvus:2.3 映像檔構建，配置 2 個 CPU 核心與 4GB 記憶體限制。Milvus 儲存於 SATA SSD 層的 Volume 中，提供高效的向量相似度搜尋能力。目前配置 Collection 用於儲存 AI 報告的語義向量，支持 9GB 的向量索引儲存。

在反向代理服務方面，Nginx 容器作為系統的統一入口與反向代理。容器基於 nginx:alpine 映像檔構建，配置 1 個 CPU 核心與 256MB 記憶體限制。Nginx 負責 SSL 終止、靜態資源服務、API 請求路由、以及負載均衡。配置 Gzip 壓縮以減少傳輸資料量，配置緩衝區以提升大請求的處理效率。

在排程調度服務方面，Prefect 容器提供數據獲取與處理任務的排程調度功能。容器基於 prefecthq/prefect:2-python3.11 映像檔構建，配置 1 個 CPU 核心與 1GB 記憶體限制。Prefect 負責管理 FRED 宏觀數據、台灣政府數據、以及市場行情數據的定時獲取任務，確保數據的定期更新與處理流水線的可靠執行。

在監控服務方面，Grafana 與 Prometheus 容器提供系統監控與可視化功能。Prometheus 收集各服務的效能指標與健康狀態，Grafana 提供儀表板視覺化呈現。配置監控告警規則，當系統異常時發出通知。

### 3.3 網路架構設計

系統的 Docker 網路採用隔離式設計，確保服務間通信的安全與可控。

在內部網路方面，系統建立名為 app-network 的自定義 Bridge 網路，配置 172.20.0.0/16 的子網段。各服務容器連接至此網路，透過服務名稱進行相互通信。內部網路與外部網路隔離，只有透過 Nginx 反向代理才能從外部訪問服務。這種設計確保了內部服務的安全，減少了外部攻擊面。

在外部訪問方面，系統對外提供 HTTPS 訪問，SSL 憑證由 Let's Encrypt 自動簽發與更新。用戶透過瀏覽器訪問系統時，首先連線至 Nginx（443 端口），Nginx 根據 URL 路徑將請求轉發至適當的後端服務。所有外部通信均經過 SSL 加密，確保傳輸過程中的數據安全。

在端口配置方面，系統對外開放以下端口：443（HTTPS，Web 界面與 API 訪問）、5000（內部服務端口，不對外直接開放）。22 端口預設不對外開放，如有遠端管理需求，應透過 VPN 或 SSH 隧道訪問。

### 3.4 數據持久化設計

系統採用 Docker Volume 實現容器數據的持久化，確保數據在容器重啟或重建時不會丟失。

在資料庫 Volume 方面，PostgreSQL 數據儲存於名為 postgres_data 的 Docker Volume 中，實際儲存路徑對應至 NAS 的 NVMe SSD 儲存池。Volume 採用 local 驅動程式，透過 RAID 1 保護確保數據安全。資料庫的 WAL（Write-Ahead Log）同步寫入，確保交易的持久性。

在 Redis Volume 方面，Redis 數據儲存於名為 redis_data 的 Docker Volume 中，採用 AOF 持久化模式。Redis 數據同步儲存至 NVMe SSD 層，確保快取數據在重啟後可恢復。

在向量資料庫 Volume 方面，Milvus 數據儲存於名為 milvus_data 的 Docker Volume 中，對應至 SATA SSD 儲存池。Milvus 的數據包括 Collection Metadata 與向量索引檔案，佔用約 9GB 空間。

在備份 Volume 方面，系統建立名為 backup_data 的 Docker Volume，用於存放定期備份的資料庫匯出檔案與重要配置檔案。備份資料儲存於 HDD 儲存層，確保長期保存的可靠性。

### 3.5 Docker Compose 配置規格

以下是系統的 Docker Compose 配置文件核心內容，展示各服務的配置關係。

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: ai-invest-nginx
    restart: unless-stopped
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - static_files:/usr/share/nginx/html
    networks:
      - app-network
    depends_on:
      - api
      - grafana
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 256M

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: ai-invest-api
    restart: unless-stopped
    expose:
      - "5000"
    environment:
      - POSTGRES_HOST=db
      - POSTGRES_PORT=5432
      - POSTGRES_DB=ai_invest
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_DB=0
      - FRED_API_KEY=${FRED_API_KEY}
      - MILVUS_HOST=milvus
      - MILVUS_PORT=19530
    volumes:
      - app_config:/app/config
    networks:
      - app-network
    depends_on:
      - db
      - redis
      - milvus
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G

  db:
    image: postgres:15
    container_name: ai-invest-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=ai_invest
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ai_invest"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
    command: >
      postgres
      -c shared_buffers=4GB
      -c effective_cache_size=12GB
      -c work_mem=256MB
      -c maintenance_work_mem=1GB
      -c max_connections=100
      -c log_min_duration_statement=1000
      -c log_lock_waits=on

  redis:
    image: redis:7-alpine
    container_name: ai-invest-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 800mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  milvus:
    image: milvusdb/milvus:2.3
    container_name: ai-invest-milvus
    restart: unless-stopped
    command: etcd,minio,milvus
    environment:
      - ETCD_DATA_DIR=/etcd
      - MINIO_DATA_DIR=/minio_data
      - MILVUS_DATA_DIR=/var/lib/milvus/data
    volumes:
      - milvus_data:/var/lib/milvus/data
      - milvus_etcd:/etcd
      - milvus_minio:/minio_data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9091/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G

  prefect:
    image: prefecthq/prefect:2-python3.11
    container_name: ai-invest-prefect
    restart: unless-stopped
    environment:
      - PREFECT_API_URL=http://prefect:4200/api
      - PREFECT_ORION_API_HOST=0.0.0.0
      - PREFECT_ORION_API_PORT=4200
    volumes:
      - prefect_data:/root/.prefect
      - ./flows:/flows
    networks:
      - app-network
    entrypoint: ["prefect", "orion", "start"]
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  prometheus:
    image: prom/prometheus:v2.47
    container_name: ai-invest-prometheus
    restart: unless-stopped
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - app-network
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G

  grafana:
    image: grafana/grafana:10.2
    container_name: ai-invest-grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_ADMIN_USER}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
    networks:
      - app-network
    depends_on:
      - prometheus
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /share/Container/nvme_data/postgres
  redis_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /share/Container/nvme_data/redis
  milvus_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /share/Container/ssd_data/milvus
  milvus_etcd:
    driver: local
  milvus_minio:
    driver: local
  static_files:
    driver: local
  app_config:
    driver: local
  prefect_data:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local
  backup_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /share/Backup/ai_invest

networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

---

## 第四章：數據規格

### 4.1 數據資產總覽

AI 投資分析儀 V10.0 的數據資產涵蓋市場行情數據、宏觀經濟數據、籌碼與機構數據、估值與評分數據、AI 智慧決策數據等多個類別。這些數據資產經過系統化的管理，形成完整的金融投資數據生態。

在市場行情數據方面，系統提供台股、美股、期貨等主要市場的歷史與即時行情數據。台股涵蓋上市股票 980 檔、上櫃股票 820 檔、ETF 240 檔，自 2005 年至今的完整日 K 數據，總記錄數約 195 萬筆。美股涵蓋核心科技股 100 檔、指數 ETF 50 檔、以及全市場 2,707 檔股票的日 K 數據，回補中，預估總記錄數約 15 萬筆。期貨行情涵蓋台指期、小台指、主要類股指數期貨等，總記錄數約 4,000 筆。

在宏觀經濟數據方面，這是本系統的重點強化領域。透過《宏觀數據擴充方案》的實施，系統的宏觀指標覆蓋將從原有的 30 項大幅擴充至 130 項以上，總記錄數從 10 萬筆增加至 50 萬筆以上。宏觀數據的詳細規格將在下一節展開說明。

在籌碼與機構數據方面，系統提供的數據包括：融資融券數據覆蓋 3,369 筆，三大法人買賣超數據覆蓋 2,155 筆，大額交易人部位數據覆蓋 668 筆，選擇權多空比數據覆蓋 21 筆，13F 機構持倉數據覆蓋 11 筆主要機構（如橋水基金、柏克夏海瑟威等）。

在估值與評分數據方面，系統提供的數據包括：股票估值數據覆蓋 5,234 筆（EPS、B殖利率、本益比、股價淨值比等），每日量化評分覆蓋 18 筆（價值評分、成長評分、動能評分、綜合評分等）。

在 AI 智慧決策數據方面，系統提供的數據包括：演化策略基因組覆蓋 450 筆（包含 14 項核心基因與 12 項調控基因），AI 報告緩存覆蓋 33 筆（用於加速報告生成），語義向量索引覆蓋 9GB（用於語義相似度搜尋）。

### 4.2 宏觀經濟數據規格

宏觀經濟數據是 AI 投資分析儀 V10.0 的核心數據強化領域。以下詳細說明各區域、各類別的宏觀指標規格。

在美國宏觀指標方面，系統的宏觀數據擴充以 FRED（聯邦儲備經濟數據庫）為核心數據源。美國宏觀指標分為以下主要類別。

第一類為利率與貨幣政策指標，包含以下具體指標：聯邦基金利率（FEDFUNDS，日度，記錄數約 2,500 筆）、10 年期公債殖利率（DGS10，日度，記錄數約 2,500 筆）、2 年期公債殖利率（DGS2，日度，記錄數約 2,500 筆）、5 年期公債殖利率（DGS5，日度，記錄數約 2,500 筆）、30 年期公債殖利率（DGS30，日度，記錄數約 2,500 筆）、3 個月期國庫券利率（DTB3，日度，記錄數約 2,500 筆）、M2 貨幣供給（M2SL，週度，記錄數約 520 筆）、M2 年增率（M2GROWTH，週度，記錄數約 520 筆）、聯準會總資產（RESBALNS，週度，記錄數約 520 筆）。

第二類為通貨膨脹指標，包含以下具體指標：CPI 消費者物價指數（CPIAUCSL，月度，記錄數約 240 筆）、核心 CPI（CPILFESL，月度，記錄數約 240 筆）、PCE 物價指數（PCECTPI，月度，記錄數約 240 筆）、核心 PCE（PCEPILFE，月度，記錄數約 240 筆）、生產者物價指數（WPUINDEX，月度，記錄數約 240 筆）、10 年盈通膨率（T10YIE，日度，記錄數約 2,500 筆）、5 年盈通膨率（T5YIE，日度，記錄數約 2,500 筆）。

第三類為就業與勞動市場指標，包含以下具體指標：失業率（UNRATE，月度，記錄數約 240 筆）、非農就業人數（PAYEMS，月度，記錄數約 240 筆）、初次請領失業救濟人數（ICSA，週度，記錄數約 520 筆）、持續請領失業救濟人數（CCSA，週度，記錄數約 520 筆）、平均時薪（CES0500000003，月度，記錄數約 240 筆）、職缺數（JOLTS，月度，記錄數約 240 筆）、自願離職人數（QUITS，月度，記錄數約 240 筆）。

第四類為經濟成長指標，包含以下具體指標：GDP 年增率（GDP，季度，記錄數約 100 筆）、實質 GDP（GDPC1，季度，記錄數約 100 筆）、個人消費支出（PCE，季度，記錄數約 100 筆）、民間投資（GPDI，季度，記錄數約 100 筆）、工業生産指數（IPMAN，月度，記錄數約 240 筆）、産能利用率（CAPUTLG，月度，記錄數約 240 筆）、零售銷售（RSXFS，月度，記錄數約 240 筆）、新屋開工（HOUST，月度，記錄數約 240 筆）、建築許可（PERMIT，月度，記錄數約 240 筆）。

第五類為信心指數指標，包含以下具體指標：密歇根消費者信心（UMICHCSI，月度，記錄數約 240 筆）、會議局消費者信心（CCSA，月度，記錄數約 240 筆）、ISM 製造業 PMI（NAPM，月度，記錄數約 240 筆）、紐約 Fed 製造業調查（NYFSBR，月度，記錄數約 240 筆）、費城 Fed 製造業調查（PHFSBR，月度，記錄數約 240 筆）。

第六類為風險與國際指標，包含以下具體指標：VIX 波動率指數（VIXCLS，日度，記錄數約 2,500 筆）、BAA 級企業債殖利率（BAA10Y，日度，記錄數約 2,500 筆）。

在台灣宏觀指標方面，系統整合國家發展委員會、主計總處、中央銀行、經濟部、財政部等多個政府部門的數據。台灣宏觀指標分為以下主要類別。

第一類為景氣循環指標，包含以下具體指標：景氣對策信號（月度，記錄數約 200 筆）、景氣領先指標（月度，記錄數約 200 筆）、景氣同時指標（月度，記錄數約 200 筆）、景氣落後指標（月度，記錄數約 200 筆）。

第二類為國民所得指標，包含以下具體指標：GDP 季增率（季度，記錄數約 80 筆）、GDP 年增率（季度，記錄數約 80 筆）、GDP 各構成要素（季度，記錄數約 400 筆）。

第三類為物價指標，包含以下具體指標：CPI 年增率（月度，記錄數約 240 筆）、CPI 分類指數（月度，記錄數約 2,400 筆）、PPI（月度，記錄數約 240 筆）。

第四類為勞動市場指標，包含以下具體指標：失業率（月度，記錄數約 240 筆）、就業人數（月度，記錄數約 240 筆）、薪資統計（月度，記錄數約 240 筆）。

第五類為貨幣與利率指標，包含以下具體指標：重貼現率（不定期，記錄數約 20 筆）、隔夜拆款利率（日度，記錄數約 2,500 筆）、M1A、M1B、M2（月度，記錄數約 240 筆）。

第六類為匯率指標，包含以下具體指標：美元對台幣（日度，記錄數約 2,500 筆）、日圓對台幣（日度，記錄數約 2,500 筆）、歐元對台幣（日度，記錄數約 2,500 筆）、人民币對台幣（日度，記錄數約 2,500 筆）。

第七類為對外貿易指標，包含以下具體指標：進出口統計（月度，記錄數約 240 筆）、外銷訂單（月度，記錄數約 240 筆）。

在全球宏觀指標方面，系統整合 IMF、OECD、世界銀行等國際組織的數據，提供中國、日本、歐元區等主要經濟體的宏觀指標。中國宏觀指標預估涵蓋 10 項，包括中國 GDP、中國 CPI、中國製造業 PMI、外匯存底、進出口統計等。日本宏觀指標預估涵蓋 8 項，包括日本 GDP、日本 CPI、日本失業率、日本利率等。歐元區宏觀指標預估涵蓋 8 項，包括歐元區 GDP、歐元區 CPI、歐洲央行利率、德國 GDP 等。全球整合指標預估涵蓋 5 項，包括全球 GDP 成長率加權平均、國際油價、CRB 商品指數等。

### 4.3 資料庫結構規格

系統的核心資料庫採用 PostgreSQL 15，以下說明主要資料表的結構設計。

在行情資料表方面，daily_price 資料表儲存個股的日 K 數據，結構如下：

```sql
CREATE TABLE daily_price (
    id BIGSERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL,           -- 股票代碼
    stock_name VARCHAR(100),                   -- 股票名稱
    market_type VARCHAR(10) NOT NULL,          -- 上市/上櫃/興櫃
    trade_date DATE NOT NULL,                  -- 交易日期
    open_price DECIMAL(18,4),                  -- 開盤價
    high_price DECIMAL(18,4),                  -- 最高價
    low_price DECIMAL(18,4),                   -- 最低價
    close_price DECIMAL(18,4),                 -- 收盤價
    volume BIGINT,                             -- 成交量
    turnover DECIMAL(24,2),                    -- 成交金額
    change_percent DECIMAL(8,4),               -- 漲跌百分比
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uk_daily_price UNIQUE (stock_code, trade_date)
);

CREATE INDEX idx_daily_price_code_date ON daily_price(stock_code, trade_date DESC);
CREATE INDEX idx_daily_price_date ON daily_price(trade_date DESC);
CREATE INDEX idx_daily_price_market ON daily_price(market_type, trade_date);
```

在 macro_indicators 資料表方面，該資料表儲存宏觀經濟指標數據，結構如下：

```sql
CREATE TABLE macro_indicators (
    id BIGSERIAL PRIMARY KEY,
    
    -- 識別與分類
    indicator_code VARCHAR(50) NOT NULL,       -- 指標代碼 (如 FEDFUNDS)
    indicator_name VARCHAR(200) NOT NULL,      -- 指標名稱
    country VARCHAR(10) NOT NULL,              -- 國家 (US/TW/CN/JP/EU)
    region_group VARCHAR(20),                  -- 區域 (APAC/EMEA/AMER)
    category VARCHAR(50) NOT NULL,             -- 分類 (利率/通膨/勞動/成長...)
    subcategory VARCHAR(50),                   -- 子類別
    
    -- 數據內容
    value DECIMAL(18,6),                       -- 數值
    unit VARCHAR(50),                          -- 單位
    original_value DECIMAL(18,6),              -- 原始數值
    transformation_type VARCHAR(20),           -- 轉換類型 (原值/YoY/MoM/QoQ)
    frequency VARCHAR(10) NOT NULL,            -- 頻率 (D/W/M/Q/A)
    
    -- 資料溯源
    source VARCHAR(100) NOT NULL,              -- 數據來源 (FRED/DGBAS/CBC...)
    source_url TEXT,                           -- 來源網址
    series_id VARCHAR(100),                    -- FRED 系列 ID 等
    retrieved_at TIMESTAMPTZ,                  -- 擷取時間
    published_at TIMESTAMPTZ,                  -- 官方發布時間
    
    -- 品質與狀態
    data_quality_score DECIMAL(5,2),           -- 品質評分 (0-100)
    is_estimate BOOLEAN DEFAULT FALSE,         -- 是否為預估值
    is_revised BOOLEAN DEFAULT FALSE,          -- 是否為修正值
    revision_number INTEGER DEFAULT 0,         -- 修正次數
    is_valid BOOLEAN DEFAULT TRUE,             -- 是否有效
    
    -- 時間欄位
    reference_date DATE NOT NULL,              -- 數據參考日期
    release_date DATE,                         -- 官方發布日期
    source_update_time TIMESTAMPTZ,            -- 數據最後更新時間
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uk_macro_indicator UNIQUE (indicator_code, reference_date)
);

CREATE INDEX idx_macro_country_date ON macro_indicators(country, reference_date DESC);
CREATE INDEX idx_macro_category ON macro_indicators(category, reference_date DESC);
CREATE INDEX idx_macro_series_id ON macro_indicators(series_id, reference_date DESC);
CREATE INDEX idx_macro_freq_date ON macro_indicators(frequency, reference_date DESC);
```

在 macro_factors 資料表方面，該資料表儲存經過衍生計算的宏觀因子，結構如下：

```sql
CREATE TABLE macro_factors (
    id BIGSERIAL PRIMARY KEY,
    
    -- 因子識別
    factor_code VARCHAR(50) NOT NULL,          -- 因子代碼
    factor_name VARCHAR(200) NOT NULL,         -- 因子名稱
    factor_category VARCHAR(50),               -- 因子分類 (利率/成長/通膨...)
    calculation_method TEXT,                   -- 計算公式說明
    
    -- 數據內容
    value DECIMAL(18,8),                       -- 因子數值
    unit VARCHAR(50),                          -- 單位
    
    -- 計算元數據
    base_indicator_1 VARCHAR(50),              -- 計算所使用的主指標
    base_indicator_2 VARCHAR(50),              -- 計算所使用的輔指標
    lookback_period INTEGER,                   -- 回溯期
    
    -- 時間欄位
    calculation_date DATE NOT NULL,            -- 計算日期
    base_date_start DATE,                      -- 計算所用數據的開始日期
    base_date_end DATE,                        -- 計算所用數據的結束日期
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uk_macro_factor UNIQUE (factor_code, calculation_date)
);

CREATE INDEX idx_macro_factor_code ON macro_factors(factor_code, calculation_date DESC);
CREATE INDEX idx_macro_factor_category ON macro_factors(factor_category, calculation_date DESC);
```

在 stock_factors 資料表方面，該資料表儲存個股的多因子評分數據，結構如下：

```sql
CREATE TABLE stock_factors (
    id BIGSERIAL PRIMARY KEY,
    
    stock_code VARCHAR(20) NOT NULL,           -- 股票代碼
    stock_name VARCHAR(100),                   -- 股票名稱
    trade_date DATE NOT NULL,                  -- 交易日期
    
    -- 價值因子
    pe_ratio DECIMAL(12,4),                    -- 本益比
    pb_ratio DECIMAL(12,4),                    -- 股價淨值比
    ps_ratio DECIMAL(12,4),                    -- 股價營收比
    ev_ebitda DECIMAL(12,4),                   -- EV/EBITDA
    dividend_yield DECIMAL(8,4),               -- 殖利率
    
    -- 成長因子
    revenue_growth DECIMAL(12,4),              -- 營收成長率
    eps_growth DECIMAL(12,4),                  -- EPS 成長率
    profit_growth DECIMAL(12,4),               -- 獲利成長率
    
    -- 動能因子
    momentum_1m DECIMAL(10,4),                 -- 1 個月動能
    momentum_3m DECIMAL(10,4),                 -- 3 個月動能
    momentum_6m DECIMAL(10,4),                 -- 6 個月動能
    relative_strength DECIMAL(10,4),           -- 相對強弱
    
    -- 品質因子
    roe DECIMAL(10,4),                         -- ROE
    roa DECIMAL(10,4),                         -- ROA
    gross_margin DECIMAL(10,4),                -- 毛利率
    net_margin DECIMAL(10,4),                  -- 淨利率
    debt_to_equity DECIMAL(10,4),              -- 負債比率
    
    -- 波動因子
    volatility_20d DECIMAL(10,4),              -- 20 日波動率
    beta DECIMAL(10,4),                        -- Beta
    
    -- 綜合評分
    value_score DECIMAL(6,2),                  -- 價值評分
    growth_score DECIMAL(6,2),                 -- 成長評分
    quality_score DECIMAL(6,2),                -- 品質評分
    momentum_score DECIMAL(6,2),               -- 動能評分
    composite_score DECIMAL(6,2),              -- 綜合評分
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uk_stock_factors UNIQUE (stock_code, trade_date)
);

CREATE INDEX idx_stock_factors_code ON stock_factors(stock_code, trade_date DESC);
CREATE INDEX idx_stock_factors_score ON stock_factors(composite_score DESC, trade_date);
```

### 4.4 數據生命週期管理

系統建立完整的數據生命週期管理機制，確保數據從獲取到歸檔的完整管理。

在數據取得階段，系統透過 Prefect 排程框架自動化執行數據獲取任務。FRED 數據每日下午 4 點自動同步，台灣政府數據每月 10 日同步，美股數據每日收盤後增量更新。數據獲取遵循 Rate Limit 限制（FRED API 每分鐘 120 次、每日 1,000 次），確保不會被 API 封鎖。異常的數據獲取會觸發告警，通知維運人員處理。

在數據處理階段，系統實施多層次的數據品質檢查。DataQualityMonitor 類別執行以下檢查：完整性檢查（驗證必要欄位是否齊全）、準確性檢查（驗證數值是否在合理範圍）、一致性檢查（驗證跨來源數據是否一致）、時效性檢查（驗證數據是否及時更新）。檢查結果記錄於 quality_log 資料表，供後續分析與追溯。

在數據儲存階段，系統採用分層儲存策略。熱數據（近期行情、近期宏觀指標、AI 計算中間結果）儲存於 NVMe SSD 層，確保高效能存取。溫數據（近期歷史行情、估值數據）儲存於 SATA SSD 層，平衡效能與成本。冷數據（超過 3 年的歷史行情、歸檔宏觀指標）儲存於 HDD 層，提供大容量低成本儲存。

在數據歸檔階段，超過 20 年的歷史行情數據會自動歸檔至 HDD 儲存層。歸檔採用壓縮格式，減少儲存空間占用。歸檔數據仍可透過系統查詢介面存取，但查詢效能會低於熱數據。

在數據備份階段，系統實施每日全量備份與每小時增量備份策略。備份儲存於獨立的備份 Volume（對應 HDD 儲存池），確保與主數據的物理隔離。備份保留期限為 30 天，超過期限的備份會自動刪除。每月執行一次備份還原測試，驗證備份資料的完整性。

---

## 第五章：功能規格

### 5.1 行情數據查詢功能

行情數據查詢是系統的基礎功能，提供台股、美股、期貨等市場的歷史與即時行情數據查詢服務。

在台股行情查詢方面，系統支援以下查詢方式：依股票代碼查詢（支援上市、上櫃、ETF）、依產業別查詢、依交易日期區間查詢、依交易日期範圍查詢。回傳資料包含開盤價、最高價、最低價、收盤價、成交量、成交金額、漲跌百分比等欄位。系統提供技術指標計算功能，包括 MA（移動平均線）、EMA（指數移動平均線）、RSI（相對強弱指數）、MACD（平滑異同移動平均線）、布林通道等。

在美股行情查詢方面，系統支援以下查詢方式：依股票代碼查詢（支援 NYSE、NASDAQ 上市股票）、依 ETF 代碼查詢、依交易日期區間查詢。美股數據目前處於回補階段，預估完成後將提供完整的歷史數據覆蓋。

在期貨行情查詢方面，系統支援以下查詢方式：依期貨合約查詢（台指期、小台指、電子期、金融期等）、依到期月份查詢。期貨行情包含開盤價、最高價、最低價、收盤價、成交量、未平倉量等欄位。

在行情圖表呈現方面，系統提供互動式的行情圖表介面，支援以下互動功能：縮放（支援滑鼠滾輪縮放）、移動（支援拖曳移動時間軸）、指標疊加（支援疊加多個技術指標）、期間切換（支援日 K、週 K、月 K 切換）、資料匯出（支援 CSV 格式匯出）。

### 5.2 宏觀經濟數據查詢功能

宏觀經濟數據查詢是本系統的重點強化功能，提供美國、台灣、中國、日本、歐元區等主要經濟體的宏觀指標追蹤與分析功能。

在指標瀏覽方面，系統提供依國家別、指標類別、發布頻率等多維度的指標瀏覽功能。每個指標頁面顯示：指標基本資訊（名稱、代碼、定義、來源）、歷史趨勢圖（可切換 YoY、MoM、原值顯示）、最新數值與變化、同類指標排名與比較。

在數據查詢方面，系統支援以下查詢方式：依國家別查詢（US、TW、CN、JP、EU）、依指標類別查詢（利率、通膨、勞動、成長、信心、國際貿易）、依日期區間查詢、依關鍵字搜尋。查詢結果以表格與圖表形式呈現，支援排序、篩選、與匯出。

在宏觀因子分析方面，系統提供經過衍生計算的宏觀因子，包括：殖利率曲線斜率（10Y-2Y）、實質利率（名目利率減盈通膨）、M2 貨幣供給年增率、GDP 缺口、勞動市場緊繃度、信用利差、VIX 波動率指數等。這些因子可直接用於量化模型的輸入變數。

在經濟日曆方面，系統提供重要經濟數據發布的時間表，顯示：即將發布的經濟數據（未來一週）、市場共識預期、前次實際值、以及發布結果與預期的比較。經濟日曆可幫助用戶掌握重要宏觀事件時間點，提前規劃投資決策。

### 5.3 籌碼分析功能

籌碼分析功能提供融資融券、三大法人、大額交易人、選擇權部位等籌碼數據的分析服務。

在融資融券分析方面，系統提供：融資餘額與融券餘額的歷史趨勢、融資使用率與融券維持率、個股融資券集中度分析、融資券異常變動警示。

在三大法人分析方面，系統提供：外資、投信、自營商的買賣超歷史趨勢、法人買賣超排行、法人持股變化追蹤。

在大額交易人分析方面，系統提供：分點券商買賣超分布、大額交易人部位變化、特定大戶進出追蹤。

在選擇權分析方面，系統提供：選擇權 Put/Call比率、選擇權未平倉分布、選擇權莊家部位的變化。

在籌碼回測方面，系統支援以籌碼因子進行回測，評估特定籌碼策略的歷史績效。

### 5.4 AI 投資分析功能

AI 投資分析是本系統的核心差異化功能，透過演化策略優化的遺傳演算法與深度學習模型，提供智能化的投資分析與建議服務。

在 AI 個股評分方面，系統每日為所有涵蓋的股票計算 AI 綜合評分，評分維度包括：價值評分（基於本益比、殖利率、股價淨值比等估值指標）、成長評分（基於營收成長、獲利成長等成長指標）、品質評分（基於 ROE、毛利率、負債比等品質指標）、動能評分（基於價格動能、相對強弱等動能指標）、宏觀評分（基於宏觀因子對產業的影響評估）。綜合評分為上述維度評分的加權平均，權重由演化策略優化決定。

在 AI 投資報告生成方面，系統能夠生成結構化的 AI 投資報告，包含以下內容：個股基本概覽、財務數據摘要、估值評估、技術分析觀點、籌碼分析摘要、宏觀環境評述、投資建議與風險提示。報告結合 NLP 技術自動生成文字內容，並搭配數據圖表呈現。

在語義搜尋功能方面，系統支援基於自然語言的投資報告搜尋。用戶可以輸入問題（如「最近半導體產業的投資建議」），系統會在 AI 報告語義庫中搜尋最相關的結果，返回符合條件的報告摘要與連結。

在演化策略分析方面，系統記錄並展示演化策略的基因組優化歷史，讓用戶了解 AI 模型如何持續進化與適應市場變化。基因組可視化呈現 14 項核心基因與 12 項調控基因的變化趨勢。

---

## 第六章：API 介面規格

### 6.1 API 設計原則

系統的 RESTful API 遵循以下設計原則：簡潔性（URL 設計簡潔明瞭）、一致性（請求與回應格式一致）、可發現性（支援 HATEOAS 超連結）、向下相容（版本化管理避免破壞性變更）、錯誤處理（標準化的錯誤代碼與訊息）。

API 版本管理採用 URL 路徑方式（/api/v1/），確保新版本發布時舊版本仍可使用。速率限制設為每分鐘 60 次請求，確保服務的公平性與穩定性。

### 6.2 主要 API 端點

以下是系統提供的主要 API 端點。

在行情數據 API 方面：

| 端點 | 方法 | 說明 |
|------|------|------|
| /api/v1/stocks | GET | 取得股票清單 |
| /api/v1/stocks/{code}/prices | GET | 取得個股歷史行情 |
| /api/v1/stocks/{code}/quote | GET | 取得個股即時報價 |
| /api/v1/stocks/{code}/indicators | GET | 取得技術指標 |
| /api/v1/stocks/search | GET | 搜尋股票 |
| /api/v1/futures | GET | 取得期貨列表 |
| /api/v1/futures/{code}/prices | GET | 取得期貨行情 |

在宏觀數據 API 方面：

| 端點 | 方法 | 說明 |
|------|------|------|
| /api/v1/macro/indicators | GET | 取得宏觀指標列表 |
| /api/v1/macro/indicators/{code} | GET | 取得特定指標數據 |
| /api/v1/macro/countries | GET | 取得支援的國家列表 |
| /api/v1/macro/categories | GET | 取得指標分類 |
| /api/v1/macro/factors | GET | 取得宏觀因子 |
| /api/v1/macro/calendar | GET | 取得經濟日曆 |

在 AI 分析 API 方面：

| 端點 | 方法 | 說明 |
|------|------|------|
| /api/v1/ai/scores | GET | 取得 AI 評分排行 |
| /api/v1/ai/scores/{code} | GET | 取得個股 AI 評分 |
| /api/v1/ai/reports | GET | 取得 AI 報告列表 |
| /api/v1/ai/reports/{id} | GET | 取得特定 AI 報告 |
| /api/v1/ai/search | GET | 語義搜尋 AI 報告 |
| /api/v1/ai/evolution | GET | 取得演化策略資訊 |

在籌碼數據 API 方面：

| 端點 | 方法 | 說明 |
|------|------|------|
| /api/v1/chips/margin | GET | 取得融資融券數據 |
| /api/v1/chips/institution | GET | 取得三大法人數據 |
| /api/v1/chips/options | GET | 取得選擇權數據 |

### 6.3 API 回應格式

系統 API 採用標準化的 JSON 回應格式。

成功回應格式如下：

```json
{
    "status": "success",
    "data": {
        // 業務數據
    },
    "meta": {
        "page": 1,
        "per_page": 20,
        "total": 100,
        "has_more": true
    },
    "timestamp": "2026-02-01T12:00:00Z"
}
```

錯誤回應格式如下：

```json
{
    "status": "error",
    "error": {
        "code": "40001",
        "message": "Invalid parameter: stock_code",
        "details": {
            "stock_code": "Stock code not found"
        }
    },
    "timestamp": "2026-02-01T12:00:00Z"
}
```

### 6.4 認證機制

系統 API 支援 API Key 認證機制。用戶在請求時需攜帶 X-API-Key 標頭，驗證通過後方可存取 API。API Key 透過系統設定頁面產生，每位用戶可產生多組 API Key，並可設定各組 Key 的權限與有效期限。

速率限制以 API Key 為單位計算，預設限制為每分鐘 60 次請求。超過限制時，系統回傳 429 Too Many Requests 錯誤，並在回應標頭中包含 Retry-After 指示建議的重試時間。

---

## 第七章：資訊安全規格

### 7.1 安全設計原則

系統的安全設計遵循以下核心原則：最小權限（每個服務只擁有必要的權限）、防禦深度（多層安全防護）、預設安全（安全設定為預設值）、透明安全（安全機制對使用者透明）。

### 7.2 網路安全

在網路隔離方面，系統採用 Docker 網路隔離，內部服務之間透過隔離的 Bridge 網路通信，外部無法直接存取內部服務。只有 Nginx 反向代理服務對外開放，減少攻擊面。

在 SSL/TLS 加密方面，所有對外通信採用 HTTPS 加密。SSL 憑證由 Let's Encrypt 免費簽發，自動更新。配置強加密套件，禁用已知不安全的加密算法。

在防火牆規則方面，NAS 設備配置防火牆規則，預設拒絕所有入站連線，只開放 443 端口（HTTP/HTTPS）與必要的管理端口。

### 7.3 數據安全

在傳輸加密方面，所有網路傳輸採用 TLS 1.2 以上版本加密。容器之間的通信（在同一 Docker 網路內）可選擇啟用 mTLS 相互認證。

在靜態加密方面，敏感數據（如 API Key、資料庫密碼）儲存於環境變數或加密的配置文件中。資料庫可選擇啟用 TDE（Transparent Data Encryption）擴展。

在備份加密方面，備份資料採用 AES-256 加密，確保備份媒體遺失時數據不會洩漏。加密金鑰透過 Keystore 安全管理。

### 7.4 存取控制

在身份認證方面，系統提供用戶名稱/密碼認證機制。密碼採用 bcrypt 雜湊儲存，支援強密碼原則（最低長度、需包含數字與特殊字元）。支援兩因素認證（2FA）作為額外安全層。

在授權方面，系統實施基於角色的存取控制（RBAC），定義以下角色：管理員（完整系統設定權限）、分析師（數據查詢與 AI 分析權限）、一般用戶（基本查詢權限）。每位用戶可分配一個或多個角色。

在審計日誌方面，系統記錄所有重要的操作日誌，包括：登入/登出紀錄、API 請求紀錄、設定變更紀錄、數據存取紀錄。日誌保留 90 天，支援查詢與匯出。

---

## 第八章：部署與營運規格

### 8.1 部署架構

系統採用私有化部署架構，所有元件部署於用戶自有的 NAS 設備上，不經過任何第三方伺服器。

部署架構如下：用戶透過 HTTPS 存取系統，SSL 憑證由 Let's Encrypt 自動簽發。Nginx 作為反向代理，接收外部請求並轉發至後端服務。Flask API 服務處理業務邏輯，PostgreSQL 儲存結構化數據，Redis 提供快取服務，Milvus 提供向量搜尋服務，Prefect 執行數據處理排程，Prometheus/Grafana 提供監控服務。

### 8.2 部署流程

系統部署流程如下：

第一階段為環境準備，包括：確認 NAS 設備已開機並正常運行、確認網路連線正常、確保 Docker 與 Docker Compose 已安裝、建立必要的資料夾結構與儲存池。

第二階段為配置設定，包括：複製系統程式碼至 NAS、建立並設定 .env 環境變數檔案、產生或設定 SSL 憑證、調整 Docker Compose 配置文件（如需要）。

第三階段為服務啟動，包括：執行 docker-compose up -d 啟動所有服務、檢查各服務健康狀態、執行資料庫遷移與初始化、載入初始數據。

第四階段為驗證測試，包括：透過瀏覽器存取系統頁面、測試各項功能是否正常、驗證 API 端點是否可正常存取、確認監控儀表板正常顯示。

### 8.3 備份策略

系統實施以下備份策略：

在資料庫備份方面，每日凌晨 3 點自動執行 PostgreSQL 全量備份，備份檔案儲存於 backup_data Volume（對應 HDD 儲存池）。備份檔案保留 7 天，每日備份、每週保留完整備份、每月執行一次備份還原測試。

在配置備份方面，系統配置檔案（docker-compose.yml、環境變數檔案、Nginx 配置等）透過 Git 版本控制管理，可隨時回溯至歷史版本。重要配置變更應 commit 至版本庫。

在數據備份方面，除資料庫外，Redis 快取數據、向量資料庫數據也可選擇性備份。AI 報告語義向量為可重建數據，可選擇不備份。

### 8.4 監控告警

系統監控涵蓋以下層面：

在基礎設施監控方面，監控項目包括：CPU 使用率、記憶體使用率、磁碟使用率與健康狀態、網路流量與連線數、Docker 容器狀態。設定告警閾值：CPU > 80% 持續 5 分鐘、記憶體 > 85%、磁碟空間 < 20%。

在應用監控方面，監控項目包括：API 回應時間與錯誤率、資料庫查詢效能與連線數、Redis 快取命中率、容器健康檢查狀態。告警閾值：API P95 回應時間 > 500ms、錯誤率 > 1%、Redis 命中率 < 80%。

在業務監控方面，監控項目包括：數據更新完成狀態、AI 報告生成狀態、數據品質檢查結果。每日數據更新失敗、生成功異常、品質檢查發現重大問題時觸發告警。

在告警通知方面，告警通知發送至系統管理員指定的 Email 地址。重大告警（服務不可用）可選擇發送 SMS 或即時通訊通知。

### 8.5 維護作業

系統的例行維護作業包括：

在每日維護方面，檢查監控儀表板有無異常、檢查備份任務是否成功執行、檢查日誌有無錯誤。

在每週維護方面，檢視效能指標趨勢、清理過期日誌、檢查安全更新。

在每月維護上月，執行效能調優（如需要）、執行安全稽核、執行災難復原演練。

在每季維護方面，評估並規劃容量擴充、軟體版本更新評估、審查並更新文件。

---

## 第九章：AI 模型規格

### 9.1 演化策略模型

系統的核心 AI 模型採用演化策略（Evolution Strategy）優化的遺傳演算法，透過模擬生物演化的機制自動優化投資因子的權重配置。

在基因組設計方面，系統的基因組包含 14 項核心基因與 12 項調控基因，共 26 個基因組成的染色體。14 項核心基因包括：價值因子權重、成長因子權重、品質因子權重、動能因子權重、宏觀因子權重、PE 閾值、PB 閾值、EPS 成長閾值、ROE 閾值、動能閾值、持有多頭天數、持有空頭天數、再平衡週期、风险调整系数。12 項調控基因包括：演化速率、突變機率、菁英保留比例、族群規模、迭代次數、交叉機率、基因邊界約束、早停條件、適應度函數權重、時間窗口大小、產業中性化參數、規模中性化參數。

在演化流程方面，每一輪演化包括以下步驟：評估（計算每個基因組的適應度，即歷史回測績效）、選擇（根據適應度選擇優秀個體）、交叉（隨機配對並交換基因）、突變（以一定機率改變基因值）、替換（生成新一代族群）。演化過程持續多輪，直到收斂或達到終止條件。

在適應度函數方面，適應度函數綜合考量以下目標：年化報酬率（報酬目標）、夏普比率（風險調整後報酬）、最大回撤（下行風險控制）、勝率（交易成功率）。

### 9.2 自然語言處理模型

系統的自然語言處理能力用於 AI 報告生成與語義搜尋功能。

在文本分析方面，系統整合預訓練的中文與英文語言模型，用於分析財經新聞、企業公告、研究報告等文本內容。文本分析結果包括：情感傾向（正面/負面/中性）、關鍵實體識別（公司名稱、人名、數據）、主題分類（宏觀、行業、公司）。

在報告生成方面，系統採用模板式生成與神經生成相結合的方式。模板式生成確保報告結構的完整性與可讀性，神經生成用於豐富文字表達與提供自然流暢的閱讀體驗。生成的報告包含數據支撐與邏輯推理，避免空洞的陳述。

在語義搜尋方面，系統使用預訓練的 Sentence Transformer 模型將文本編碼為高維向量，透過 Milvus 向量資料庫進行相似度搜尋。支援以自然語言查詢投資報告，返回語義最相關的結果。

### 9.3 模型生命週期管理

系統建立完整的 AI 模型生命週期管理機制。

在模型版本管理方面，每次模型訓練完成後產生新版本，保留完整版本歷史。版本記錄包括：訓練數據版本、基因組參數、訓練日誌、適應度評估結果。

在模型監控方面，持續追蹤模型預測結果的市場績效，設定預警閾值。當模型績效顯著下降時發出告警，通知團隊進行模型檢視與再訓練。

在模型再訓練方面，建立定期再訓練機制（每季或每半年），使用最新數據更新模型參數。再訓練前評估市場環境變化，調整訓練策略。

---

## 第十章：效能規格

### 10.1 系統效能目標

系統設計的效能目標如下：

在 API 回應時間方面，簡單查詢（單一股票報價）P50 < 50ms、P95 < 100ms。中等複雜度查詢（歷史行情下載）P50 < 200ms、P95 < 500ms。複雜查詢（多股票比較分析）P50 < 500ms、P95 < 1,000ms。

在系統吞吐量方面，支援兩位用戶同時使用，峰值併發請求數 20。系統可處理每日 10,000 次 API 請求。

在資料庫效能方面，單一查詢平均耗時 < 50ms（P95 < 120ms）。每日可處理 100,000 次查詢操作。Redis 快取命中率目標 > 90%。

在系統可用性方面，目標可用性 > 99.5%（排除計劃性維護）。故障平均修復時間（MTTR）< 30 分鐘。資料庫復原時間目標（RTO）< 1 小時。資料庫復原點目標（RPO）< 1 小時。

### 10.2 資源規劃

基於兩位用戶的使用規模，系統的資源規劃如下：

在 CPU 資源方面，Flask API 服務配置 2 核心、PostgreSQL 配置 4 核心、Redis 配置 1 核心、Milvus 配置 2 核心、其他服務配置 1 核心。總計約 11 核心，AMD Ryzen V1500B 的 4 核心 8 執行緒可透過多工處理支撐。

在記憶體資源方面，Flask API 服務配置 2GB、PostgreSQL 配置 8GB、Redis 配置 1GB、Milvus 配置 4GB、Grafana 配置 1GB、其他服務配置 1GB。總計約 17GB，32GB 實體記憶體提供充足空間。

在儲存資源方面，NVMe SSD 層配置 2TB（RAID 1）、SATA SSD 層配置 1TB（RAID 1）、HDD 層配置 24TB（RAID 1）。總可用容量約 24TB，預估使用量 19.3TB（20% 安全邊界）。

---

## 第十一章：風險評估與因應

### 11.1 風險識別

系統部署與營運可能面臨以下風險：

在硬體故障風險方面，NAS 設備故障、硬碟故障、網路故障可能導致服務中斷或數據丟失。考量因素為硬碟故障是最常見的硬體故障類型。

在數據品質風險方面，外部數據源異常、數據處理錯誤、數據同步延遲可能影響分析結果的準確性。考量因素為多個數據源的整合增加了複雜度。

在資安風險方面，未授權存取、數據洩漏、服務阻斷攻擊可能危害系統安全與用戶隱私。考量因素為私有化部署減少了部分風險但仍需防範。

在效能瓶頸風險方面，隨著數據量增長與使用時間增加，系統效能可能下降。考量因素為兩位用戶的使用規模下瓶頸風險較低。

### 11.2 風險因應措施

針對上述風險，系統設計以下因應措施：

在硬體故障因應方面，所有儲存層採用 RAID 1 配置，可容忍單硬碟故障。部署監控告警，及時發現硬體異常。建立完整的備份策略，支援數據還原。提供備用設備或快速修復方案，縮短故障時間。

在數據品質因應方面，建立數據品質檢查機制，及時發現數據異常。實施多數據源交叉驗證，提高數據可靠性。建立數據問題追蹤與回報流程，持續改善數據品質。

在資安風險因應方面，實施多層網路安全防護。定期執行安全更新與漏洞修補。建立安全監控與事件響應機制。定期執行安全稽核與滲透測試。

在效能瓶頸因應方面，建立效能監控機制，及時發現效能問題。預留 20% 硬體資源安全邊界。規劃未來擴充方案，確保可彈性擴展。

---

## 第十二章：實施時程

### 12.1 專案階段規劃

本系統的完整實施分為四個主要階段。

第一階段為環境準備與部署（第 1-2 週），主要工作包括：硬體環境組裝與網路配置、NAS 系統初始化與儲存池建立、Docker 環境安裝與配置、系統程式碼部署與服務啟動、SSL 憑證申請與設定、初步功能驗證。

第二階段為數據整合與測試（第 3-6 週），主要工作包括：台股行情數據完整回補、美股行情數據回補、FRED 宏觀數據獲取框架開發、台灣政府數據獲取框架開發、資料庫效能優化與索引調整、數據品質檢查規則實作。

第三階段為 AI 功能強化（第 7-10 週），主要工作包括：宏觀數據擴充方案全球覆蓋、AI 評分模型訓練與部署、報告生成功能完善、語義搜尋功能強化、演化策略模型優化。

第四階段為上線與營運優化（第 11-12 週），主要工作包括：系統上線與用戶驗收、監控告警體系完善、文檔補全與知識傳承、營運流程建立與演練、用戶培訓與技術支援交接。

### 12.2 驗收標準

系統驗收標準包括以下項目：

在功能驗收方面，所有規格書所列功能均可正常使用、API 端點回應格式正確且資料準確、AI 評分與報告生成功能正常運作。

在效能驗收方面，API 平均回應時間 < 200ms、系統可穩定運行 7×24 小時、監控告警功能正常運作。

在安全驗收方面，HTTPS 連線正常、身份認證與授權機制正常運作、無重大安全漏洞。

在數據驗收方面，行情數據完整性 > 99%、宏觀數據完整性 > 95%、數據品質檢查通過率 > 95%。

---

## 結論

本規格書完整描述了 AI 投資分析儀 V10.0 系統的技術架構、功能規格、部署方式與營運規範。系統基於 QNAP TS-h973AX-32G NAS 設備，採用 Docker 容器化部署，專為兩位專業投資人提供全方位的智能投資分析服務。

透過本系統的實施，用戶將獲得：完整的市場行情數據覆蓋、豐富的宏觀經濟指標分析、專業的籌碼與機構數據洞察、以及強大的人工智能投資建議。所有數據均儲存於用戶自有設備，確保最高等級的數據安全與隱私保護。

本系統的設計充分考虑了效能、可靠性、安全性與可維護性的平衡，為用戶提供一個穩定、高效、安全的投資分析平台。我們期待本系統能夠成為用戶投資決策的得力助手，幫助用戶在複雜多變的金融市場中做出更明智的選擇。

---

**文件結束**

*本文檔為 AI 投資分析儀 V10.0 完整規格書*  
*文件編號：SPEC-V10.0-001*  
*版本：3.0.0*  
*建立日期：2026年2月1日*  
*文件狀態：正式發布*  

---

**核準簽章**：

| 角色 | 姓名 | 簽章 | 日期 |
|------|------|------|------|
| 撰寫 | 系統架構師 | _____________ | _____________ |
| 審查 | 技術負責人 | _____________ | _____________ |
| 核准 | 專案經理 | _____________ | _____________ |

---

**附錄 A：硬體配置清單**

| 項目 | 型號 | 數量 | 用途 |
|------|------|------|------|
| NAS 設備 | QNAP TS-h973AX-32G | 1 台 | 系統主機 |
| NVMe SSD | Intel P4510 (2TB) | 2 顆 | 熱數據儲存（RAID 1） |
| SATA SSD | WD Red SA500 (1TB) | 2 顆 | 溫數據儲存（RAID 1） |
| HDD | Seagate IronWolf Pro (24TB) | 2 顆 | 冷數據儲存（RAID 1） |

**附錄 B：軟體元件清單**

| 元件 | 版本 | 用途 |
|------|------|------|
| Docker | 24.x | 容器化平台 |
| Docker Compose | 2.x | 容器編排 |
| Python | 3.11 | 開發語言 |
| Flask | 3.x | API 框架 |
| PostgreSQL | 15 | 關聯式資料庫 |
| Redis | 7.x | 快取服務 |
| Milvus | 2.3 | 向量資料庫 |
| Prefect | 2.x | 排程調度 |
| Nginx | 最新版 | 反向代理 |
| Prometheus | 2.x | 監控數據收集 |
| Grafana | 10.x | 監控可視化 |

**附錄 C：網路連接埠對照表**

| 服務 | 對外 port | 內部 port | 說明 |
|------|-----------|-----------|------|
| Nginx | 443 | 443 | HTTPS 入口 |
| API | - | 5000 | 內部服務 |
| PostgreSQL | - | 5432 | 內部服務 |
| Redis | - | 6379 | 內部服務 |
| Grafana | - | 3000 | 內部服務 |