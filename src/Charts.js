import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-moment';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ArcElement
);


const activityColors = {
    Housing: 'rgba(255, 99, 132, 0.5)',
    Energy: 'rgba(54, 162, 235, 0.5)',
    Transport: 'rgba(255, 206, 86, 0.5)',
    Finance: 'rgba(75, 192, 192, 0.5)',
    
  };
  

  const Charts = ({ data }) => {
     if (!data || Object.keys(data).length === 0 || !data.activity || !data.location || !data.date || !data.activityByLocation) {
      return <div></div>;
    }
  
    // Check for each specific dataset's existence and length
    const hasActivityData = data.activity && Object.keys(data.activity).length > 0;
    const hasLocationData = data.location && Object.keys(data.location).length > 0;
    const hasDateData = data.date && Object.keys(data.date).length > 0;
    const hasActivityByLocationData = data.activityByLocation && Object.keys(data.activityByLocation).length > 0;
    const hasDateByMonthData = data.dateByMonth && Object.keys(data.dateByMonth).length > 0;
    const hasDateByYearData = data.dateByYear && Object.keys(data.dateByYear).length > 0;
    const hasTypeOfInsightData = data.typeOfInsight && Object.keys(data.typeOfInsight).length > 0;
    const hasAgeRangeData = data.ageRange && Object.keys(data.ageRange).length > 0;
  
    // Function to generate a random color
    const generateRandomColor = () => {
      return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`;
    };
  
    const generateChartData = (labels, datasetLabel, dataPoints, isActivityChart = false) => {
      let backgroundColors;
  
      if (isActivityChart) {
        // Map each label to a specific color, defaulting to grey if the activity is not found
        backgroundColors = labels.map(label => activityColors[label] || 'rgba(128, 128, 128, 0.5)');
      } else {
        // For other charts, use a single color for all items by creating an array filled with the same color
        backgroundColors = Array(labels.length).fill('rgba(54, 162, 235, 0.5)');
      }
  
      // Ensure borderColor is also handled correctly as an array
      let borderColors = backgroundColors.map(color => {
        
        let parts = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d?.\d+)\)/);
        if (parts) {
          // Increase the alpha for border color
          return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, 1)`;
        }
        return color; // In case the regex match fails, return the original color
      });
  
      return {
        labels,
        datasets: [{
          label: datasetLabel,
          data: dataPoints,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        }],
      };
    };
  
    const generateChartDataForActivityByLocation = () => {
      const datasets = Object.keys(data.activityByLocation).map(activity => {
        const locationsData = data.activityByLocation[activity];
        return {
          label: activity,
          data: Object.keys(locationsData).map(location => locationsData[location]),
          backgroundColor: activityColors[activity] || generateRandomColor(), 
                };
             });
  
      return {
        labels: Object.keys(data.location), 
        datasets,
      };
    };

    const generateChartDataForDate = () => {
      const labels = Object.keys(data.date).sort(); // Labels are now in YYYY-MM format
      const dataPoints = labels.map(label => data.date[label]);
  
      return {
        labels,
        datasets: [{
          label: 'Number of People by Month',
          data: dataPoints,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }],
      };
    };

    const generatePieChartData = () => {
        const activities = Object.keys(data.activity);
        const counts = Object.values(data.activity);
        const total = counts.reduce((acc, curr) => acc + curr, 0); // Calculate total people involved in all activities
        const backgroundColors = activities.map(activity => activityColors[activity] || generateRandomColor());
    
        return {
          labels: activities,
          datasets: [{
            data: counts.map(count => (count / total) * 100), // Convert counts to percentage of total
            backgroundColor: backgroundColors,
            hoverOffset: 4,
          }],
        };
      };

      const generateChartDataForDateByMonth = () => {
        const labels = Object.keys(data.dateByMonth).sort(); // Ensure sorting for chronological order
        const dataPoints = labels.map(label => data.dateByMonth[label]);
    
        return {
          labels,
          datasets: [{
            label: 'Number of People by Month',
            data: dataPoints,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          }],
        };
      };
    
      const generateChartDataForDateByYear = () => {
        const labels = Object.keys(data.dateByYear).sort(); // Ensure sorting for chronological order
        const dataPoints = labels.map(label => data.dateByYear[label]);
    
        return {
          labels,
          datasets: [{
            label: 'Number of People by Year',
            data: dataPoints,
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
          }],
        };
      };

      const generateChartDataForTypeOfInsight = () => {
        const labels = Object.keys(data.typeOfInsight).sort();
        const dataPoints = labels.map(label => data.typeOfInsight[label]);
        const backgroundColors = labels.map(() => generateRandomColor()); 
      
        return {
          labels,
          datasets: [{
            label: 'Type of Insight',
            data: dataPoints,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace(/0.5\)$/, "1)")), 
            borderWidth: 1,
          }],
        };
      };
      
      const generateChartDataForAgeRange = () => {
        const labels = Object.keys(data.ageRange).sort();
        const dataPoints = labels.map(label => data.ageRange[label]);
        const backgroundColors = labels.map(() => generateRandomColor()); 
      
        return {
          labels,
          datasets: [{
            label: 'Age Range',
            data: dataPoints,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map(color => color.replace(/0.5\)$/, "1)")), // Increase opacity for border
            borderWidth: 1,
          }],
        };
      };
      
  
      return (
        <div>
        <h1 className="text-3xl font-semibold text-center pb-8 pt-8 bg-gray-800 text-white">Visualising only your data</h1>
        <div className="flex flex-wrap justify-center -mx-2">
          {hasActivityData && (
            <div className="w-full md:w-1/2 p-2">
              <h1 className="text-center font-bold">Activity Participation Share</h1>
              <div className="max-w-sm mx-auto">
                <Pie data={generatePieChartData()} />
              </div>
            </div>
          )}
           {hasDateByMonthData && (
        <div className="w-full md:w-1/2 p-2">
          <h1 className="text-center font-bold">Number of People by Month</h1>
          <Bar data={generateChartDataForDateByMonth()} options={{ scales: { y: { beginAtZero: true } } }} />
        </div>
      )}
      
      {hasDateByYearData && (
        <div className="w-full md:w-1/2 p-2">
          <h1 className="text-center font-bold">Number of People by Year</h1>
          <Bar data={generateChartDataForDateByYear()} options={{ scales: { y: { beginAtZero: true } } }} />
        </div>
      )}
          {hasActivityData && (
            <div className="w-full md:w-1/2 p-2">
              <h1 className="text-center font-bold">Number of People by Activity</h1>
              <Bar data={generateChartData(Object.keys(data.activity), 'Number of People by Activity', Object.values(data.activity), true)} options={{ scales: { y: { beginAtZero: true } } }} />
            </div>
          )}
          {hasLocationData && (
            <div className="w-full md:w-1/2 p-2">
              <h1 className="text-center font-bold">Number of People by Location</h1>
              <Bar data={generateChartData(Object.keys(data.location), 'Number of People by Location', Object.values(data.location))} options={{ scales: { y: { beginAtZero: true } } }} />
            </div>
          )}
          {hasTypeOfInsightData && (
            <div className="w-full md:w-1/2 p-2">
            <h2>Type of Insight</h2>
            <Bar data={generateChartDataForTypeOfInsight()} options={{ scales: { y: { beginAtZero: true } }}} />
          </div>
          )


          }
          {hasAgeRangeData && (
            <div className="w-full md:w-1/2 p-2">
            <h2>Age Range</h2>
            <Bar data={generateChartDataForAgeRange()} options={{ scales: { y: { beginAtZero: true } }}} />
          </div>

          )


          }
          {hasDateData && (
            <div className="w-full md:w-1/2 p-2">
            <h1 className="text-center font-bold">Number of People by Month</h1>
            <Bar data={generateChartDataForDate()} options={{ 
              scales: { 
                y: { beginAtZero: true }, 
                x: { 
                  type: 'category', 
                  title: { display: true, text: 'Month' }
                } 
              } 
            }} />
          </div>
          )}
          {hasActivityByLocationData && (
            <div className="w-full md:w-1/2 p-2">
              <h1 className="text-center font-bold">Number of People by Activity by Location</h1>
              <Bar data={generateChartDataForActivityByLocation()} options={{ scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } }} />
            </div>
          )}
        </div>
        </div>
      );
      
    };
  
  export default Charts;