import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# ============================
# PAGE CONFIG
# ============================
st.set_page_config(
    page_title="Sawit-ID Dashboard - ML Clustering",
    page_icon="🌴",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ============================
# CUSTOM CSS - DARK MODE
# ============================
st.markdown("""
    <style>
    .stApp {
        background-color: #0f172a;
    }
    
    .big-title {
        font-size: 3rem;
        font-weight: bold;
        color: #10b981;
        text-align: center;
        margin-bottom: 0.5rem;
    }
    .subtitle {
        text-align: center;
        color: #cbd5e1;
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }
    .info-card {
        background: rgba(16, 185, 129, 0.1);
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 5px solid #10b981;
        margin: 1rem 0;
    }
    
    h1, h2, h3, h4, h5, h6 {
        color: #f1f5f9 !important;
    }
    
    p, span, div, li {
        color: #cbd5e1 !important;
    }
    
    [data-testid="stMetricValue"] {
        color: #f1f5f9 !important;
    }
    
    [data-testid="stMetricLabel"] {
        color: #cbd5e1 !important;
    }
    
    .stSelectbox label {
        color: #cbd5e1 !important;
    }
    </style>
""", unsafe_allow_html=True)

# ============================
# GENERATE SAMPLE DATA (CACHED)
# ============================
@st.cache_data(ttl=3600)
def create_sample_data():
    """Generate 30 pohon dengan variasi MIXED (tidak berurutan)"""
    np.random.seed(42)
    
    # Group 1: Sehat (10 pohon)
    sehat_data = {
        'id_pohon': [f'POH-{i:05d}' for i in range(1, 11)],
        'ph_tanah': np.random.uniform(6.0, 6.9, 10).round(1),
        'kelembaban': np.random.uniform(30, 38, 10).round(0).astype(int),
        'jumlah_janjang': np.random.randint(18, 25, 10),
        'berat_tbs': np.random.randint(42, 55, 10),
        'penyakit': [0] * 10
    }
    
    # Group 2: Sedang (10 pohon)
    sedang_data = {
        'id_pohon': [f'POH-{i:05d}' for i in range(11, 21)],
        'ph_tanah': np.random.uniform(5.5, 6.5, 10).round(1),
        'kelembaban': np.random.uniform(28, 32, 10).round(0).astype(int),
        'jumlah_janjang': np.random.randint(12, 19, 10),
        'berat_tbs': np.random.randint(35, 45, 10),
        'penyakit': [0] * 10
    }
    
    # Group 3: Rusak (10 pohon)
    rusak_data = {
        'id_pohon': [f'POH-{i:05d}' for i in range(21, 31)],
        'ph_tanah': np.random.uniform(4.8, 5.5, 10).round(1),
        'kelembaban': np.random.uniform(20, 28, 10).round(0).astype(int),
        'jumlah_janjang': np.random.randint(8, 13, 10),
        'berat_tbs': np.random.randint(20, 32, 10),
        'penyakit': [1] * 10
    }
    
    # Combine dan SHUFFLE
    df_sehat = pd.DataFrame(sehat_data)
    df_sedang = pd.DataFrame(sedang_data)
    df_rusak = pd.DataFrame(rusak_data)
    
    df = pd.concat([df_sehat, df_sedang, df_rusak], ignore_index=True)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    return df

# ============================
# K-MEANS CLUSTERING (CACHED)
# ============================
@st.cache_data(ttl=3600)
def perform_kmeans(df, n_clusters=3):
    """K-Means clustering berdasarkan pH, kelembaban, jumlah_janjang"""
    # Prepare features
    features = df[['ph_tanah', 'kelembaban', 'jumlah_janjang']].values
    
    # Normalize
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)
    
    # K-Means
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    cluster_labels = kmeans.fit_predict(features_scaled)
    
    # Create new df to avoid mutation
    df_clustered = df.copy()
    df_clustered['cluster_ml'] = cluster_labels
    
    # Assign cluster names berdasarkan centroid quality
    cluster_stats = df_clustered.groupby('cluster_ml')[['ph_tanah', 'kelembaban', 'jumlah_janjang']].mean()
    cluster_stats['score'] = (
        cluster_stats['ph_tanah'].rank() + 
        cluster_stats['kelembaban'].rank() + 
        cluster_stats['jumlah_janjang'].rank()
    )
    
    # Map to names
    sorted_clusters = cluster_stats.sort_values('score', ascending=False).index.tolist()
    cluster_map = {
        sorted_clusters[0]: 'A (Terbaik)',
        sorted_clusters[1]: 'B (Sedang)',
        sorted_clusters[2]: 'C (Perlu Perhatian)'
    }
    
    df_clustered['cluster_name'] = df_clustered['cluster_ml'].map(cluster_map)
    
    return df_clustered

