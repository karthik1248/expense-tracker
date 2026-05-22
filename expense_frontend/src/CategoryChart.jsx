import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from "chartjs-plugin-datalabels"

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

function CategoryChart({ data, darkMode }) {
    const chartData = {
        labels: ["Food", "Transport", "Shopping", "Entertainment"],
        datasets: [
            {
                data: [
                    data.food,
                    data.transport,
                    data.shopping,
                    data.entertainment
                ],
                backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]
            }
        ]
    }

    const total = data.food + data.entertainment + data.shopping + data.transport

    return (
        <div
            className={
                darkMode
                    ? "bg-gray-800 p-4 rounded-xl"
                    : "bg-white p-4 rounded-xl"
            }
        >
            <h2 className='text-lg font-semibold mb-3'>
                Category Distribution
            </h2>
            <div className="w-64 h-64 mx-auto">
                <Pie data={chartData}
                    options={{
                        plugins: {

                            legend: {
                                labels: {
                                    color: darkMode ? "white" : "black"
                                }
                            },

                            datalabels: {
                                color: "white",

                                formatter: (value) => {
                                    const percentage = ((value / total) * 100).toFixed(0)

                                    return percentage > 0
                                        ? percentage + "%"
                                        : ""
                                }
                            }

                        }
                    }}
                />
            </div>
        </div>
    )
}

export default CategoryChart