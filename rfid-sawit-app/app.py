import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import seaborn as sns
import matplotlib.pyplot as plt

# ============================
# PAGE CONFIG
# ============================
st.set_page_config(
    page_title="Sawit-ID Analytics",
    page_icon="🌴",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================
# CUSTOM CSS
# ============================
st.markdown("""
    <style>
    .main-header {
        font-size: 3rem;
        font-weight: 900;
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        text-align: center;
        color: #64748b;
        font-size: 1.2rem;
        margin-bottom: 2rem;
    }
    .info-box {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.08));
        padding: 1.5rem;
        border-radius: 12px;
        border-left: 4px solid #10b981;
        margin: 1rem 0;
    }
    .architecture-box {
        background: #f8fafc;
        padding: 1.5rem;
        border-radius: 12px;
        border: 2px solid #e2e8f0;
        margin: 1rem 0;
    }
    </style>
""", unsafe_allow_html=True)

# ============================
# HELPER FUNCTIONS
# ============================

@st.cache_data
def load_data():
    """Load sample data"""
    try:
        df = pd.read_csv('data/sample_data.csv')
        return df
    except FileNotFoundError:
        st.error("❌ File 'data/sample_data.csv' tidak ditemukan!")
        st.stop()

def classify_health(row):
    """Classify tree health based on multiple variables"""
    score = 0
    
    # pH Score (optimal: 5.5-7.0)
    if 5.5 <= row['ph_tanah'] <= 7.0:
        score += 2
    elif 5.0 <= row['ph_tanah'] < 5.5 or 7.0 < row['ph_tanah'] <= 7.5:
        score += 1
    
    # Kelembaban Score (optimal: 30-38%)
    if 30 <= row['kelembaban'] <= 38:
        score += 2
    elif 25 <= row['kelembaban'] < 30:
        score += 1
    
    # Janjang Score (optimal: 12-24)
    if 12 <= row['jumlah_janjang'] <= 24:
        score += 2
    elif 8 <= row['jumlah_janjang'] < 12:
        score += 1
    
    # Penyakit Score
    if row['penyakit'] == 0:
        score += 2
    
    # Tinggi Score (normal growth)
    if row['tinggi_cm'] >= 800:
        score += 2
    elif row['tinggi_cm'] >= 700:
        score += 1
    
    # Classification
    if score >= 8:
        return 'Baik'
    elif score >= 5:
        return 'Sedang'
    else:
        return 'Rusak'

# ============================
# MAIN APP
# ============================

def main():
    # Header
    st.markdown('<h1 class="main-header">🌴 Sawit-ID Analytics Dashboard</h1>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Sistem Informasi Manajemen Perkebunan Kelapa Sawit dengan Identifikasi Digital</p>', unsafe_allow_html=True)
    
    # ============================
    # SYSTEM ARCHITECTURE
    # ============================
    st.markdown("## 🏗️ System Architecture")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.markdown("""
        <div class="architecture-box">
        <h3 style="color: #059669; margin-bottom: 1rem;">📡 Data Collection Strategy</h3>
        
        <p><strong>1. RFID Tag (per pohon)</strong></p>
        <ul>
            <li>ID unik pohon (misal: POH-00001)</li>
            <li>Data dasar: varietas, tanggal tanam</li>
            <li>Cost: ~$2-3 per pohon</li>
        </ul>
        
        <p><strong>2. IoT Sensors (per cluster)</strong></p>
        <ul>
            <li>1 sensor kit untuk 50-100 pohon</li>
            <li>Ukur: pH, kelembaban, suhu</li>
            <li>Cost-effective & scalable</li>
        </ul>
        
        <p><strong>3. Manual Input (per pohon)</strong></p>
        <ul>
            <li>Via mobile app saat panen/inspeksi</li>
            <li>Data: jumlah janjang, berat TBS, kondisi</li>
            <li>Real-time sync ke cloud</li>
        </ul>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="architecture-box">
        <h3 style="color: #059669; margin-bottom: 1rem;">🗺️ Clustering Method</h3>
        
        <p><strong>Location-Based Clustering</strong></p>
        <p>Pohon dikelompokkan berdasarkan area/blok fisik perkebunan:</p>
        
        <ul>
            <li><strong>Cluster A (Utara)</strong><br>
                Tanah: Aluvial | Kondisi: Baik</li>
            <li><strong>Cluster B (Tengah)</strong><br>
                Tanah: Latosol | Kondisi: Sangat Baik</li>
            <li><strong>Cluster C (Selatan)</strong><br>
                Tanah: Organosol | Kondisi: Bermasalah</li>
        </ul>
        
        <p style="margin-top: 1rem; color: #64748b; font-size: 0.9rem;">
        <em>Catatan: Setiap cluster memiliki karakteristik tanah dan lingkungan yang berbeda, 
        sehingga sensor IoT dipasang per cluster untuk monitoring environmental data.</em>
        </p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # ============================
    # INFO BOX
    # ============================
    st.markdown("""
    <div class="info-box">
    <h4 style="color: #059669; margin-bottom: 0.5rem;">ℹ️ Tentang Dashboard Ini</h4>
    <p style="margin-bottom: 0.5rem;">
    Dashboard ini menampilkan <strong>simulasi data</strong> dari sistem Sawit-ID yang mengintegrasikan:
    </p>
    <ul style="margin-left: 1.5rem;">
        <li><strong>RFID data</strong> - Identifikasi pohon individual</li>
        <li><strong>IoT sensor data</strong> - Kondisi lingkungan per cluster (pH, kelembaban, suhu)</li>
        <li><strong>Manual input data</strong> - Hasil panen dan kondisi pohon dari pekerja lapangan</li>
    </ul>
    <p style="margin-top: 0.5rem; color: #475569;">
    Sistem melakukan klasifikasi kesehatan pohon secara otomatis berdasarkan 12 variabel dan 
    memberikan rekomendasi tindakan per cluster.
    </p>
    </div>
    """, unsafe_allow_html=True)
    
    # Sidebar
    with st.sidebar:
        st.image("https://via.placeholder.com/300x100/10b981/ffffff?text=Sawit-ID", use_container_width=True)
        st.markdown("## ⚙️ Settings")
        
        # Data source selection
        data_source = st.radio(
            "Sumber Data:",
            ["📁 Sample Data", "📤 Upload CSV"]
        )
        
        st.markdown("---")
        st.markdown("### 📊 Data Variables")
        st.info("""
        **12 Variabel Monitoring:**
        - pH Tanah (IoT)
        - Kelembaban (IoT)
        - Suhu (IoT)
        - Nitrogen (IoT)
        - Fosfor (IoT)
        - Intensitas Cahaya (IoT)
        - Curah Hujan (IoT)
        - Tinggi Pohon (Manual)
        - Jumlah Janjang (Manual)
        - Berat TBS (Manual)
        - Kondisi Daun (Manual)
        - Status Penyakit (Manual)
        """)
    
    # Load Data
    if data_source == "📁 Sample Data":
        df = load_data()
        st.success(f"✅ Loaded {len(df)} data pohon dari sample dataset")
    else:
        uploaded_file = st.file_uploader("Upload CSV file", type=['csv'])
        if uploaded_file is not None:
            df = pd.read_csv(uploaded_file)
            st.success(f"✅ Loaded {len(df)} data pohon dari file upload")
        else:
            st.warning("⚠️ Silakan upload file CSV terlebih dahulu")
            st.stop()
    
    # Data Preview
    with st.expander("📋 Lihat Raw Data (Integrasi RFID + IoT + Manual)"):
        st.dataframe(df, use_container_width=True)
        st.caption("""
        **Keterangan kolom:**
        - `id_pohon`: Data dari RFID tag
        - `cluster`: Location-based clustering (A/B/C)
        - `ph_tanah, kelembaban, suhu, dll`: Data dari IoT sensors per cluster
        - `jumlah_janjang, berat_tbs_kg`: Data manual input dari pekerja
        """)
    
    # Classify Health
    df['kesehatan'] = df.apply(classify_health, axis=1)
    
    # ============================
    # METRICS DASHBOARD
    # ============================
    st.markdown("## 📊 Overview Metrics")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            label="Total Pohon Termonitor",
            value=f"{len(df):,}",
            delta="Real-time tracking"
        )
    
    with col2:
        baik_count = len(df[df['kesehatan'] == 'Baik'])
        baik_pct = (baik_count / len(df)) * 100
        st.metric(
            label="Pohon Sehat",
            value=f"{baik_count}",
            delta=f"{baik_pct:.1f}%"
        )
    
    with col3:
        avg_tbs = df['berat_tbs_kg'].mean()
        st.metric(
            label="Avg Berat TBS",
            value=f"{avg_tbs:.1f} kg",
            delta="Per pohon"
        )
    
    with col4:
        diseased = len(df[df['penyakit'] == 1])
        st.metric(
            label="Terinfeksi Penyakit",
            value=f"{diseased}",
            delta=f"{(diseased/len(df)*100):.1f}%",
            delta_color="inverse"
        )
    
    st.markdown("---")
    
    # ============================
    # CLUSTERING VISUALIZATION
    # ============================
    st.markdown("## 🗺️ Clustering Analysis (Location-Based)")
    
    st.info("""
    **Clustering Method:** Location-based (Geographic)
    
    Pohon dikelompokkan berdasarkan area/blok fisik perkebunan, bukan karakteristik individual. 
    Setiap cluster memiliki sensor IoT tersendiri untuk monitoring kondisi lingkungan area tersebut.
    """)
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        # 3D Scatter Plot
        fig = px.scatter_3d(
            df,
            x='ph_tanah',
            y='kelembaban',
            z='tinggi_cm',
            color='cluster',
            size='berat_tbs_kg',
            hover_data=['id_pohon', 'kesehatan', 'jumlah_janjang'],
            title="3D Visualization: pH vs Kelembaban vs Tinggi (per Cluster)",
            labels={
                'ph_tanah': 'pH Tanah (IoT)',
                'kelembaban': 'Kelembaban % (IoT)',
                'tinggi_cm': 'Tinggi cm (Manual)'
            },
            color_discrete_map={'A': '#10b981', 'B': '#3b82f6', 'C': '#ef4444'}
        )
        fig.update_layout(height=500)
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.markdown("### Cluster Distribution")
        cluster_counts = df['cluster'].value_counts()
        
        fig_pie = px.pie(
            values=cluster_counts.values,
            names=cluster_counts.index,
            title="Distribusi Pohon per Cluster",
            color=cluster_counts.index,
            color_discrete_map={'A': '#10b981', 'B': '#3b82f6', 'C': '#ef4444'}
        )
        st.plotly_chart(fig_pie, use_container_width=True)
        
        # Cluster Stats
        st.markdown("### Cluster Statistics")
        
        cluster_info = {
            'A': {'name': 'Cluster A (Utara)', 'soil': 'Aluvial', 'color': '#10b981'},
            'B': {'name': 'Cluster B (Tengah)', 'soil': 'Latosol', 'color': '#3b82f6'},
            'C': {'name': 'Cluster C (Selatan)', 'soil': 'Organosol', 'color': '#ef4444'}
        }
        
        for cluster in ['A', 'B', 'C']:
            cluster_data = df[df['cluster'] == cluster]
            info = cluster_info[cluster]
            
            st.markdown(f"""
            <div style="background: {info['color']}15; padding: 1rem; border-radius: 8px; 
                        border-left: 4px solid {info['color']}; margin-bottom: 1rem;">
                <strong style="color: {info['color']};">{info['name']}</strong><br>
                <small style="color: #64748b;">Jenis Tanah: {info['soil']}</small><br><br>
                🌴 Pohon: {len(cluster_data)}<br>
                📊 Avg TBS: {cluster_data['berat_tbs_kg'].mean():.1f} kg<br>
                💧 Avg Kelembaban: {cluster_data['kelembaban'].mean():.1f}%<br>
                🌡️ Avg pH: {cluster_data['ph_tanah'].mean():.2f}
            </div>
            """, unsafe_allow_html=True)
    
    # ============================
    # HEALTH CLASSIFICATION
    # ============================
    st.markdown("## 🎯 Health Classification")
    
    st.info("""
    **Klasifikasi Otomatis** berdasarkan 5 parameter kunci:
    pH Tanah (IoT) | Kelembaban (IoT) | Jumlah Janjang (Manual) | Status Penyakit (Manual) | Tinggi Pohon (Manual)
    
    System memberikan score 0-10 dan mengklasifikasikan: Baik (8-10) | Sedang (5-7) | Rusak (0-4)
    """)
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        # Bar Chart
        health_counts = df['kesehatan'].value_counts()
        
        fig_bar = go.Figure(data=[
            go.Bar(
                x=health_counts.index,
                y=health_counts.values,
                marker_color=['#10b981', '#fbbf24', '#ef4444'],
                text=health_counts.values,
                textposition='outside'
            )
        ])
        fig_bar.update_layout(
            title="Distribusi Kesehatan Pohon",
            xaxis_title="Kategori",
            yaxis_title="Jumlah Pohon",
            height=400
        )
        st.plotly_chart(fig_bar, use_container_width=True)
    
    with col2:
        # Classification Cards
        st.markdown("### Classification Summary")
        
        for health, color, emoji in [
            ('Baik', '#10b981', '✅'),
            ('Sedang', '#fbbf24', '⚠️'),
            ('Rusak', '#ef4444', '❌')
        ]:
            count = len(df[df['kesehatan'] == health])
            pct = (count / len(df)) * 100
            
            st.markdown(f"""
            <div style="background: {color}15; padding: 1rem; border-radius: 8px; 
                        border-left: 4px solid {color}; margin-bottom: 1rem;">
                <h3 style="margin:0; color: {color};">{emoji} {health}</h3>
                <p style="font-size: 2rem; font-weight: bold; margin: 0.5rem 0; color: {color};">{count} pohon</p>
                <p style="margin:0; color: #666;">({pct:.1f}% dari total)</p>
            </div>
            """, unsafe_allow_html=True)
    
    # ============================
    # CORRELATION HEATMAP
    # ============================
    st.markdown("## 🔥 Correlation Analysis")
    
    st.info("""
    **Heatmap Korelasi** menunjukkan hubungan antar variabel. 
    Warna hijau = korelasi positif kuat | Warna merah = korelasi negatif kuat.
    
    Data berasal dari: IoT sensors (pH, kelembaban, suhu) + Manual input (janjang, TBS, tinggi)
    """)
    
    # Select numeric columns
    numeric_cols = ['ph_tanah', 'kelembaban', 'tinggi_cm', 'nitrogen', 'fosfor', 
                    'suhu', 'intensitas_cahaya', 'jumlah_janjang', 'berat_tbs_kg']
    
    corr_matrix = df[numeric_cols].corr()
    
    fig, ax = plt.subplots(figsize=(10, 8))
    sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='RdYlGn', center=0, 
                square=True, linewidths=1, cbar_kws={"shrink": 0.8}, ax=ax)
    plt.title('Correlation Matrix - Variabel Kesehatan Pohon', fontsize=14, fontweight='bold')
    st.pyplot(fig)
    
    # ============================
    # VARIABLE ANALYSIS
    # ============================
    st.markdown("## 📈 Variable Analysis")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        selected_var = st.selectbox(
            "Pilih variabel untuk analisis mendalam:",
            ['ph_tanah', 'kelembaban', 'tinggi_cm', 'nitrogen', 'fosfor', 
             'suhu', 'intensitas_cahaya', 'jumlah_janjang', 'berat_tbs_kg'],
            index=0
        )
    
    with col2:
        # Variable source info
        var_source = {
            'ph_tanah': 'IoT Sensor',
            'kelembaban': 'IoT Sensor',
            'suhu': 'IoT Sensor',
            'nitrogen': 'IoT Sensor',
            'fosfor': 'IoT Sensor',
            'intensitas_cahaya': 'IoT Sensor',
            'curah_hujan': 'IoT Sensor',
            'tinggi_cm': 'Manual Input',
            'jumlah_janjang': 'Manual Input',
            'berat_tbs_kg': 'Manual Input'
        }
        st.info(f"**Sumber Data:** {var_source.get(selected_var, 'Unknown')}")
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Box plot by health
        fig_box = px.box(
            df,
            x='kesehatan',
            y=selected_var,
            color='kesehatan',
            title=f"Distribusi {selected_var} by Kesehatan",
            color_discrete_map={'Baik': '#10b981', 'Sedang': '#fbbf24', 'Rusak': '#ef4444'}
        )
        st.plotly_chart(fig_box, use_container_width=True)
    
    with col2:
        # Histogram
        fig_hist = px.histogram(
            df,
            x=selected_var,
            color='kesehatan',
            title=f"Distribusi {selected_var}",
            nbins=20,
            color_discrete_map={'Baik': '#10b981', 'Sedang': '#fbbf24', 'Rusak': '#ef4444'}
        )
        st.plotly_chart(fig_hist, use_container_width=True)
    
    # ============================
    # RECOMMENDATIONS
    # ============================
    st.markdown("## 💡 Recommendations per Cluster")
    
    st.info("""
    Rekomendasi tindakan berdasarkan analisis data terintegrasi (RFID + IoT + Manual Input).
    Setiap cluster memiliki treatment yang disesuaikan dengan kondisi tanah dan kesehatan pohon di area tersebut.
    """)
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        cluster_a_health = df[df['cluster'] == 'A']['kesehatan'].value_counts()
        st.markdown(f"""
        <div style="background: rgba(16, 185, 129, 0.1); padding: 1.5rem; border-radius: 12px; 
                    border: 2px solid #10b981; height: 100%;">
            <h3 style="color: #10b981;">🌱 Cluster A (Utara)</h3>
            <p><strong>Jenis Tanah:</strong> Aluvial</p>
            <p><strong>Status:</strong> ✅ Baik</p>
            <hr style="border-color: #10b981;">
            <p><strong>Action Plan:</strong></p>
            <ul>
                <li>Maintain current practices</li>
                <li>Continue optimal fertilization</li>
                <li>Monitor pH (target: 6.0-6.5)</li>
            </ul>
            <p style="margin-top: 1rem;"><strong>Health Status:</strong><br>
            Baik: {cluster_a_health.get('Baik', 0)} pohon</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        cluster_b_health = df[df['cluster'] == 'B']['kesehatan'].value_counts()
        st.markdown(f"""
        <div style="background: rgba(59, 130, 246, 0.1); padding: 1.5rem; border-radius: 12px; 
                    border: 2px solid #3b82f6; height: 100%;">
            <h3 style="color: #3b82f6;">💧 Cluster B (Tengah)</h3>
            <p><strong>Jenis Tanah:</strong> Latosol</p>
            <p><strong>Status:</strong> ✅ Sangat Baik</p>
            <hr style="border-color: #3b82f6;">
            <p><strong>Action Plan:</strong></p>
            <ul>
                <li>Best performer - replicate practices</li>
                <li>Monitor moisture levels</li>
                <li>Ensure consistent irrigation</li>
            </ul>
            <p style="margin-top: 1rem;"><strong>Health Status:</strong><br>
            Baik: {cluster_b_health.get('Baik', 0)} pohon</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        cluster_c_health = df[df['cluster'] == 'C']['kesehatan'].value_counts()
        st.markdown(f"""
        <div style="background: rgba(239, 68, 68, 0.1); padding: 1.5rem; border-radius: 12px; 
                    border: 2px solid #ef4444; height: 100%;">
            <h3 style="color: #ef4444;">⚠️ Cluster C (Selatan)</h3>
            <p><strong>Jenis Tanah:</strong> Organosol (Gambut)</p>
            <p><strong>Status:</strong> ❌ Butuh Perhatian</p>
            <hr style="border-color: #ef4444;">
            <p><strong>Action Plan:</strong></p>
            <ul>
                <li><strong>URGENT:</strong> pH adjustment (add lime)</li>
                <li>Disease treatment required</li>
                <li>Improve drainage system</li>
                <li>Consider replanting severely damaged trees</li>
            </ul>
            <p style="margin-top: 1rem;"><strong>Health Status:</strong><br>
            Rusak: {cluster_c_health.get('Rusak', 0)} pohon ⚠️</p>
        </div>
        """, unsafe_allow_html=True)
    
    # ============================
    # FOOTER
    # ============================
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: #64748b; padding: 2rem;">
        <h3>🌴 Sawit-ID System</h3>
        <p>Sistem Informasi Manajemen Perkebunan Kelapa Sawit dengan Identifikasi Digital</p>
        <p style="font-size: 0.9rem;">
        <strong>Technology Stack:</strong> RFID (Identifikasi) + IoT Sensors (Monitoring) + Mobile App (Data Collection) + 
        Machine Learning (Classification) + Cloud Database (Storage)
        </p>
        <p style="font-size: 0.9rem; margin-top: 1rem;">
        Dashboard ini menampilkan integrasi data dari 3 sumber:<br>
        📡 RFID (ID pohon) | 🌡️ IoT Sensors (environmental data per cluster) | 📱 Manual Input (harvest & condition)
        </p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()