# ============================
# HEALTH CLASSIFICATION
# ============================
def classify_health(row):
    """Klasifikasi kesehatan pohon (0-12 poin)"""
    score = 0
    
    # pH Check
    if 5.5 <= row['ph_tanah'] <= 7.0:
        score += 3
    elif 5.0 <= row['ph_tanah'] < 5.5:
        score += 1
    
    # Moisture Check
    if row['kelembaban'] >= 30:
        score += 3
    elif row['kelembaban'] >= 25:
        score += 1
    
    # Productivity Check
    if row['jumlah_janjang'] >= 18:
        score += 3
    elif row['jumlah_janjang'] >= 12:
        score += 1
    
    # Disease Check
    if row['penyakit'] == 0:
        score += 3
    
    # Classification
    if score >= 10:
        return 'Baik'
    elif score >= 6:
        return 'Sedang'
    else:
        return 'Rusak'

# ============================
# MAIN APP
# ============================
def main():
    # Header
    st.markdown('<p class="big-title">🌴 Sawit-ID Dashboard - ML Clustering</p>', unsafe_allow_html=True)
    st.markdown('<p class="subtitle">Machine Learning K-Means untuk Pattern Discovery dalam Monitoring Kelapa Sawit</p>', unsafe_allow_html=True)
    
    # Load Data & Clustering
    df = create_sample_data()
    df = perform_kmeans(df)
    df['kesehatan'] = df.apply(classify_health, axis=1)
    
    # ============================
    # INFO BOX - K-MEANS
    # ============================
    st.markdown("""
    <div class="info-card">
    <h3 style="color: #10b981; margin-top: 0;">🤖 Tentang K-Means Clustering</h3>
    <p><strong>Apa itu K-Means?</strong><br>
    Algoritma machine learning yang mengelompokkan pohon berdasarkan <strong>kesamaan karakteristik</strong>, 
    bukan lokasi geografis. Sistem otomatis menemukan pola tersembunyi dalam data!</p>
    
    <p><strong>Kenapa 3 Clusters?</strong><br>
    Berdasarkan analisis data, pohon kelapa sawit cenderung membentuk 3 kelompok alami:
    Terbaik, Sedang, dan Perlu Perhatian.</p>
    
    <p><strong>Fitur yang Digunakan:</strong><br>
    • pH Tanah (IoT Sensor)<br>
    • Kelembaban (IoT Sensor)<br>
    • Produktivitas - Jumlah Janjang (Input Manual)</p>
    
    <p><strong>Benefit vs Location-Based:</strong><br>
    ✅ Menemukan pohon dengan masalah serupa meskipun lokasi berbeda<br>
    ✅ Identifikasi pola yang tidak terlihat secara manual<br>
    ✅ Rekomendasi treatment lebih akurat per grup karakteristik</p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # ============================
    # METRICS
    # ============================
    st.markdown("## 📊 Ringkasan Data")
    
    col1, col2, col3, col4 = st.columns(4)
    
    total = len(df)
    baik = len(df[df['kesehatan'] == 'Baik'])
    sedang = len(df[df['kesehatan'] == 'Sedang'])
    rusak = len(df[df['kesehatan'] == 'Rusak'])
    
    col1.metric("Total Pohon", f"{total}", "Teranalisis")
    col2.metric("🟢 Sehat", f"{baik}", f"{baik/total*100:.0f}%")
    col3.metric("🟡 Sedang", f"{sedang}", f"{sedang/total*100:.0f}%")
    col4.metric("🔴 Rusak", f"{rusak}", f"{rusak/total*100:.0f}%")
    
    st.markdown("---")
    
    # ============================
    # 3D SCATTER PLOT
    # ============================
    st.markdown("## 🎯 Visualisasi K-Means Clustering (3D)")
    
    st.info("""
    **Cara Baca:** Setiap titik = 1 pohon. Warna = Cluster hasil K-Means. 
    Pohon dengan karakteristik mirip akan dikelompokkan bersama (dekat dalam ruang 3D).
    """)
    
    # Color mapping
    color_map = {
        'A (Terbaik)': '#10b981',
        'B (Sedang)': '#3b82f6',
        'C (Perlu Perhatian)': '#ef4444'
    }
    
    fig_3d = px.scatter_3d(
        df,
        x='ph_tanah',
        y='kelembaban',
        z='jumlah_janjang',
        color='cluster_name',
        color_discrete_map=color_map,
        hover_data=['id_pohon', 'kesehatan'],
        title="Distribusi Pohon dalam Ruang 3D (pH × Kelembaban × Produktivitas)",
        labels={
            'ph_tanah': 'pH Tanah',
            'kelembaban': 'Kelembaban (%)',
            'jumlah_janjang': 'Jumlah Janjang',
            'cluster_name': 'Cluster ML'
        },
        template="plotly_dark"
    )
    
    fig_3d.update_layout(
        height=600,
        scene=dict(
            xaxis_title='pH Tanah',
            yaxis_title='Kelembaban (%)',
            zaxis_title='Produktivitas (Janjang)'
        )
    )
    
    st.plotly_chart(fig_3d, use_container_width=True)
    
    st.markdown("---")
    
    # ============================
    # CLUSTER ANALYSIS
    # ============================
    st.markdown("## 📈 Analisis per Cluster ML")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        # Bar chart kesehatan per cluster
        cluster_health = pd.crosstab(df['cluster_name'], df['kesehatan'])
        
        fig_bar = go.Figure()
        
        if 'Baik' in cluster_health.columns:
            fig_bar.add_trace(go.Bar(
                name='Baik', 
                x=cluster_health.index, 
                y=cluster_health['Baik'], 
                marker_color='#10b981'
            ))
        
        if 'Sedang' in cluster_health.columns:
            fig_bar.add_trace(go.Bar(
                name='Sedang', 
                x=cluster_health.index, 
                y=cluster_health['Sedang'], 
                marker_color='#fbbf24'
            ))
        
        if 'Rusak' in cluster_health.columns:
            fig_bar.add_trace(go.Bar(
                name='Rusak', 
                x=cluster_health.index, 
                y=cluster_health['Rusak'], 
                marker_color='#ef4444'
            ))
        
        fig_bar.update_layout(
            title="Distribusi Kesehatan per Cluster ML",
            xaxis_title="Cluster",
            yaxis_title="Jumlah Pohon",
            barmode='group',
            height=400,
            template="plotly_dark"
        )
        
        st.plotly_chart(fig_bar, use_container_width=True)
    
    with col2:
        st.markdown("### Karakteristik Cluster")
        
        cluster_colors = {
            'A (Terbaik)': '#10b981',
            'B (Sedang)': '#3b82f6',
            'C (Perlu Perhatian)': '#ef4444'
        }
        
        for cluster in sorted(df['cluster_name'].unique()):
            cluster_data = df[df['cluster_name'] == cluster]
            avg_ph = cluster_data['ph_tanah'].mean()
            avg_kelembaban = cluster_data['kelembaban'].mean()
            avg_janjang = cluster_data['jumlah_janjang'].mean()
            
            color = cluster_colors.get(cluster, '#64748b')
            
            st.markdown(f"""
            <div style="background: {color}20; padding: 1rem; border-radius: 8px; 
                        border-left: 4px solid {color}; margin-bottom: 1rem;">
                <strong style="color: {color};">Cluster {cluster}</strong><br>
                <small style="color: #cbd5e1;">
                pH: {avg_ph:.1f} | Kelembaban: {avg_kelembaban:.0f}% | Janjang: {avg_janjang:.0f}
                </small><br>
                <span style="font-size: 0.9rem; color: #cbd5e1;">🌴 {len(cluster_data)} pohon</span>
            </div>
            """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # ============================
    # COMPARISON TABLE
    # ============================
    st.markdown("## 📋 Perbandingan Antar Cluster")
    
    comparison = df.groupby('cluster_name').agg({
        'ph_tanah': 'mean',
        'kelembaban': 'mean',
        'jumlah_janjang': 'mean',
        'berat_tbs': 'mean'
    }).round(1)
    
    comparison.columns = ['Rata-rata pH', 'Rata-rata Kelembaban (%)', 'Rata-rata Janjang', 'Rata-rata Berat TBS (kg)']
    comparison['Jumlah Pohon'] = df.groupby('cluster_name').size()
    
    st.dataframe(comparison, use_container_width=True)
    
    # Highlight best cluster
    best_cluster = comparison['Rata-rata Janjang'].idxmax()
    st.success(f"✨ **{best_cluster}** memiliki produktivitas tertinggi!")
    
    st.markdown("---")
    
    # ============================
    # HEALTH CLASSIFICATION
    # ============================
    st.markdown("## 🎯 Klasifikasi Kesehatan")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        # Pie chart
        health_counts = df['kesehatan'].value_counts()
        
        fig_pie = px.pie(
            values=health_counts.values,
            names=health_counts.index,
            title="Distribusi Kesehatan Pohon",
            color=health_counts.index,
            color_discrete_map={'Baik': '#10b981', 'Sedang': '#fbbf24', 'Rusak': '#ef4444'},
            template="plotly_dark"
        )
        
        st.plotly_chart(fig_pie, use_container_width=True)
    
    with col2:
        st.markdown("### Kriteria Penilaian")
        
        st.markdown("""
        **Sistem Scoring 0-12 Poin:**
        
        1. **pH Tanah** (IoT)
           - Optimal (5.5-7.0): +3 poin
           - Kurang (5.0-5.5): +1 poin
           - Buruk (<5.0): 0 poin
        
        2. **Kelembaban** (IoT)
           - Optimal (≥30%): +3 poin
           - Kurang (≥25%): +1 poin
           - Buruk (<25%): 0 poin
        
        3. **Produktivitas** (Manual)
           - Tinggi (≥18 janjang): +3 poin
           - Sedang (≥12 janjang): +1 poin
           - Rendah (<12 janjang): 0 poin
        
        4. **Penyakit** (Manual)
           - Sehat: +3 poin
           - Sakit: 0 poin
        
        **Kategori Akhir:**
        - 10-12 poin = 🟢 **Baik**
        - 6-9 poin = 🟡 **Sedang**
        - 0-5 poin = 🔴 **Rusak**
        """)
    
    st.markdown("---")
    
    # ============================
    # ML vs LOCATION COMPARISON
    # ============================
    st.markdown("## 🔄 ML Clustering vs Location-Based")
    
    st.markdown("""
    <div class="info-card">
    <h3 style="color: #10b981; margin-top: 0;">💡 Insight Utama</h3>
    <p><strong>Location-Based (Traditional):</strong><br>
    Mengelompokkan pohon berdasarkan LOKASI geografis (Area Utara, Tengah, Selatan). 
    Asumsi: pohon di area yang sama punya kondisi sama.</p>
    
    <p><strong>ML K-Means (Advanced):</strong><br>
    Mengelompokkan pohon berdasarkan KARAKTERISTIK AKTUAL (pH, kelembaban, produktivitas). 
    Menemukan pola: "Pohon dengan masalah serupa, meskipun lokasi berbeda!"</p>
    
    <p><strong>Contoh Kasus:</strong><br>
    🌴 Pohon POH-00005 dan POH-00023 mungkin berbeda lokasi, tapi punya karakteristik mirip → 
    Dikelompokkan bersama → Treatment yang sama efektif untuk keduanya!</p>
    
    <p><strong>Rekomendasi:</strong><br>
    ✅ Gunakan ML clustering untuk identifikasi pola dan root cause analysis<br>
    ✅ Gabungkan dengan location-based untuk perencanaan logistik lapangan<br>
    ✅ Update model setiap musim untuk adaptive learning</p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # ============================
    # DATA TABLE
    # ============================
    st.markdown("## 📄 Data Lengkap")
    
    display_df = df[['id_pohon', 'cluster_name', 'ph_tanah', 'kelembaban', 'jumlah_janjang', 'berat_tbs', 'penyakit', 'kesehatan']].copy()
    display_df.columns = ['ID Pohon', 'Cluster ML', 'pH', 'Kelembaban (%)', 'Janjang', 'Berat TBS (kg)', 'Penyakit', 'Kesehatan']
    display_df['Penyakit'] = display_df['Penyakit'].map({0: 'Sehat', 1: 'Sakit'})
    
    st.dataframe(display_df, use_container_width=True, height=400)
    
    # Download button
    csv = display_df.to_csv(index=False).encode('utf-8')
    st.download_button(
        label="📥 Download Data CSV",
        data=csv,
        file_name="sawit_ml_clustering.csv",
        mime="text/csv"
    )
    
    # ============================
    # FOOTER
    # ============================
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: #64748b; padding: 2rem;">
        <h3>🌴 Sawit-ID System v2.0</h3>
        <p>Machine Learning Clustering untuk Smart Agriculture</p>
        <p style="font-size: 0.9rem; margin-top: 1rem;">
        <strong>Powered by:</strong> K-Means Clustering (scikit-learn) | 
        RFID + IoT Sensors | Manual Input
        </p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()