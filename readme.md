# 📊 DataSense — Full-Stack AI Data Analysis & Predictive Machine Learning Platform

> **DataSense** is an enterprise-grade, full-stack data analytics and machine learning platform that transforms raw datasets into actionable business insights, interactive visualizations, automated data cleaning pipelines, and real predictive ML intelligence.

---

## 🌟 Key Features

### 1. 📤 Seamless Data Upload & Ingestion
- Upload **CSV** and **Excel (.xlsx)** datasets with automatic schema detection.
- Fast file parsing with live row/column metrics, data type inference, and numerical/categorical column classification.

### 2. 🧹 Interactive Data Cleaning Pipeline
- **Null Value Imputation**: Mean, Median, Mode, or Constant imputation.
- **Outlier Handling**: IQR & Z-score anomaly detection and capping.
- **Feature Encoding**: One-Hot Encoding and Label Encoding.
- **Pipeline History & Undo**: Step-by-step audit trail with instant step rollback.

### 3. 📊 Dynamic Data Visualization Engine
- Interactive charts powered by Recharts: **Bar**, **Line**, **Scatter**, **Pie**, **Histogram**, and **Heatmaps**.
- **Full-Screen Chart Expansion**: High-Z-index modal for deep data exploration and chart customizers.

### 4. 🔬 Feature Analysis & AI Feature Discovery
- Live statistical analysis of numerical and categorical distributions.
- **Interactive Feature Generation (`create_feature`)**: Mathematically compute ratio, product, sum, and difference columns to uncover hidden relationships.
- Correlation matrix detection to identify redundant column pairs.

### 5. 🤖 Automated AI Insights & PDF Report Generator
- **100% Deterministic Quality Scoring**: Completeness, Consistency, and Validity scores computed directly from dataset metrics.
- **IQR Anomaly Detection Report**: Identifies critical data deviations with row indices and expected ranges.
- **Business Risk Assessment**: Automated Revenue, Expense, Operational, and Quality risk scores.
- **PDF Export**: Download structured, print-ready PDF reports powered by `html2canvas` & `jspdf`.

### 6. 🔮 Dual-Engine Predictive Intelligence (12 ML Models)
Supports both **Continuous Numerical** and **Discrete Categorical** target prediction tasks:

#### 📈 6 Regression Models (Numerical Targets)
1. **🤖 Auto Ensemble (Best Regressor)**: Automatically fits all regressors and selects the model with the highest validation $R^2$ score.
2. **🌲 Random Forest Regressor**: `RandomForestRegressor(n_estimators=100)`
3. **🚀 Gradient Boosting Regressor**: `GradientBoostingRegressor(n_estimators=100)`
4. **📈 Linear Regression**: Ordinary Least Squares regression
5. **⚖️ Ridge Regression**: L2 Regularized linear model
6. **🌿 Decision Tree Regressor**: Decision tree regressor

#### 🎯 6 Classification Models (Categorical Targets)
1. **🤖 Auto Ensemble (Best Classifier)**: Automatically selects the classifier with the highest cross-validation Accuracy / F1 score.
2. **🌲 Random Forest Classifier**: `RandomForestClassifier(n_estimators=100)`
3. **🚀 Gradient Boosting Classifier**: `GradientBoostingClassifier(n_estimators=100)`
4. **🎯 Logistic Regression**: `LogisticRegression(max_iter=500)`
5. **🧠 Support Vector Classifier (SVC)**: `SVC(probability=True)`
6. **🌿 Decision Tree Classifier**: Decision tree classifier

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Vanilla CSS Modules, Recharts |
| **Backend** | Node.js, Express.js, JWT Authentication, ioredis Cache (with in-memory fallback) |
| **ML Engine** | Python 3.10+, FastAPI, Uvicorn, Pandas, NumPy, Scikit-Learn |

---

## 📁 Repository Structure

```
DataSense/
├── Frontend/                 # Next.js App Router Web Application
│   ├── src/
│   │   ├── app/              # (dashboard) Routes (upload, preview, cleaning, visualization, feature-analysis, ai-insights, predictions)
│   │   ├── components/       # Layout & Global UI Components
│   │   ├── features/         # Feature-specific components and styles
│   │   └── services/         # API Client & State Stores
├── Backend/                  # Express REST API
│   ├── controllers/          # Request handlers
│   ├── routes/               # API endpoints (/auth, /api/data)
│   ├── services/             # Dataset & ML Service Proxies
│   └── utils/                # Pipeline step builders & metadata
└── MLService/                # Python FastAPI Machine Learning Microservice
    ├── app/
    │   ├── analysis/         # Data quality & deterministic insight analyzer
    │   ├── api/              # FastAPI endpoints (/upload, /preprocess, /analyze, /predict)
    │   ├── predictions/      # Scikit-Learn Regression & Classification Engine
    │   └── preprocessings/   # Data cleaning & feature engineering engine
    └── main.py               # FastAPI App entrypoint
```

---

## 🚀 Quickstart & Local Setup Guide

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.10+ recommended)
- **Git**

---

### 2. Microservice Setup (`MLService`)

```bash
# Navigate to MLService
cd MLService

# Create & activate virtual environment (optional)
python -m venv venv
# On Windows: venv\Scripts\activate
# On macOS/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (runs on http://localhost:8000)
uvicorn main:app --reload
```

---

### 3. Backend Setup (`Backend`)

```bash
# Navigate to Backend
cd Backend

# Install dependencies
npm install

# Start Express server (runs on http://localhost:5000)
npm run dev
```

---

### 4. Frontend Setup (`Frontend`)

```bash
# Navigate to Frontend
cd Frontend

# Install dependencies
npm install

# Start Next.js development server (runs on http://localhost:3000)
npm run dev
```

---

## 🎥 Demo & Feedback

Thank you for visiting **DataSense**! 🙌

You can watch the demo video by clicking below:

👉 [**Watch Demo Video**](https://drive.google.com/file/d/1IIhWf9x79RzE_54J8ffXaWrnjzQ8m_ih/view?usp=sharing)

Your feedback is always welcome! You can reach me through:

- 📧 [**Email Me**](mailto:jemitvaghasiya07@gmail.com)  
- 🌐 [**Visit My Portfolio**](https://jemitportfolio.netlify.app/contact)

Thank you for checking out **DataSense**! 🚀
