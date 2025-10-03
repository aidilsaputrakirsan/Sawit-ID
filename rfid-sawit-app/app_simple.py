import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


# ============================
# PAGE CONFIG
# ============================
st.set_page_config(
    page_title="Sawit-ID Dashboard",
    page_icon="🌴",
    layout="wide"
)

# ============================
# CUSTOM CSS - DARK MODE (CONSISTENT)
# ============================
st.markdown("""
    <style>
    /* Dark background */
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
    
    /* All text white/light */
    h1, h2, h3, h4, h5, h6 {
        color: #f1f5f9 !important;
    }
    
    p, span, div, li {
        color: #cbd5e1 !important;
    }
    
    /* Metrics styling */
    [data-testid="stMetricValue"] {
        color: #f1f5f9 !important;
    }
    
    [data-testid="stMetricLabel"] {
        color: #cbd5e1 !important;
    }
    
    /* Selectbox text */
    .stSelectbox label {
        color: #cbd5e1 !important;
    }
    
    /* Caption text */
    .caption {
        color: #cbd5e1 !important;
    }
    </style>
""", unsafe_allow_html=True)

# ============================
# SAMPLE DATA (Built-in - No CSV needed!)
# ============================
@st.cache_data
def create_sample_data():
    """Generate sample data - SUPER SIMPLE, only 6 variables!"""
    data = {
        'id_pohon': [f'POH-{i:05d}' for i in range(1, 31)],
        'cluster': ['A']*10 + ['B']*10 + ['C']*10,
        
        # IoT Sensor Data (per cluster)
        'ph_tanah': [6.2, 6.1, 6.3, 6.0, 6.4, 6.2, 6.1, 6.3, 6.2, 6.1,  # Cluster A
                     6.8, 6.7, 6.9, 6.6, 6.8, 6.7, 6.8, 6.9, 6.7, 6.8,  # Cluster B
                     5.2, 5.0, 5.3, 5.1, 5.2, 5.0, 5.1, 5.3, 5.2, 5.1], # Cluster C
        
        'kelembaban': [32, 31, 33, 30, 34, 32, 31, 33, 32, 31,  # A: Good
                       36, 35, 37, 34, 36, 35, 36, 37, 35, 36,  # B: Very Good
                       26, 25, 27, 24, 26, 25, 26, 27, 26, 25], # C: Low
        
        # Manual Input Data (per pohon)
        'jumlah_janjang': [18, 17, 19, 16, 20, 18, 17, 19, 18, 17,  # A: Good
                           22, 21, 23, 20, 22, 21, 22, 23, 21, 22,  # B: Excellent
                           10, 9, 11, 8, 10, 9, 10, 11, 10, 9],     # C: Low
        
        'berat_tbs': [45, 43, 47, 42, 48, 45, 43, 47, 45, 43,  # A
                      52, 50, 54, 48, 52, 50, 52, 54, 50, 52,  # B
                      28, 26, 30, 24, 28, 26, 28, 30, 28, 26], # C
        
        'penyakit': [0]*20 + [1]*10  # A & B: Sehat, C: Sakit
    }
    return pd.DataFrame(data)

