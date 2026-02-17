import { Chart as ChartJS } from "chart.js/auto";
import { Bar } from "react-chartjs-2";

export default function MonthlyPerformanceChart({ data }) {
  // Calculate summary stats
  const totalPracticeTime = data.reduce((sum, d) => sum + Number(d.practice_seconds), 0);
  const totalQuizzes = data.reduce((sum, d) => sum + Number(d.quizzes_taken), 0);
  const totalCorrect = data.reduce((sum, d) => sum + Number(d.correct_answers), 0);
  const avgAccuracy = totalQuizzes > 0 ? ((totalCorrect / totalQuizzes) * 100).toFixed(1) : 0;

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      // 🔵 PRACTICE TIME (BAR) - This will show as BARS
      {
        type: "bar",
        label: "Practice Time (hours)",
        data: data.map(d => Number((d.practice_seconds / 3600).toFixed(2))),
        backgroundColor: "rgba(102, 126, 234, 0.7)",
        borderColor: "#667eea",
        borderWidth: 2,
        borderRadius: 6,
        yAxisID: "y",
        barThickness: 35,
        maxBarThickness: 40
      },
      // 🟢 AI QUESTIONS (LINE)
      {
        type: "line",
        label: "AI Questions",
        data: data.map(d => Number(d.ai_questions)),
        borderColor: "#10b981",
        backgroundColor: "#10b981",
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        borderWidth: 3,
        yAxisID: "y1"
      },
      // 🟠 QUIZZES TAKEN (LINE)
      {
        type: "line",
        label: "Quizzes Taken",
        data: data.map(d => Number(d.quizzes_taken)),
        borderColor: "#f59e0b",
        backgroundColor: "#f59e0b",
        pointBackgroundColor: "#f59e0b",
        pointBorderColor: "#fff",
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        borderWidth: 3,
        yAxisID: "y1"
      },
      // 🔴 CORRECT ANSWERS (LINE)
      {
        type: "line",
        label: "Correct Answers",
        data: data.map(d => Number(d.correct_answers)),
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
        pointBackgroundColor: "#ef4444",
        pointBorderColor: "#fff",
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        borderWidth: 3,
        yAxisID: "y1"
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: "index",
      intersect: false
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 13,
            weight: "600"
          },
          color: "#64748b"
        }
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 16,
        titleColor: "#fff",
        titleFont: {
          size: 14,
          weight: "700"
        },
        bodyColor: "#fff",
        bodyFont: {
          size: 13
        },
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label === "Practice Time (hours)") {
                const hours = Math.floor(context.parsed.y);
                const mins = Math.round((context.parsed.y - hours) * 60);
                label += hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: "linear",
        position: "left",
        beginAtZero: true,
        grace: "10%",
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 12,
            weight: "600"
          },
          padding: 10,
          callback: function(value) {
            return value + "h";
          }
        },
        title: {
          display: true,
          text: "Practice Time (hours)",
          color: "#667eea",
          font: {
            size: 13,
            weight: "700"
          },
          padding: 10
        }
      },
      y1: {
        type: "linear",
        position: "right",
        beginAtZero: true,
        grace: "10%",
        grid: {
          drawOnChartArea: false,
          drawBorder: false
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 12,
            weight: "600"
          },
          padding: 10
        },
        title: {
          display: true,
          text: "Activity Count",
          color: "#10b981",
          font: {
            size: 13,
            weight: "700"
          },
          padding: 10
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 12,
            weight: "600"
          },
          padding: 10
        }
      }
    }
  };

  return (
    <div>
      {/* Summary Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 16,
        marginBottom: 30
      }}>
        <div style={{
          padding: 16,
          background: "linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
          borderRadius: 12,
          borderLeft: "4px solid #667eea"
        }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: "600", marginBottom: 6 }}>TOTAL TIME</div>
          <div style={{ fontSize: 24, fontWeight: "700", color: "#667eea" }}>
            {Math.floor(totalPracticeTime / 3600)}h {Math.floor((totalPracticeTime % 3600) / 60)}m
          </div>
        </div>

        <div style={{
          padding: 16,
          background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.1) 100%)",
          borderRadius: 12,
          borderLeft: "4px solid #10b981"
        }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: "600", marginBottom: 6 }}>QUESTIONS</div>
          <div style={{ fontSize: 24, fontWeight: "700", color: "#10b981" }}>
            {data.reduce((sum, d) => sum + Number(d.ai_questions), 0)}
          </div>
        </div>

        <div style={{
          padding: 16,
          background: "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.1) 100%)",
          borderRadius: 12,
          borderLeft: "4px solid #f59e0b"
        }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: "600", marginBottom: 6 }}>QUIZZES</div>
          <div style={{ fontSize: 24, fontWeight: "700", color: "#f59e0b" }}>
            {totalQuizzes}
          </div>
        </div>

        <div style={{
          padding: 16,
          background: "linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.1) 100%)",
          borderRadius: 12,
          borderLeft: "4px solid #ef4444"
        }}>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: "600", marginBottom: 6 }}>ACCURACY</div>
          <div style={{ fontSize: 24, fontWeight: "700", color: "#ef4444" }}>
            {avgAccuracy}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{
        padding: 20,
        background: "#f8f9fa",
        borderRadius: 12,
        minHeight: "400px"
      }}>
        <Bar data={chartData} options={options} />
      </div>

      {/* Month Details Table */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16, color: "#1e293b", marginBottom: 16, fontWeight: "700" }}>📅 Monthly Breakdown</h3>
        <div style={{
          overflowX: "auto",
          borderRadius: 12,
          border: "1px solid #e5e7eb"
        }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14
          }}>
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                <th style={{ padding: 12, textAlign: "left", fontWeight: "700", color: "#64748b", borderBottom: "2px solid #e5e7eb" }}>Month</th>
                <th style={{ padding: 12, textAlign: "center", fontWeight: "700", color: "#64748b", borderBottom: "2px solid #e5e7eb" }}>⏱️ Time</th>
                <th style={{ padding: 12, textAlign: "center", fontWeight: "700", color: "#64748b", borderBottom: "2px solid #e5e7eb" }}>🤖 Questions</th>
                <th style={{ padding: 12, textAlign: "center", fontWeight: "700", color: "#64748b", borderBottom: "2px solid #e5e7eb" }}>📝 Quizzes</th>
                <th style={{ padding: 12, textAlign: "center", fontWeight: "700", color: "#64748b", borderBottom: "2px solid #e5e7eb" }}>✅ Correct</th>
                <th style={{ padding: 12, textAlign: "center", fontWeight: "700", color: "#64748b", borderBottom: "2px solid #e5e7eb" }}>📊 Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => {
                const accuracy = d.quizzes_taken > 0 ? ((d.correct_answers / d.quizzes_taken) * 100).toFixed(0) : 0;
                return (
                  <tr key={i} style={{
                    background: i % 2 === 0 ? "white" : "#f8f9fa",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "white" : "#f8f9fa"}
                  >
                    <td style={{ padding: 12, fontWeight: "600", color: "#1e293b", borderBottom: "1px solid #e5e7eb" }}>{d.month}</td>
                    <td style={{ padding: 12, textAlign: "center", color: "#667eea", fontWeight: "600", borderBottom: "1px solid #e5e7eb" }}>
                      {Math.floor(d.practice_seconds / 60)}m
                    </td>
                    <td style={{ padding: 12, textAlign: "center", color: "#10b981", fontWeight: "600", borderBottom: "1px solid #e5e7eb" }}>
                      {d.ai_questions}
                    </td>
                    <td style={{ padding: 12, textAlign: "center", color: "#f59e0b", fontWeight: "600", borderBottom: "1px solid #e5e7eb" }}>
                      {d.quizzes_taken}
                    </td>
                    <td style={{ padding: 12, textAlign: "center", color: "#ef4444", fontWeight: "600", borderBottom: "1px solid #e5e7eb" }}>
                      {d.correct_answers}
                    </td>
                    <td style={{ padding: 12, textAlign: "center", fontWeight: "700", borderBottom: "1px solid #e5e7eb" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: 6,
                        background: accuracy >= 80 ? "#d1fae5" : accuracy >= 60 ? "#fef3c7" : "#fee2e2",
                        color: accuracy >= 80 ? "#065f46" : accuracy >= 60 ? "#92400e" : "#991b1b",
                        fontSize: 12
                      }}>
                        {accuracy}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}