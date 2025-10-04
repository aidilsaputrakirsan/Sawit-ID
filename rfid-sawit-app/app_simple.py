import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go

# PAGE CONFIG
st.set_page_config(
    page_title="Sawit-ID Dashboard",
    page_icon="🌴",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# CUSTOM CSS
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
    </style>
""", unsafe_allow_html=True)

# LOAD DATA
@st.cache_data(ttl=3600)
def load_data():
    try:
        df = pd.read_csv('data/sample_data_location.csv')
    except:
        try:
            df = pd.read_csv('sample_data_location.csv')
        except:
            df = create_fallback_data()
    return df

def create_fallback_data():
    """Fallback with FIXED coordinates (tidak random)"""
    # Data sudah ditentukan, tidak pakai random
    data = []
    pohon_id = 1
    clusters = ['A'] * 35 + ['B'] * 35 + ['C'] * 30
    spacing = 9
    row_offset = spacing * 0.866
    
    # Pre-defined values untuk konsistensi
    ph_values_A = [6.4, 6.7, 6.2, 6.8, 6.5, 6.9, 6.3, 6.6, 6.1, 6.7] * 4  # Repeat pattern
    kelembaban_A = [35, 34, 32, 36, 33, 37, 31, 35, 30, 34] * 4
    janjang_A = [21, 20, 19, 22, 20, 23, 18, 21, 19, 22] * 4
    
    ph_values_B = [6.1, 5.9, 6.3, 5.7, 6.2, 5.8, 6.4, 6.0, 5.6, 6.2] * 4
    kelembaban_B = [31, 29, 32, 28, 33, 30, 34, 31, 29, 32] * 4
    janjang_B = [16, 15, 18, 14, 17, 16, 19, 15, 14, 17] * 4
    
    ph_values_C = [5.3, 5.0, 5.5, 4.9, 5.4, 5.1, 5.6, 5.2, 4.8, 5.3] * 3
    kelembaban_C = [26, 24, 27, 23, 26, 25, 28, 24, 22, 27] * 3
    janjang_C = [11, 9, 12, 8, 11, 10, 13, 9, 8, 12] * 3
    
    for i, cluster in enumerate(clusters):
        row = i // 10
        col = i % 10
        
        if cluster == 'A':
            base_x, base_y = 50, 200
            idx = i
            ph = ph_values_A[idx]
            kelembaban = kelembaban_A[idx]
            janjang = janjang_A[idx]
            berat = janjang * 2 + 5  # Formula tetap
            penyakit = 0
        elif cluster == 'B':
            base_x, base_y = 50, 170
            idx = i - 35
            ph = ph_values_B[idx]
            kelembaban = kelembaban_B[idx]
            janjang = janjang_B[idx]
            berat = janjang * 2 + 5
            penyakit = 1 if idx % 5 == 3 else 0  # Pattern tetap
        else:
            base_x, base_y = 50, 140
            idx = i - 70
            ph = ph_values_C[idx]
            kelembaban = kelembaban_C[idx]
            janjang = janjang_C[idx]
            berat = janjang * 2 + 5
            penyakit = 1 if idx % 3 != 2 else 0  # Pattern tetap
        
        x = base_x + (col * spacing)
        if row % 2 == 1:
            x += spacing / 2
        y = base_y + (row * row_offset)
        
        data.append({
            'id_pohon': f'{pohon_id:05d}',
            'cluster': cluster,
            'koordinat_x': round(x, 1),
            'koordinat_y': round(y, 1),
            'ph_tanah': ph,
            'kelembaban': kelembaban,
            'jumlah_janjang': janjang,
            'berat_tbs_kg': berat,
            'penyakit': penyakit
        })
        pohon_id += 1
    
    return pd.DataFrame(data)

def classify_health(row):
    score = 0
    if 5.5 <= row['ph_tanah'] <= 7.0:
        score += 3
    elif 5.0 <= row['ph_tanah'] < 5.5:
        score += 1
    
    if row['kelembaban'] >= 30:
        score += 3
    elif row['kelembaban'] >= 25:
        score += 1
    
    if row['jumlah_janjang'] >= 18:
        score += 3
    elif row['jumlah_janjang'] >= 12:
        score += 1
    
    if row['penyakit'] == 0:
        score += 3
    
    if score >= 10:
        return 'Baik'
    elif score >= 6:
        return 'Sedang'
    else:
        return 'Rusak'

# MAIN APP
def main():
    # Header
    st.markdown('<p class="big-title">🌴 Sawit-ID Dashboard</p>', unsafe_allow_html=True)
    st.markdown('<p class="subtitle">Monitoring Kesehatan Pohon Kelapa Sawit dengan Teknologi RFID + IoT</p>', unsafe_allow_html=True)
    
    # Load Data
    df = load_data()
    df['kesehatan'] = df.apply(classify_health, axis=1)
    
    # Info Box
    st.markdown("""
    <div class="info-card">
    <h3 style="color: #10b981; margin-top: 0;">ℹ️ Cara Kerja Sistem</h3>
    <p><strong>1. RFID Tag</strong> → Setiap pohon punya ID unik</p>
    <p><strong>2. IoT Sensors</strong> → Ukur pH & kelembaban per area</p>
    <p><strong>3. Input Manual</strong> → Petani catat hasil panen & kondisi pohon</p>
    <p><strong>4. Klasifikasi Otomatis</strong> → Sistem nilai kesehatan: Baik / Sedang / Rusak</p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # METRICS
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
    
    # 3D MAP
    st.markdown("## 🗺️ Peta Lokasi Pohon (3D View)")
    
    st.info("""
    **Visualisasi 3D - 100 pohon dengan pola tanam TRIANGULAR:**
    - 🟢 Hijau = Cluster A (Utara) | 🔵 Biru = Cluster B (Tengah) | 🔴 Merah = Cluster C (Selatan)
    - **Tip:** Drag untuk rotate, scroll untuk zoom, double-click untuk reset
    """)
    
    # Create 3D scatter manually untuk kontrol penuh
    fig = go.Figure()
    
    # Add trace untuk setiap cluster
    for cluster, color, name in [('A', '#10b981', 'Cluster A'), 
                                   ('B', '#3b82f6', 'Cluster B'), 
                                   ('C', '#ef4444', 'Cluster C')]:
        df_cluster = df[df['cluster'] == cluster]
        
        fig.add_trace(go.Scatter3d(
            x=df_cluster['koordinat_x'],
            y=df_cluster['koordinat_y'],
            z=[0] * len(df_cluster),
            mode='markers',
            name=name,
            marker=dict(
                size=8,
                color=color,
                opacity=0.8,
                line=dict(color='white', width=0.5)
            ),
            text=[f"ID: {row['id_pohon']}<br>Kesehatan: {row['kesehatan']}<br>pH: {row['ph_tanah']}<br>Kelembaban: {row['kelembaban']}%<br>Janjang: {row['jumlah_janjang']}" 
                  for _, row in df_cluster.iterrows()],
            hovertemplate='%{text}<extra></extra>'
        ))
    
    fig.update_layout(
        height=600,
        template="plotly_dark",
        scene=dict(
            xaxis=dict(title='Koordinat X (Timur-Barat)', range=[40, 145]),
            yaxis=dict(title='Koordinat Y (Utara-Selatan)', range=[135, 230]),
            zaxis=dict(title='Elevasi', range=[-5, 5], showticklabels=False),
            camera=dict(eye=dict(x=1.5, y=-1.5, z=1.3)),
            aspectmode='manual',
            aspectratio=dict(x=1, y=0.9, z=0.2)
        ),
        showlegend=True,
        legend=dict(x=0.85, y=0.95)
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Keterangan
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown("""
        <div style="background: #10b98120; padding: 1rem; border-radius: 8px; border-left: 4px solid #10b981;">
            <strong style="color: #10b981;">🟢 Cluster A - Utara</strong><br>
            <small style="color: #cbd5e1;">Y: 200-223m | Sehat</small>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div style="background: #3b82f620; padding: 1rem; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <strong style="color: #3b82f6;">🔵 Cluster B - Tengah</strong><br>
            <small style="color: #cbd5e1;">Y: 170-193m | Sedang</small>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div style="background: #ef444420; padding: 1rem; border-radius: 8px; border-left: 4px solid #ef4444;">
            <strong style="color: #ef4444;">🔴 Cluster C - Selatan</strong><br>
            <small style="color: #cbd5e1;">Y: 140-155m | Rusak</small>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # HEALTH DISTRIBUTION
    st.markdown("## 📊 Distribusi Kesehatan Pohon")
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Pie Chart - Overall Health
        health_counts = df['kesehatan'].value_counts()
        
        fig_pie = go.Figure(data=[go.Pie(
            labels=health_counts.index,
            values=health_counts.values,
            marker=dict(colors=['#10b981', '#fbbf24', '#ef4444']),
            hole=0.4
        )])
        
        fig_pie.update_layout(
            title="Distribusi Kesehatan Total",
            template="plotly_dark",
            height=400
        )
        
        st.plotly_chart(fig_pie, use_container_width=True)
    
    with col2:
        # Bar Chart - Health per Cluster
        cluster_health = pd.crosstab(df['cluster'], df['kesehatan'])
        
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
            title="Kesehatan per Cluster",
            xaxis_title="Cluster",
            yaxis_title="Jumlah Pohon",
            barmode='group',
            template="plotly_dark",
            height=400
        )
        
        st.plotly_chart(fig_bar, use_container_width=True)
    
    st.markdown("---")
    
    # SUMMARY STATISTICS
    st.markdown("## 📈 Ringkasan Statistik per Cluster")
    
    summary = df.groupby('cluster').agg({
        'id_pohon': 'count',
        'ph_tanah': 'mean',
        'kelembaban': 'mean',
        'jumlah_janjang': 'mean',
        'berat_tbs_kg': 'mean',
        'penyakit': lambda x: (x == 0).sum()
    }).round(1)
    
    summary.columns = ['Jumlah Pohon', 'Rata² pH', 'Rata² Kelembaban (%)', 'Rata² Janjang', 'Rata² Berat TBS (kg)', 'Pohon Sehat']
    summary['% Sehat'] = (summary['Pohon Sehat'] / summary['Jumlah Pohon'] * 100).round(1)
    
    st.dataframe(summary, use_container_width=True)
    
    # Insight Box
    best_cluster = summary['Rata² Janjang'].idxmax()
    worst_cluster = summary['Rata² Janjang'].idxmin()
    
    st.success(f"✅ **Cluster {best_cluster}** memiliki produktivitas tertinggi ({summary.loc[best_cluster, 'Rata² Janjang']:.1f} janjang/pohon)")
    st.error(f"⚠️ **Cluster {worst_cluster}** memerlukan perhatian khusus ({summary.loc[worst_cluster, 'Rata² Janjang']:.1f} janjang/pohon)")
    
    st.markdown("---")
    
    # DATA TABLE
    st.markdown("## 📋 Data Lengkap Pohon")
    
    display_df = df[['id_pohon', 'cluster', 'koordinat_x', 'koordinat_y', 'ph_tanah', 'kelembaban', 'jumlah_janjang', 'berat_tbs_kg', 'kesehatan']].copy()
    display_df.columns = ['ID', 'Area', 'X (m)', 'Y (m)', 'pH', 'Kelembaban (%)', 'Janjang', 'Berat (kg)', 'Kesehatan']
    
    st.dataframe(display_df, use_container_width=True, height=400)
    
    # FOOTER
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: #64748b; padding: 2rem;">
        <h3>🌴 Sawit-ID System</h3>
        <p>Dashboard Monitoring Perkebunan Kelapa Sawit</p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()