# ============================
# SIMPLE HEALTH CLASSIFICATION
# ============================
def classify_simple(row):
    """Simple classification - easy to explain!"""
    score = 0
    
    # Rule 1: pH Check
    if 5.5 <= row['ph_tanah'] <= 7.0:
        score += 3
    elif 5.0 <= row['ph_tanah'] < 5.5:
        score += 1
    
    # Rule 2: Moisture Check
    if row['kelembaban'] >= 30:
        score += 3
    elif row['kelembaban'] >= 25:
        score += 1
    
    # Rule 3: Productivity Check
    if row['jumlah_janjang'] >= 18:
        score += 3
    elif row['jumlah_janjang'] >= 12:
        score += 1
    
    # Rule 4: Disease Check
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
    st.markdown('<p class="big-title">🌴 Sawit-ID Dashboard</p>', unsafe_allow_html=True)
    st.markdown('<p class="subtitle">Monitoring Kesehatan Pohon Kelapa Sawit dengan Teknologi RFID + IoT</p>', unsafe_allow_html=True)
    
    # Load Data
    df = create_sample_data()
    df['kesehatan'] = df.apply(classify_simple, axis=1)
    
    # Info Box
    st.markdown("""
    <div class="info-card">
    <h3 style="color: #10b981; margin-top: 0;">ℹ️ Cara Kerja Sistem</h3>
    <p><strong>1. RFID Tag</strong> → Setiap pohon punya ID unik (seperti KTP)</p>
    <p><strong>2. IoT Sensors</strong> → 1 sensor untuk 100 pohon, ukur pH & kelembaban</p>
    <p><strong>3. Input Manual</strong> → Petani catat hasil panen & kondisi pohon</p>
    <p><strong>4. Klasifikasi Otomatis</strong> → Sistem nilai kesehatan pohon: Baik / Sedang / Rusak</p>
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
    
    col1.metric("Total Pohon", f"{total}", "Termonitor")
    col2.metric("🟢 Sehat", f"{baik}", f"{baik/total*100:.0f}%")
    col3.metric("🟡 Sedang", f"{sedang}", f"{sedang/total*100:.0f}%")
    col4.metric("🔴 Rusak", f"{rusak}", f"{rusak/total*100:.0f}%")
    
    st.markdown("---")
    
    # ============================
    # CLUSTER ANALYSIS
    # ============================
    st.markdown("## 🗺️ Analisis per Area (Cluster)")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        # Simple Bar Chart - Easy to read!
        cluster_health = pd.crosstab(df['cluster'], df['kesehatan'])
        
        fig = go.Figure()
        fig.add_trace(go.Bar(name='Baik', x=cluster_health.index, y=cluster_health['Baik'], 
                             marker_color='#10b981'))
        fig.add_trace(go.Bar(name='Sedang', x=cluster_health.index, y=cluster_health.get('Sedang', [0]*3), 
                             marker_color='#fbbf24'))
        fig.add_trace(go.Bar(name='Rusak', x=cluster_health.index, y=cluster_health.get('Rusak', [0]*3), 
                             marker_color='#ef4444'))
        
        fig.update_layout(
            title="Kesehatan Pohon per Cluster",
            xaxis_title="Cluster (Area)",
            yaxis_title="Jumlah Pohon",
            barmode='group',
            height=400
        )
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.markdown("### Info Cluster")
        
        clusters = {
            'A': {'name': 'Area Utara', 'soil': 'Aluvial', 'color': '#10b981'},
            'B': {'name': 'Area Tengah', 'soil': 'Latosol', 'color': '#3b82f6'},
            'C': {'name': 'Area Selatan', 'soil': 'Organosol', 'color': '#ef4444'}
        }
        
        for cluster_id, info in clusters.items():
            cluster_data = df[df['cluster'] == cluster_id]
            st.markdown(f"""
            <div style="background: {info['color']}20; padding: 1rem; border-radius: 8px; 
                        border-left: 4px solid {info['color']}; margin-bottom: 1rem;">
                <strong style="color: {info['color']};">Cluster {cluster_id}</strong><br>
                <small style="color: #cbd5e1;">{info['name']} - {info['soil']}</small><br>
                <span style="font-size: 0.9rem; color: #cbd5e1;">🌴 {len(cluster_data)} pohon</span>
            </div>
            """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # ============================
    # SIMPLE COMPARISON
    # ============================
    st.markdown("## 📈 Perbandingan Variabel Penting")
    
    st.info("""
    **3 Variabel Utama** yang mempengaruhi kesehatan pohon:
    - **pH Tanah** (dari IoT sensor) - Optimal: 5.5-7.0
    - **Kelembaban** (dari IoT sensor) - Optimal: 30-38%
    - **Produktivitas** (dari input manual) - Optimal: 18+ janjang/tahun
    """)
    
    # Select variable to compare
    var_option = st.selectbox(
        "Pilih variabel untuk dibandingkan:",
        ["pH Tanah", "Kelembaban", "Produktivitas (Jumlah Janjang)"],
        index=0
    )
    
    var_map = {
        "pH Tanah": "ph_tanah",
        "Kelembaban": "kelembaban",
        "Produktivitas (Jumlah Janjang)": "jumlah_janjang"
    }
    
    selected_var = var_map[var_option]
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Box plot - simple comparison
        fig_box = px.box(
            df, 
            x='cluster', 
            y=selected_var,
            color='cluster',
            title=f"{var_option} per Cluster",
            color_discrete_map={'A': '#10b981', 'B': '#3b82f6', 'C': '#ef4444'}
        )
        fig_box.update_layout(showlegend=False)
        st.plotly_chart(fig_box, use_container_width=True)
        
        st.caption(f"""
        **Cara Baca:** 
        - Kotak tinggi = Nilai bagus
        - Kotak rendah = Nilai kurang bagus
        - Garis tengah = Nilai rata-rata
        """)
    
    with col2:
        # Simple stats table
        st.markdown("### Statistik per Cluster")
        
        stats = df.groupby('cluster')[selected_var].agg(['mean', 'min', 'max']).round(1)
        stats.columns = ['Rata-rata', 'Minimum', 'Maximum']
        
        st.dataframe(stats, use_container_width=True)
        
        # Best cluster
        best_cluster = stats['Rata-rata'].idxmax()
        st.success(f"✨ **Cluster {best_cluster}** punya nilai terbaik untuk {var_option}!")
    
    st.markdown("---")
    
    # ============================
    # HEALTH CLASSIFICATION
    # ============================
    st.markdown("## 🎯 Klasifikasi Kesehatan")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        # Pie chart - simple!
        health_counts = df['kesehatan'].value_counts()
        
        fig_pie = px.pie(
            values=health_counts.values,
            names=health_counts.index,
            title="Distribusi Kesehatan Pohon",
            color=health_counts.index,
            color_discrete_map={'Baik': '#10b981', 'Sedang': '#fbbf24', 'Rusak': '#ef4444'}
        )
        st.plotly_chart(fig_pie, use_container_width=True)
    
    with col2:
        st.markdown("### Kriteria Penilaian")
        
        st.markdown("""
        **Sistem memberi nilai 0-12 poin:**
        
        1. **pH Tanah** (IoT)
           - Bagus (5.5-7.0): +3 poin
           - Kurang (5.0-5.5): +1 poin
           - Buruk (<5.0): 0 poin
        
        2. **Kelembaban** (IoT)
           - Bagus (≥30%): +3 poin
           - Kurang (≥25%): +1 poin
           - Buruk (<25%): 0 poin
        
        3. **Produktivitas** (Manual)
           - Bagus (≥18 janjang): +3 poin
           - Kurang (≥12 janjang): +1 poin
           - Buruk (<12 janjang): 0 poin
        
        4. **Penyakit** (Manual)
           - Sehat: +3 poin
           - Sakit: 0 poin
        
        **Hasil:**
        - 10-12 poin = 🟢 **Baik**
        - 6-9 poin = 🟡 **Sedang**
        - 0-5 poin = 🔴 **Rusak**
        """)
    
    st.markdown("---")
    
    # ============================
    # RECOMMENDATIONS
    # ============================
    st.markdown("## 💡 Rekomendasi Tindakan")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        <div style="background: #10b98120; padding: 1.5rem; border-radius: 12px; height: 100%;">
            <h3 style="color: #10b981;">✅ Cluster A</h3>
            <p><strong>Status:</strong> Baik</p>
            <hr style="border-color: #10b981;">
            <p><strong>Tindakan:</strong></p>
            <ul>
                <li>Pertahankan perawatan</li>
                <li>Monitor pH rutin</li>
                <li>Lanjutkan pemupukan</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div style="background: #3b82f620; padding: 1.5rem; border-radius: 12px; height: 100%;">
            <h3 style="color: #3b82f6;">⭐ Cluster B</h3>
            <p><strong>Status:</strong> Sangat Baik</p>
            <hr style="border-color: #3b82f6;">
            <p><strong>Tindakan:</strong></p>
            <ul>
                <li>Referensi terbaik!</li>
                <li>Tiru metode ke cluster lain</li>
                <li>Monitor kelembaban</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div style="background: #ef444420; padding: 1.5rem; border-radius: 12px; height: 100%;">
            <h3 style="color: #ef4444;">⚠️ Cluster C</h3>
            <p><strong>Status:</strong> URGENT!</p>
            <hr style="border-color: #ef4444;">
            <p><strong>Tindakan:</strong></p>
            <ul>
                <li><strong>Prioritas tinggi!</strong></li>
                <li>Naikkan pH (tambah kapur)</li>
                <li>Obati penyakit</li>
                <li>Pertimbangkan replanting</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    
    # ============================
    # DATA TABLE
    # ============================
    st.markdown("---")
    st.markdown("## 📋 Data Lengkap")
    
    # Simple table view
    display_df = df[['id_pohon', 'cluster', 'ph_tanah', 'kelembaban', 'jumlah_janjang', 'berat_tbs', 'kesehatan']]
    display_df.columns = ['ID Pohon', 'Cluster', 'pH', 'Kelembaban (%)', 'Janjang', 'Berat TBS (kg)', 'Kesehatan']
    
    st.dataframe(display_df, use_container_width=True, height=300)
    
    # ============================
    # FOOTER
    # ============================
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: #64748b; padding: 2rem;">
        <h3>🌴 Sawit-ID System</h3>
        <p>Dashboard Sederhana untuk Monitoring Perkebunan Kelapa Sawit</p>
        <p style="font-size: 0.9rem; margin-top: 1rem;">
        <strong>Data Sources:</strong> RFID (ID) + IoT Sensors (pH, Kelembaban) + Manual Input (Panen, Kondisi)
        </p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()