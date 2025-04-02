const ctx = document.getElementById('pieChart').getContext('2d');
new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Housing', 'Food', 'Education', 'Savings'],
    datasets: [
      {
        data: [30, 25, 20, 25],
        backgroundColor: ['#ff6b81', '#4caf50', '#2196f3', '#ffc107'],
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  },
});
